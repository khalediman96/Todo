// __tests__/emailParsing.test.js
import { EmailParsingService } from '../lib/services/emailParsingService';

describe('EmailParsingService', () => {
  describe('parseEmail', () => {
    test('should parse a standard email with high priority', () => {
      const email = {
        id: '1',
        subject: 'URGENT: Fix production bug ASAP',
        sender: 'admin@company.com',
        content: 'We have a critical bug in production that needs immediate attention. Please fix this by end of day.',
        receivedAt: new Date('2024-01-15T10:00:00Z'),
        attachments: []
      };

      const result = EmailParsingService.parseEmail(email);

      expect(result.suggestedTitle).toBe('URGENT: Fix production bug ASAP');
      expect(result.suggestedPriority).toBe('high');
      expect(result.suggestedTags).toContain('company.com');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should extract due date from natural language', () => {
      const email = {
        id: '2',
        subject: 'Project Review',
        sender: 'manager@test.com',
        content: 'Please complete this task by tomorrow. The deadline is strict.',
        receivedAt: new Date('2024-01-15T10:00:00Z'),
        attachments: []
      };

      const result = EmailParsingService.parseEmail(email);

      expect(result.suggestedDueDate).toBeDefined();
      expect(result.suggestedDueDate.getDate()).toBe(16); // tomorrow from the 15th
    });

    test('should handle email with medium priority keywords', () => {
      const email = {
        id: '3',
        subject: 'Please review the document',
        sender: 'colleague@work.com',
        content: 'When you have time, please review this document and provide feedback.',
        receivedAt: new Date('2024-01-15T10:00:00Z'),
        attachments: []
      };

      const result = EmailParsingService.parseEmail(email);

      expect(result.suggestedPriority).toBe('medium');
      expect(result.suggestedTags).toContain('work.com');
    });

    test('should assign low priority to basic emails', () => {
      const email = {
        id: '4',
        subject: 'FYI: Weekly newsletter',
        sender: 'newsletter@info.com',
        content: 'Here is your weekly update with the latest news and information.',
        receivedAt: new Date('2024-01-15T10:00:00Z'),
        attachments: []
      };

      const result = EmailParsingService.parseEmail(email);

      expect(result.suggestedPriority).toBe('low');
    });

    test('should extract hashtags as tags', () => {
      const email = {
        id: '5',
        subject: 'Project Update',
        sender: 'pm@startup.io',
        content: 'Update on #project-alpha: we need to complete the #review phase by Friday.',
        receivedAt: new Date('2024-01-15T10:00:00Z'),
        attachments: []
      };

      const result = EmailParsingService.parseEmail(email);

      expect(result.suggestedTags).toContain('project-alpha');
      expect(result.suggestedTags).toContain('review');
      expect(result.suggestedTags).toContain('startup.io');
    });
  });

  describe('convertToTodoInput', () => {
    test('should convert parsed email to todo input format', () => {
      const email = {
        id: '6',
        subject: 'Complete quarterly report',
        sender: 'boss@company.com',
        content: 'Please complete the quarterly report by end of week.',
        receivedAt: new Date('2024-01-15T10:00:00Z'),
        attachments: []
      };

      const parseResult = EmailParsingService.parseEmail(email);
      const todoInput = EmailParsingService.convertToTodoInput(email, parseResult, {
        includeOriginalEmail: true
      });

      expect(todoInput.title).toBe('Complete quarterly report');
      expect(todoInput.description).toContain('From: boss@company.com');
      expect(todoInput.description).toContain('--- Original Email ---');
      expect(todoInput.priority).toBeDefined();
      expect(todoInput.status).toBe('new');
    });

    test('should use custom overrides when provided', () => {
      const email = {
        id: '7',
        subject: 'Original Subject',
        sender: 'sender@test.com',
        content: 'Original content',
        receivedAt: new Date('2024-01-15T10:00:00Z'),
        attachments: []
      };

      const parseResult = EmailParsingService.parseEmail(email);
      const customDate = new Date('2024-01-20T15:00:00Z');
      
      const todoInput = EmailParsingService.convertToTodoInput(email, parseResult, {
        customTitle: 'Custom Task Title',
        customPriority: 'high',
        customDueDate: customDate,
        customTags: ['custom', 'tags']
      });

      expect(todoInput.title).toBe('Custom Task Title');
      expect(todoInput.priority).toBe('high');
      expect(todoInput.dueDate).toBe(customDate);
      expect(todoInput.tags).toEqual(['custom', 'tags']);
    });
  });
});

// Run with: npm test __tests__/emailParsing.test.js
