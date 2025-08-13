// lib/services/exportService.ts
import { Todo, ExportFormat } from '../../types/todo';

export type ExportFormatType = 'csv' | 'json' | 'pdf';

export class ExportService {
  static async exportTodos(todos: Todo[], format: ExportFormatType, options: any = {}): Promise<Blob> {
    switch (format) {
      case 'csv':
        return this.exportToCSV(todos, options);
      case 'json':
        return this.exportToJSON(todos, options);
      case 'pdf':
        return this.exportToPDF(todos, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private static exportToCSV(todos: Todo[], options: any = {}): Blob {
    const {
      includeCustomFields = true
    } = options;

    // Define CSV headers
    const headers = [
      'ID',
      'Title',
      'Description',
      'Status',
      'Priority',
      'Completed',
      'Progress',
      'Created At',
      'Updated At',
      'Due Date',
      'Tags',
      'Estimated Duration',
      'Actual Duration'
    ];

    

    

    if (includeCustomFields) {
      headers.push('Custom Column', 'Recurring', 'Recurring Type');
    }

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...todos.map(todo => this.todoToCSVRow(todo, { includeSubtasks, includeCustomFields }))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private static todoToCSVRow(todo: Todo, options: any): string {
    const {
      includeCustomFields = true
    } = options;

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const row = [
      escapeCSV(todo._id),
      escapeCSV(todo.title),
      escapeCSV(todo.description),
      escapeCSV(todo.status),
      escapeCSV(todo.priority),
      escapeCSV(todo.completed),
      escapeCSV(todo.progress),
      escapeCSV(todo.createdAt?.toISOString()),
      escapeCSV(todo.updatedAt?.toISOString()),
      escapeCSV(todo.dueDate?.toISOString()),
      escapeCSV(todo.tags?.join('; ')),
      escapeCSV(todo.estimatedDuration),
      escapeCSV(todo.actualDuration)
    ];

    

    

    if (includeCustomFields) {
      row.push(
        escapeCSV(todo.customColumn),
        escapeCSV(todo.isRecurring),
        escapeCSV(todo.recurringConfig?.type)
      );
    }

    return row.join(',');
  }

  private static exportToJSON(todos: Todo[], options: any = {}): Blob {
    const {
      includeMetadata = true,
      prettyPrint = true
    } = options;

    const exportData: any = {
      todos: todos,
      exportedAt: new Date().toISOString(),
      totalCount: todos.length,
      completedCount: todos.filter(t => t.completed).length
    };

    if (includeMetadata) {
      exportData.metadata = {
        version: '1.0',
        format: 'todo-export',
        priorityDistribution: this.getPriorityDistribution(todos),
        statusDistribution: this.getStatusDistribution(todos),
        tagsSummary: this.getTagsSummary(todos)
      };
    }

    const jsonString = prettyPrint 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);

    return new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  }

  private static async exportToPDF(todos: Todo[], options: any = {}): Promise<Blob> {
    const {
      includeHeader = true,
      includeSummary = true,
      groupBy = 'status' // 'status', 'priority', 'none'
    } = options;

    // For PDF generation, we'll create HTML and use CSS to make it print-friendly
    // In a real app, you might use a library like jsPDF or Puppeteer
    const html = this.generatePDFHTML(todos, { includeHeader, includeSummary, groupBy });
    
    // Create a simple PDF-like format using HTML
    // Note: For production, consider using a proper PDF library
    return new Blob([html], { type: 'text/html;charset=utf-8;' });
  }

  private static generatePDFHTML(todos: Todo[], options: any): string {
    const { includeHeader, includeSummary, groupBy } = options;
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Todo Export Report</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #ccc;
          padding-bottom: 20px;
        }
        .summary { 
          background: #f5f5f5; 
          padding: 15px; 
          margin-bottom: 30px; 
          border-radius: 5px;
        }
        .group { 
          margin-bottom: 30px; 
        }
        .group-title { 
          font-size: 18px; 
          font-weight: bold; 
          color: #444;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .todo-item { 
          margin-bottom: 15px; 
          padding: 10px; 
          border: 1px solid #ddd; 
          border-radius: 5px;
          background: white;
        }
        .todo-title { 
          font-weight: bold; 
          font-size: 16px;
          margin-bottom: 5px;
        }
        .todo-description { 
          margin-bottom: 10px; 
          color: #666;
        }
        .todo-meta { 
          font-size: 12px; 
          color: #888;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .priority-high { border-left: 4px solid #ef4444; }
        .priority-medium { border-left: 4px solid #f59e0b; }
        .priority-low { border-left: 4px solid #10b981; }
        .completed { opacity: 0.7; text-decoration: line-through; }
        .tags { 
          display: flex; 
          gap: 5px; 
          margin: 5px 0;
          flex-wrap: wrap;
        }
        .tag { 
          background: #e5e7eb; 
          padding: 2px 6px; 
          border-radius: 3px; 
          font-size: 11px;
        }
        .subtasks {
          margin-top: 10px;
          padding-left: 20px;
        }
        .subtask {
          font-size: 12px;
          margin: 2px 0;
        }
        @media print {
          body { margin: 0; }
          .todo-item { break-inside: avoid; }
        }
      </style>
    </head>
    <body>`;

    if (includeHeader) {
      html += `
      <div class="header">
        <h1>Todo Export Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Total Tasks: ${todos.length}</p>
      </div>`;
    }

    if (includeSummary) {
      const summary = this.generateSummary(todos);
      html += `
      <div class="summary">
        <h2>Summary</h2>
        <p><strong>Completed:</strong> ${summary.completed} / ${summary.total} (${summary.completionRate}%)</p>
        <p><strong>High Priority:</strong> ${summary.highPriority}</p>
        <p><strong>Medium Priority:</strong> ${summary.mediumPriority}</p>
        <p><strong>Low Priority:</strong> ${summary.lowPriority}</p>
        <p><strong>Most Common Tags:</strong> ${summary.topTags.join(', ')}</p>
      </div>`;
    }

    // Group todos
    const groupedTodos = this.groupTodos(todos, groupBy);
    
    Object.entries(groupedTodos).forEach(([groupName, groupTodos]) => {
      html += `
      <div class="group">
        <div class="group-title">${this.formatGroupName(groupName, groupBy)} (${groupTodos.length})</div>`;
      
      groupTodos.forEach(todo => {
        html += this.todoToHTML(todo);
      });
      
      html += `</div>`;
    });

    html += `
    </body>
    </html>`;

    return html;
  }

  private static todoToHTML(todo: Todo): string {
    const priorityClass = `priority-${todo.priority}`;
    const completedClass = todo.completed ? 'completed' : '';
    
    let html = `
    <div class="todo-item ${priorityClass} ${completedClass}">
      <div class="todo-title">${this.escapeHTML(todo.title)}</div>`;
    
    if (todo.description) {
      html += `<div class="todo-description">${this.escapeHTML(todo.description)}</div>`;
    }
    
    if (todo.tags && todo.tags.length > 0) {
      html += `<div class="tags">`;
      todo.tags.forEach(tag => {
        html += `<span class="tag">${this.escapeHTML(tag)}</span>`;
      });
      html += `</div>`;
    }
    
    if (todo.subtasks && todo.subtasks.length > 0) {
      html += `<div class="subtasks">`;
      html += `<strong>Subtasks (${todo.subtasks.filter(s => s.completed).length}/${todo.subtasks.length}):</strong>`;
      todo.subtasks.forEach(subtask => {
        const checkmark = subtask.completed ? '✓' : '○';
        html += `<div class="subtask">${checkmark} ${this.escapeHTML(subtask.title)}</div>`;
      });
      html += `</div>`;
    }
    
    html += `
      <div class="todo-meta">
        <span>Status: ${todo.status}</span>
        <span>Priority: ${todo.priority}</span>
        <span>Progress: ${todo.progress}%</span>`;
    
    if (todo.dueDate) {
      html += `<span>Due: ${new Date(todo.dueDate).toLocaleDateString()}</span>`;
    }
    
    if (todo.estimatedDuration) {
      html += `<span>Est. Duration: ${todo.estimatedDuration}min</span>`;
    }
    
    html += `
      </div>
    </div>`;
    
    return html;
  }

  private static groupTodos(todos: Todo[], groupBy: string): { [key: string]: Todo[] } {
    if (groupBy === 'none') {
      return { 'All Tasks': todos };
    }
    
    return todos.reduce((groups, todo) => {
      let key: string;
      
      switch (groupBy) {
        case 'status':
          key = todo.status;
          break;
        case 'priority':
          key = todo.priority;
          break;
        case 'completed':
          key = todo.completed ? 'Completed' : 'Pending';
          break;
        default:
          key = 'All Tasks';
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(todo);
      
      return groups;
    }, {} as { [key: string]: Todo[] });
  }

  private static formatGroupName(groupName: string, groupBy: string): string {
    if (groupBy === 'priority') {
      return `${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Priority`;
    }
    if (groupBy === 'status') {
      return `Status: ${groupName.charAt(0).toUpperCase() + groupName.slice(1)}`;
    }
    return groupName;
  }

  private static generateSummary(todos: Todo[]): any {
    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const priorityCounts = todos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const tagCounts = todos.flatMap(t => t.tags || []).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    return {
      completed,
      total,
      completionRate,
      highPriority: priorityCounts.high || 0,
      mediumPriority: priorityCounts.medium || 0,
      lowPriority: priorityCounts.low || 0,
      topTags
    };
  }

  private static getPriorityDistribution(todos: Todo[]): { [key: string]: number } {
    return todos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private static getStatusDistribution(todos: Todo[]): { [key: string]: number } {
    return todos.reduce((acc, todo) => {
      acc[todo.status] = (acc[todo.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private static getTagsSummary(todos: Todo[]): { [key: string]: number } {
    return todos.flatMap(t => t.tags || []).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Helper method to trigger download
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Method to generate filename
  static generateFilename(format: ExportFormatType, prefix: string = 'todos'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}_${timestamp}.${format}`;
  }
}

