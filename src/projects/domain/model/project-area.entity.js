/**
 * Project Area Entity
 * Domain entity representing a project area/category
 */
export class ProjectArea {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
  }

  // Business Logic Methods
  
  /**
   * Check if the area is active
   * @returns {boolean}
   */
  isActive() {
    return this.active === true;
  }

  /**
   * Get display name for UI
   * @returns {string}
   */
  getDisplayName() {
    return this.name;
  }

  /**
   * Get area information for dropdown
   * @returns {Object}
   */
  getOptionData() {
    return {
      label: this.name,
      value: this.id,
      description: this.description
    };
  }

  /**
   * Validate area data
   * @returns {boolean}
   */
  isValid() {
    return this.name && this.name.length > 0;
  }

  /**
   * Get formatted creation date
   * @returns {string}
   */
  getFormattedCreatedAt() {
    if (!this.createdAt) return '';
    return this.createdAt.toLocaleDateString();
  }
}