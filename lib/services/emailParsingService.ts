// lib/services/emailParsingService.ts
import { EmailTask, EmailParseResult, CreateTodoInput } from '../../types/todo';

export class EmailParsingService {
  // Keywords that indicate high priority
  private static readonly HIGH_PRIORITY_KEYWORDS = [
    'urgent', 'asap', 'emergency', 'critical', 'important', 'deadline',
    'rush', 'priority', 'immediate', 'quickly', 'soon'
  ];

  // Keywords that indicate medium priority
  private static readonly MEDIUM_PRIORITY_KEYWORDS = [
    'needed', 'required', 'should', 'would like', 'please', 'when possible'
  ];

  // Keywords that indicate dates/deadlines
  private static readonly DATE_KEYWORDS = [
    'by', 'before', 'until', 'deadline', 'due', 'complete by', 'finish by',
    'end of', 'eod', 'end of day', 'tomorrow', 'today', 'next week', 'this week'
  ];

  // Action words that suggest tasks
  private static readonly ACTION_KEYWORDS = [
    'review', 'complete', 'finish', 'submit', 'send', 'create', 'update',
    'call', 'email', 'meet', 'schedule', 'prepare', 'check', 'verify',
    'approve', 'process', 'follow up', 'followup'
  ];

  static parseEmail(email: EmailTask): EmailParseResult {
    const content = `${email.subject} ${email.content}`.toLowerCase();
    
    // Extract suggested title
    const suggestedTitle = this.extractTitle(email);
    
    // Extract suggested description
    const suggestedDescription = this.extractDescription(email);
    
    // Determine priority
    const suggestedPriority = this.determinePriority(content);
    
    // Extract due date
    const suggestedDueDate = this.extractDueDate(content, email.receivedAt);
    
    // Extract tags
    const suggestedTags = this.extractTags(email);
    
    // Calculate confidence based on various factors
    const confidence = this.calculateConfidence(email, content);

    return {
      suggestedTitle,
      suggestedDescription,
      suggestedPriority,
      suggestedDueDate,
      suggestedTags,
      confidence
    };
  }

  private static extractTitle(email: EmailTask): string {
    let title = email.subject;
    
    // Remove common email prefixes
    title = title.replace(/^(re:|fw:|fwd:)\s*/i, '');
    
    // Remove HTML tags and decode HTML entities
    title = title.replace(/<[^>]*>/g, '');
    title = title.replace(/&[^;]+;/g, ' ');
    
    // Clean up extra whitespace
    title = title.replace(/\s+/g, ' ').trim();
    
    // Ensure title respects database constraints (max 200 chars for Todo model)
    const maxLength = 190; // Leave some buffer for ellipsis
    if (title.length > maxLength) {
      title = title.substring(0, maxLength).trim() + '...';
    }
    
    // If subject is empty or too short, use first line of content
    if (!title.trim() || title.length < 3) {
      let firstLine = email.content.split('\n')[0];
      // Clean first line similarly
      firstLine = firstLine.replace(/<[^>]*>/g, '');
      firstLine = firstLine.replace(/&[^;]+;/g, ' ');
      firstLine = firstLine.replace(/\s+/g, ' ').trim();
      
      title = firstLine.length > maxLength ? firstLine.substring(0, maxLength).trim() + '...' : firstLine;
    }
    
    return title.trim() || 'Email Task';
  }

