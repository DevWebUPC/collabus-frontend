import { Category } from '../domain/model/category.entity.js';

/**
 * Category Assembler
 * Transforms data between API and domain entities
 */
export class CategoryAssembler {
  /**
   * Transform API response to Category entity
   * @param {Object} apiData - Raw API data
   * @returns {Category} Category entity
   */
  static fromApiToEntity(apiData) {
    if (!apiData) return null;

    return new Category({
      id: apiData.id,
      name: apiData.name || '',
      description: apiData.description || '',
      color: apiData.color || '#6C63FF',
      icon: apiData.icon || 'pi pi-folder',
      isActive: apiData.isActive !== undefined ? apiData.isActive : true,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt
    });
  }

  /**
   * Transform Category entity to API format
   * @param {Category} entity - Category entity
   * @returns {Object} API formatted data
   */
  static fromEntityToApi(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      color: entity.color,
      icon: entity.icon,
      isActive: entity.isActive,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString()
    };
  }

  /**
   * Transform API response array to Category entities array
   * @param {Array} apiDataArray - Array of raw API data
   * @returns {Array<Category>} Array of Category entities
   */
  static fromApiArrayToEntityArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    return apiDataArray.map(this.fromApiToEntity);
  }

  /**
   * Transform Category entities array to API format array
   * @param {Array<Category>} entityArray - Array of Category entities
   * @returns {Array} Array of API formatted data
   */
  static fromEntityArrayToApiArray(entityArray) {
    if (!Array.isArray(entityArray)) return [];
    return entityArray.map(this.fromEntityToApi);
  }
}