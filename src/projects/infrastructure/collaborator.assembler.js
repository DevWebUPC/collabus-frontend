import { Collaborator } from '../domain/model/collaborator.entity.js';

/**
 * Collaborator Assembler
 * Transforms data between API and domain entities
 */
export class CollaboratorAssembler {
  /**
   * Transform API response to Collaborator entity
   * @param {Object} apiData - Raw API data (includes both collaborator and collaboration data)
   * @returns {Collaborator} Collaborator entity
   */
  static fromApiToEntity(apiData) {
    if (!apiData) return null;

    return new Collaborator({
      id: apiData.id,
      name: apiData.name || '',
      email: apiData.email || '',
      role: apiData.role || '', // From collaboration data
      avatar: apiData.avatar || null,
      joinedAt: apiData.joinedAt, // From collaboration data
      status: apiData.collaborationStatus || apiData.status || 'active',
      skills: apiData.skills || [],
      contribution: apiData.contribution || 0, // From collaboration data
      tasksAssigned: apiData.tasksAssigned || 0, // From collaboration data
      tasksCompleted: apiData.tasksCompleted || 0, // From collaboration data
      projectId: apiData.projectId || '' // From collaboration data
    });
  }

  /**
   * Transform Collaborator entity to API format
   * @param {Collaborator} entity - Collaborator entity
   * @returns {Object} API formatted data
   */
  static fromEntityToApi(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      avatar: entity.avatar,
      joinedAt: entity.joinedAt?.toISOString(),
      status: entity.status,
      skills: entity.skills,
      contribution: entity.contribution,
      tasksAssigned: entity.tasksAssigned,
      tasksCompleted: entity.tasksCompleted,
      projectId: entity.projectId
    };
  }

  /**
   * Transform API response array to Collaborator entities array
   * @param {Array} apiDataArray - Array of raw API data
   * @returns {Array<Collaborator>} Array of Collaborator entities
   */
  static fromApiArrayToEntityArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    return apiDataArray.map(this.fromApiToEntity).filter(Boolean);
  }

  /**
   * Transform Collaborator entities array to API format array
   * @param {Array<Collaborator>} entityArray - Array of Collaborator entities
   * @returns {Array} Array of API formatted data
   */
  static fromEntityArrayToApiArray(entityArray) {
    if (!Array.isArray(entityArray)) return [];
    return entityArray.map(this.fromEntityToApi).filter(Boolean);
  }

  /**
   * Transform project collaborators data to entities (from project data)
   * @param {Array} collaboratorsData - Collaborators data from project
   * @param {string} projectId - Project ID to associate with collaborators
   * @returns {Array<Collaborator>} Array of Collaborator entities
   */
  static fromProjectDataToEntities(collaboratorsData, projectId) {
    if (!Array.isArray(collaboratorsData)) return [];
    
    return collaboratorsData.map(collaboratorData => {
      return new Collaborator({
        id: collaboratorData.id,
        name: collaboratorData.name || '',
        email: collaboratorData.email || '',
        role: collaboratorData.role || '',
        avatar: collaboratorData.avatar || null,
        joinedAt: collaboratorData.joinedAt,
        status: collaboratorData.status || 'active',
        skills: collaboratorData.skills || [],
        contribution: collaboratorData.contribution || 0,
        tasksAssigned: collaboratorData.tasksAssigned || 0,
        tasksCompleted: collaboratorData.tasksCompleted || 0,
        projectId: projectId
      });
    }).filter(Boolean);
  }
}