import { Task } from '../domain/model/task.entity.js';

/**
 * Task Assembler
 * Transforms data between API and domain entities
 */
export class TaskAssembler {
  /**
   * Transform API response to Task entity
   * @param {Object} apiData - Raw API data
   * @returns {Task} Task entity
   */
  static fromApiToEntity(apiData) {
    if (!apiData) return null;

    return new Task({
      id: apiData.id,
      title: apiData.title || '',
      description: apiData.description || '',
      priority: apiData.priority || 'medium',
      status: apiData.status || 'pending',
      assignedTo: apiData.assignedTo,
      projectId: apiData.projectId,
      dueDate: apiData.dueDate,
      estimatedHours: apiData.estimatedHours || 0,
      actualHours: apiData.actualHours || 0,
      tags: apiData.tags || [],
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      completedAt: apiData.completedAt
    });
  }

  /**
   * Transform Task entity to API format
   * @param {Task} entity - Task entity
   * @returns {Object} API formatted data
   */
  static fromEntityToApi(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      priority: entity.priority,
      status: entity.status,
      assignedTo: entity.assignedTo,
      projectId: entity.projectId,
      dueDate: entity.dueDate?.toISOString(),
      estimatedHours: entity.estimatedHours,
      actualHours: entity.actualHours,
      tags: entity.tags,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
      completedAt: entity.completedAt?.toISOString()
    };
  }

  /**
   * Transform API response array to Task entities array
   * @param {Array} apiDataArray - Array of raw API data
   * @returns {Array<Task>} Array of Task entities
   */
  static fromApiArrayToEntityArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    return apiDataArray.map(this.fromApiToEntity);
  }

  /**
   * Transform Task entities array to API format array
   * @param {Array<Task>} entityArray - Array of Task entities
   * @returns {Array} Array of API formatted data
   */
  static fromEntityArrayToApiArray(entityArray) {
    if (!Array.isArray(entityArray)) return [];
    return entityArray.map(this.fromEntityToApi);
  }
}