  private static extractDescription(email: EmailTask): string {
    let description = `From: ${email.sender}\nReceived: ${email.receivedAt.toLocaleString()}\n\n`;
    
    // Clean up email content
    let content = email.content;
    
    // Remove email signatures (basic detection)
    const signatureIndicators = [
      'best regards', 'sincerely', 'thank you', 'thanks',
      'sent from my', 'regards', 'cheers'
    ];
    
    const lines = content.split('\n');
    let contentEndIndex = lines.length;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].toLowerCase().trim();
      if (signatureIndicators.some(indicator => line.includes(indicator))) {
        contentEndIndex = i;
        break;
      }
    }
    
    content = lines.slice(0, contentEndIndex).join('\n').trim();
    
    // Limit description length
    if (content.length > 500) {
      content = content.substring(0, 497) + '...';
    }
    
    description += content;
    
    return description;
  }

  private static determinePriority(content: string): 'low' | 'medium' | 'high' {
    const highPriorityFound = this.HIGH_PRIORITY_KEYWORDS.some(keyword => 
      content.includes(keyword)
    );
    
    if (highPriorityFound) {
      return 'high';
    }
    
    const mediumPriorityFound = this.MEDIUM_PRIORITY_KEYWORDS.some(keyword => 
      content.includes(keyword)
    );
    
    if (mediumPriorityFound) {
      return 'medium';
    }
    
    // Check if it contains action words (suggests it's a task)
    const hasActionWords = this.ACTION_KEYWORDS.some(keyword => 
      content.includes(keyword)
    );
    
    return hasActionWords ? 'medium' : 'low';
  }

  private static extractDueDate(content: string, receivedAt: Date): Date | undefined {
    const now = new Date();
    const received = new Date(receivedAt);
    
    // Simple date extraction patterns
    const patterns = [
      // "by tomorrow", "by today"
      /by\s+(tomorrow|today)/i,
      // "by end of week", "by eod"
      /by\s+(end\s+of\s+week|eod|end\s+of\s+day)/i,
      // "by Friday", "by next week"
      /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s+week)/i,
      // ISO date format
      /\b\d{4}-\d{2}-\d{2}\b/,
      // US date format
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
      // "deadline tomorrow", "due today"
      /(deadline|due)\s+(tomorrow|today)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const matchText = match[0].toLowerCase();
        
        if (matchText.includes('today')) {
          const today = new Date(now);
          today.setHours(23, 59, 59, 999);
          return today;
        }
        
        if (matchText.includes('tomorrow')) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(23, 59, 59, 999);
          return tomorrow;
        }
        
        if (matchText.includes('end of week') || matchText.includes('eod')) {
          const endOfWeek = new Date(now);
          const daysUntilFriday = (5 - now.getDay() + 7) % 7;
          endOfWeek.setDate(endOfWeek.getDate() + daysUntilFriday);
          endOfWeek.setHours(23, 59, 59, 999);
          return endOfWeek;
        }
        
        if (matchText.includes('next week')) {
          const nextWeek = new Date(now);
          nextWeek.setDate(nextWeek.getDate() + 7);
          nextWeek.setHours(23, 59, 59, 999);
          return nextWeek;
        }
        
        // Try to parse ISO or US date formats
        if (match[0].match(/\d{4}-\d{2}-\d{2}/) || match[0].match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
          try {
            const parsedDate = new Date(match[0]);
            if (!isNaN(parsedDate.getTime()) && parsedDate > received) {
              parsedDate.setHours(23, 59, 59, 999);
              return parsedDate;
            }
          } catch {
            // Invalid date format, continue
          }
        }
      }
    }
    
    return undefined;
  }

  private static extractTags(email: EmailTask): string[] {
    const tags: string[] = [];
    const content = `${email.subject} ${email.content}`.toLowerCase();
    
    // Add sender domain as tag
    const senderDomain = email.sender.split('@')[1];
    if (senderDomain) {
      tags.push(senderDomain);
    }
    
    // Extract project names (words starting with #)
    const hashtagMatches = content.match(/#\w+/g);
    if (hashtagMatches) {
      tags.push(...hashtagMatches.map(tag => tag.substring(1)));
    }
    
    // Extract common project/category keywords
    const categoryKeywords = [
      'meeting', 'report', 'review', 'project', 'task', 'bug', 'feature',
      'support', 'client', 'invoice', 'payment', 'contract', 'proposal'
    ];
    
    categoryKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Remove duplicates and limit to 5 tags
    return [...new Set(tags)].slice(0, 5);
  }

  private static calculateConfidence(email: EmailTask, content: string): number {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence if subject contains action words
    const hasActionInSubject = this.ACTION_KEYWORDS.some(keyword => 
      email.subject.toLowerCase().includes(keyword)
    );
    if (hasActionInSubject) confidence += 0.2;
    
    // Higher confidence if content has clear priority indicators
    const hasPriorityKeywords = [...this.HIGH_PRIORITY_KEYWORDS, ...this.MEDIUM_PRIORITY_KEYWORDS]
      .some(keyword => content.includes(keyword));
    if (hasPriorityKeywords) confidence += 0.1;
    
    // Higher confidence if date keywords are found
    const hasDateKeywords = this.DATE_KEYWORDS.some(keyword => content.includes(keyword));
    if (hasDateKeywords) confidence += 0.1;
    
    // Lower confidence if email is very short
    if (email.content.length < 50) confidence -= 0.2;
    
    // Lower confidence if email is very long (might be newsletter/automated)
    if (email.content.length > 2000) confidence -= 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }

  static convertToTodoInput(email: EmailTask, parseResult: EmailParseResult, options: {
    includeOriginalEmail?: boolean;
    customTitle?: string;
    customDescription?: string;
    customPriority?: 'low' | 'medium' | 'high';
    customDueDate?: Date;
    customTags?: string[];
  } = {}): CreateTodoInput {
    let title = options.customTitle || parseResult.suggestedTitle;
    
    // Ensure title respects database constraints (max 200 chars)
    if (title.length > 190) {
      title = title.substring(0, 190).trim() + '...';
    }
    
    let description = options.customDescription || parseResult.suggestedDescription;
    if (options.includeOriginalEmail) {
      const originalEmail = `\n\n--- Original Email ---\nSubject: ${email.subject}\nFrom: ${email.sender}\n\n${email.content}`;
      const combinedDescription = description + originalEmail;
      
      // Ensure description respects database constraints (max 500 chars)
      if (combinedDescription.length > 500) {
        const availableSpace = 500 - originalEmail.length - 20; // Reserve space for "..." and original email
        if (availableSpace > 0) {
          description = description.substring(0, availableSpace).trim() + '...' + originalEmail;
        } else {
          // If original email is too long, truncate it
          description = description.substring(0, 200).trim() + '...\n\n--- Original Email ---\nSubject: ' 
            + email.subject.substring(0, 50) + (email.subject.length > 50 ? '...' : '') 
            + '\nFrom: ' + email.sender.substring(0, 50) + (email.sender.length > 50 ? '...' : '')
            + '\n\n' + email.content.substring(0, 150) + (email.content.length > 150 ? '...' : '');
        }
      } else {
        description = combinedDescription;
      }
    } else if (description.length > 500) {
      description = description.substring(0, 497).trim() + '...';
    }

    return {
      title,
      description,
      priority: options.customPriority || parseResult.suggestedPriority,
      dueDate: options.customDueDate || parseResult.suggestedDueDate,
      tags: options.customTags || parseResult.suggestedTags,
      status: 'new'
    };
  }
}
