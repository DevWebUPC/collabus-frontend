/**
 * Task Entity
 * Represents a task within a project
 */
export class Task {
  constructor({
    id = null,
    title = '',
    description = '',
    priority = 'medium',
    status = 'pending',
    assignedTo = null,
    projectId = null,
    dueDate = null,
    estimatedHours = 0,
    actualHours = 0,
    tags = [],
    createdAt = null,
    updatedAt = null,
    completedAt = null
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.assignedTo = assignedTo;
    this.projectId = projectId;
    this.dueDate = dueDate ? new Date(dueDate) : null;
    this.estimatedHours = estimatedHours;
    this.actualHours = actualHours;
    this.tags = tags;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    this.completedAt = completedAt ? new Date(completedAt) : null;
  }

  // Business logic methods
  isPending() {
    return this.status === 'pending';
  }

  isInProgress() {
    return this.status === 'in-progress';
  }

  isCompleted() {
    return this.status === 'completed';
  }

  isOverdue() {
    if (!this.dueDate || this.isCompleted()) return false;
    return new Date() > this.dueDate;
  }

  isUrgent() {
    return this.priority === 'high' || this.isOverdue();
  }

  getDaysUntilDue() {
    if (!this.dueDate) return null;
    const now = new Date();
    const diffTime = this.dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  markAsCompleted() {
    this.status = 'completed';
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  markAsInProgress() {
    this.status = 'in-progress';
    this.updatedAt = new Date();
  }

  addTime(hours) {
    if (hours > 0) {
      this.actualHours += hours;
      this.updatedAt = new Date();
    }
  }

  getPriorityColor() {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[this.priority] || colors.medium;
  }

  validate() {
    const errors = [];
    
    if (!this.title.trim()) {
      errors.push('Task title is required');
    }
    
    if (!this.projectId) {
      errors.push('Project ID is required');
    }
    
    if (this.estimatedHours < 0) {
      errors.push('Estimated hours cannot be negative');
    }
    
    if (this.actualHours < 0) {
      errors.push('Actual hours cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}