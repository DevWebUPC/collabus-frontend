/**
 * Milestone Entity
 * Represents a project milestone
 */
export class Milestone {
  constructor({
    id = null,
    title = '',
    description = '',
    dueDate = null,
    status = 'pending',
    projectId = null,
    progress = 0,
    deliverables = [],
    createdAt = null,
    updatedAt = null,
    completedAt = null
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate ? new Date(dueDate) : null;
    this.status = status;
    this.projectId = projectId;
    this.progress = progress;
    this.deliverables = deliverables;
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

  getDaysUntilDue() {
    if (!this.dueDate) return null;
    const now = new Date();
    const diffTime = this.dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  updateProgress(newProgress) {
    if (newProgress >= 0 && newProgress <= 100) {
      this.progress = newProgress;
      this.updatedAt = new Date();
      
      if (newProgress === 100 && this.status !== 'completed') {
        this.markAsCompleted();
      } else if (newProgress > 0 && this.status === 'pending') {
        this.status = 'in-progress';
      }
    }
  }

  markAsCompleted() {
    this.status = 'completed';
    this.progress = 100;
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  addDeliverable(deliverable) {
    this.deliverables.push(deliverable);
    this.updatedAt = new Date();
  }

  removeDeliverable(deliverableId) {
    this.deliverables = this.deliverables.filter(d => d.id !== deliverableId);
    this.updatedAt = new Date();
  }

  validate() {
    const errors = [];
    
    if (!this.title.trim()) {
      errors.push('Milestone title is required');
    }
    
    if (!this.projectId) {
      errors.push('Project ID is required');
    }
    
    if (this.progress < 0 || this.progress > 100) {
      errors.push('Progress must be between 0 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}