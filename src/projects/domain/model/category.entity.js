/**
 * Category Entity
 * Represents a project category
 */
export class Category {
  constructor({
    id = null,
    name = '',
    description = '',
    color = '#6C63FF',
    icon = 'pi pi-folder',
    isActive = true,
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.color = color;
    this.icon = icon;
    this.isActive = isActive;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  // Business logic methods
  isEnabled() {
    return this.isActive;
  }

  disable() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  enable() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  updateColor(newColor) {
    if (this.isValidColor(newColor)) {
      this.color = newColor;
      this.updatedAt = new Date();
    }
  }

  isValidColor(color) {
    // Basic hex color validation
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  validate() {
    const errors = [];
    
    if (!this.name.trim()) {
      errors.push('Category name is required');
    }
    
    if (!this.isValidColor(this.color)) {
      errors.push('Invalid color format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}