/**
 * Academic Level Entity
 * Domain entity representing academic/professional levels
 */
export class AcademicLevel {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.level = data.level || 0;
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
  }

  // Business Logic Methods
  
  /**
   * Check if the level is active
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
   * Get level information for dropdown
   * @returns {Object}
   */
  getOptionData() {
    return {
      label: this.name,
      value: this.id,
      description: this.description,
      level: this.level
    };
  }

  /**
   * Compare levels
   * @param {AcademicLevel} otherLevel 
   * @returns {number} -1 if this is lower, 0 if equal, 1 if higher
   */
  compareTo(otherLevel) {
    if (this.level < otherLevel.level) return -1;
    if (this.level > otherLevel.level) return 1;
    return 0;
  }

  /**
   * Check if this level is higher than another
   * @param {AcademicLevel} otherLevel 
   * @returns {boolean}
   */
  isHigherThan(otherLevel) {
    return this.level > otherLevel.level;
  }

  /**
   * Get level category (student, professional, expert)
   * @returns {string}
   */
  getCategory() {
    if (this.level <= 2) return 'student';
    if (this.level <= 4) return 'professional';
    return 'expert';
  }

  /**
   * Validate level data
   * @returns {boolean}
   */
  isValid() {
    return this.name && this.name.length > 0 && this.level > 0;
  }
}