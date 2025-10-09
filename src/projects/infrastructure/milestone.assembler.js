import { Milestone } from '../domain/model/milestone.entity.js';

/**
 * Milestone Assembler
 * Transforms data between API and domain entities
 */
export class MilestoneAssembler {
  /**
   * Transform API response to Milestone entity
   * @param {Object} apiData - Raw API data
   * @returns {Milestone} Milestone entity
   */
  static fromApiToEntity(apiData) {
    if (!apiData) return null;

    return new Milestone({
      id: apiData.id,
      title: apiData.title || '',
      description: apiData.description || '',
      dueDate: apiData.dueDate,
      status: apiData.status || 'pending',
      projectId: apiData.projectId,
      progress: apiData.progress || 0,
      deliverables: apiData.deliverables || [],
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      completedAt: apiData.completedAt
    });
  }

  /**
   * Transform Milestone entity to API format
   * @param {Milestone} entity - Milestone entity
   * @returns {Object} API formatted data
   */
  static fromEntityToApi(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      dueDate: entity.dueDate?.toISOString(),
      status: entity.status,
      projectId: entity.projectId,
      progress: entity.progress,
      deliverables: entity.deliverables,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
      completedAt: entity.completedAt?.toISOString()
    };
  }

  /**
   * Transform API response array to Milestone entities array
   * @param {Array} apiDataArray - Array of raw API data
   * @returns {Array<Milestone>} Array of Milestone entities
   */
  static fromApiArrayToEntityArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    return apiDataArray.map(this.fromApiToEntity);
  }

  /**
   * Transform Milestone entities array to API format array
   * @param {Array<Milestone>} entityArray - Array of Milestone entities
   * @returns {Array} Array of API formatted data
   */
  static fromEntityArrayToApiArray(entityArray) {
    if (!Array.isArray(entityArray)) return [];
    return entityArray.map(this.fromEntityToApi);
  }
}