/**
 * Collaborator Entity
 * Domain entity representing a project collaborator
 */
export class Collaborator {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || '';
    this.avatar = data.avatar || null;
    this.joinedAt = data.joinedAt ? new Date(data.joinedAt) : null;
    this.status = data.status || 'active'; // active, inactive, pending
    this.skills = data.skills || [];
    this.contribution = data.contribution || 0; // percentage or points
    this.tasksAssigned = data.tasksAssigned || 0;
    this.tasksCompleted = data.tasksCompleted || 0;
    this.projectId = data.projectId || '';
  }

  // Business Logic Methods
  
  /**
   * Check if collaborator is active
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Check if collaborator is pending approval
   * @returns {boolean}
   */
  isPending() {
    return this.status === 'pending';
  }

  /**
   * Get completion rate for assigned tasks
   * @returns {number} Percentage of completed tasks
   */
  getCompletionRate() {
    if (this.tasksAssigned === 0) return 0;
    return Math.round((this.tasksCompleted / this.tasksAssigned) * 100);
  }

  /**
   * Get collaborator initials for avatar
   * @returns {string}
   */
  getInitials() {
    if (!this.name) return '';
    return this.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Check if collaborator belongs to a specific project
   * @param {string} projectId 
   * @returns {boolean}
   */
  belongsToProject(projectId) {
    return this.projectId === projectId;
  }

  /**
   * Check if collaborator has a specific skill
   * @param {string} skill 
   * @returns {boolean}
   */
  hasSkill(skill) {
    return this.skills.some(s => 
      s.toLowerCase().includes(skill.toLowerCase())
    );
  }

  /**
   * Get formatted join date
   * @returns {string}
   */
  getFormattedJoinDate() {
    if (!this.joinedAt) return '';
    return this.joinedAt.toLocaleDateString();
  }

  /**
   * Update collaborator status
   * @param {string} newStatus 
   */
  updateStatus(newStatus) {
    this.status = newStatus;
  }

  /**
   * Update task statistics
   * @param {number} assigned 
   * @param {number} completed 
   */
  updateTaskStats(assigned, completed) {
    this.tasksAssigned = assigned;
    this.tasksCompleted = completed;
  }
}