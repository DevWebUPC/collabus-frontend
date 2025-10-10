export class Notification {
  constructor({
    id = null,
    message = '',
    type = '',
    userId = null,
    projectId = null,
    createdAt = null,
    readAt = null
  }) {
    this.id = id;
    this.message = message;
    this.type = type;
    this.userId = userId;
    this.projectId = projectId;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.readAt = readAt ? new Date(readAt) : null;
  }

  // Business logic methods
  isRead() {
    return this.readAt !== null;
  }

  markAsRead() {
    if (!this.readAt) {
      this.readAt = new Date();
    }
  }

  isRecent(daysThreshold = 7) {
    const now = new Date();
    const threshold = new Date(now.getTime() - (daysThreshold * 24 * 60 * 60 * 1000));
    return this.createdAt > threshold;
  }

  getTypeDisplay() {
    const typeMap = {
      'task_completed': 'Task Completed',
      'task_assigned': 'Task Assigned',
      'milestone_reminder': 'Milestone Reminder',
      'requirement_update': 'Requirement Update',
      'review_scheduled': 'Review Scheduled',
      'deadline_approaching': 'Deadline Approaching'
    };
    return typeMap[this.type] || 'Notification';
  }

  getFormattedDate() {
    return this.createdAt.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  belongsToUser(userId) {
    return this.userId === userId;
  }

  belongsToProject(projectId) {
    return this.projectId === projectId;
  }

  // Update methods
  updateMessage(newMessage) {
    if (typeof newMessage === 'string' && newMessage.trim()) {
      this.message = newMessage.trim();
    }
  }

  updateType(newType) {
    if (typeof newType === 'string' && newType.trim()) {
      this.type = newType.trim();
    }
  }
}