import { ProjectArea } from '../domain/model/project-area.entity.js';

/**
 * Project Area Assembler
 * Transforms data between API and Domain layers
 */
export class ProjectAreaAssembler {
  /**
   * Transform API response to Domain Entity
   * @param {Object} apiData - Raw API data
   * @returns {ProjectArea} Domain entity
   */
  static fromApiToEntity(apiData) {
    if (!apiData) return null;
    
    return new ProjectArea({
      id: apiData.id,
      name: apiData.name,
      description: apiData.description,
      active: apiData.active,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt
    });
  }

  /**
   * Transform array of API responses to array of Domain Entities
   * @param {Array} apiDataArray - Array of raw API data
   * @returns {Array<ProjectArea>} Array of domain entities
   */
  static fromApiArrayToEntityArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    
    return apiDataArray
      .map(apiData => this.fromApiToEntity(apiData))
      .filter(entity => entity !== null);
  }

  /**
   * Transform Domain Entity to API request format
   * @param {ProjectArea} entity - Domain entity
   * @returns {Object} API request data
   */
  static fromEntityToApi(entity) {
    if (!entity) return null;
    
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      active: entity.active,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString()
    };
  }

  /**
   * Transform Domain Entity to dropdown option
   * @param {ProjectArea} entity - Domain entity
   * @returns {Object} Dropdown option
   */
  static fromEntityToOption(entity) {
    if (!entity) return null;
    
    return entity.getOptionData();
  }

  /**
   * Transform array of Domain Entities to dropdown options
   * @param {Array<ProjectArea>} entities - Array of domain entities
   * @returns {Array<Object>} Array of dropdown options
   */
  static fromEntityArrayToOptions(entities) {
    if (!Array.isArray(entities)) return [];
    
    return entities
      .filter(entity => entity && entity.isActive())
      .map(entity => this.fromEntityToOption(entity))
      .filter(option => option !== null);
  }
}