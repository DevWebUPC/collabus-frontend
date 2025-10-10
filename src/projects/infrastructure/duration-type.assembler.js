import { DurationType } from '../domain/model/duration-type.entity.js';

/**
 * Duration Type Assembler
 * Transforms data between API and Domain layers
 */
export class DurationTypeAssembler {
  /**
   * Transform API response to Domain Entity
   * @param {Object} apiData - Raw API data
   * @returns {DurationType} Domain entity
   */
  static fromApiToEntity(apiData) {
    if (!apiData) return null;
    
    return new DurationType({
      id: apiData.id,
      name: apiData.name,
      value: apiData.value,
      multiplier: apiData.multiplier,
      active: apiData.active,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt
    });
  }

  /**
   * Transform array of API responses to array of Domain Entities
   * @param {Array} apiDataArray - Array of raw API data
   * @returns {Array<DurationType>} Array of domain entities
   */
  static fromApiArrayToEntityArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    
    return apiDataArray
      .map(apiData => this.fromApiToEntity(apiData))
      .filter(entity => entity !== null)
      .sort((a, b) => a.multiplier - b.multiplier); // Sort by multiplier (shortest first)
  }

  /**
   * Transform Domain Entity to API request format
   * @param {DurationType} entity - Domain entity
   * @returns {Object} API request data
   */
  static fromEntityToApi(entity) {
    if (!entity) return null;
    
    return {
      id: entity.id,
      name: entity.name,
      value: entity.value,
      multiplier: entity.multiplier,
      active: entity.active,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString()
    };
  }

  /**
   * Transform Domain Entity to dropdown option
   * @param {DurationType} entity - Domain entity
   * @returns {Object} Dropdown option
   */
  static fromEntityToOption(entity) {
    if (!entity) return null;
    
    return entity.getOptionData();
  }

  /**
   * Transform array of Domain Entities to dropdown options
   * @param {Array<DurationType>} entities - Array of domain entities
   * @returns {Array<Object>} Array of dropdown options
   */
  static fromEntityArrayToOptions(entities) {
    if (!Array.isArray(entities)) return [];
    
    return entities
      .filter(entity => entity && entity.isActive())
      .map(entity => this.fromEntityToOption(entity))
      .filter(option => option !== null);
  }

  /**
   * Find duration type by value
   * @param {Array<DurationType>} entities - Array of domain entities
   * @param {string} value - Duration type value to find
   * @returns {DurationType|null} Found entity or null
   */
  static findByValue(entities, value) {
    if (!Array.isArray(entities) || !value) return null;
    
    return entities.find(entity => entity.value === value) || null;
  }

  /**
   * Calculate total days from quantity and duration type
   * @param {Array<DurationType>} entities - Array of domain entities
   * @param {number} quantity - Duration quantity
   * @param {string} typeValue - Duration type value
   * @returns {number} Total days
   */
  static calculateTotalDays(entities, quantity, typeValue) {
    const durationType = this.findByValue(entities, typeValue);
    if (!durationType || !quantity) return 0;
    
    return durationType.convertToDays(quantity);
  }
}