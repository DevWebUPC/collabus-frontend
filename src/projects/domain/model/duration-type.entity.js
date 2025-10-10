/**
 * Duration Type Entity
 * Domain entity representing duration types for projects
 */
export class DurationType {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.value = data.value || '';
    this.multiplier = data.multiplier || 1; // Days multiplier for calculations
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
  }

  // Business Logic Methods
  
  /**
   * Check if the duration type is active
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
   * Get duration type information for dropdown
   * @returns {Object}
   */
  getOptionData() {
    return {
      label: this.name,
      value: this.value,
      multiplier: this.multiplier
    };
  }

  /**
   * Convert duration to days
   * @param {number} quantity 
   * @returns {number} Total days
   */
  convertToDays(quantity) {
    return quantity * this.multiplier;
  }

  /**
   * Convert days to this duration type
   * @param {number} days 
   * @returns {number} Quantity in this duration type
   */
  convertFromDays(days) {
    return Math.round(days / this.multiplier);
  }

  /**
   * Get duration type category
   * @returns {string}
   */
  getCategory() {
    if (this.multiplier <= 7) return 'short-term';
    if (this.multiplier <= 90) return 'medium-term';
    return 'long-term';
  }

  /**
   * Format duration display
   * @param {number} quantity 
   * @returns {string}
   */
  formatDuration(quantity) {
    return `${quantity} ${this.name.toLowerCase()}`;
  }

  /**
   * Validate duration type data
   * @returns {boolean}
   */
  isValid() {
    return this.name && this.value && this.multiplier > 0;
  }
}