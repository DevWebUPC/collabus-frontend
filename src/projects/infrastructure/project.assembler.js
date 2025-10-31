import { Project } from '../domain/model/project.entity.js';

/**
 * Project Assembler
 * Transforms data between API and domain entities
 */
export class ProjectAssembler {
  /**
   * Transform API response to Project entity
   * @param {Object} apiData - Raw API data
   * @returns {Project} Project entity
   */
  static fromApiToEntity(apiData) {
      if (!apiData) {
          console.log('❌ API data is null or undefined');
          return null;
      }

      console.log('📥 Raw API data received:', apiData);

      // ✅ CORREGIDO: Mapear academicLevel correctamente
      const academicLevel = apiData.academicLevelName ||
          apiData.academicLevel?.name ||
          apiData.academicLevel ||
          '';

      console.log('🎓 Mapped academic level:', academicLevel);

      // ✅ CORREGIDO: Mapear roles correctamente
      const roles = (apiData.roles || []).map(role => {
          console.log('👥 Processing role:', role);
          return {
              id: role.id,
              name: role.name,
              title: role.name, // Para compatibilidad con el template
              cards: (role.cards || []).map(card => ({
                  id: card.id,
                  title: card.title,
                  items: card.items || []
              }))
          };
      });

      console.log('📋 Final roles:', roles);

      const projectEntity = new Project({
          id: apiData.id,
          title: apiData.title || '',
          description: apiData.description || '',
          summary: apiData.summary || '',
          academicLevel: academicLevel,
          skills: apiData.skills || [],
          durationQuantity: apiData.durationQuantity || 1,
          durationType: apiData.durationType || 'meses',
          benefits: apiData.benefits || '',
          roles: roles,
          status: apiData.status || 'draft',
          progress: apiData.progress || 0,
          userId: apiData.userId,
          authorName: apiData.authorName || 'Usuario',
          areas: apiData.areas || [],
          tags: apiData.tags || [],
          createdAt: apiData.createdAt,
          updatedAt: apiData.updatedAt
      });

      console.log('🏗️ Final project entity:', projectEntity);
      return projectEntity;
  }
  /**
   * Get additional project data for detail view
   * @param {Object} apiData - Raw API data with additional fields
   * @returns {Object} Basic project data for UI components
   */
  static getProjectDetailData(apiData) {
    if (!apiData) return null;

    const baseProject = this.fromApiToEntity(apiData);

    return {
      project: baseProject
    };
  }

  /**
   * Transform Project entity to API format
   * @param {Project} entity - Project entity
   * @returns {Object} API formatted data
   */
  static fromEntityToApi(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      category: entity.category,
      areas: entity.areas,
      tags: entity.tags,
      summary: entity.summary,
      academicLevel: entity.academicLevel,
      skills: entity.skills,
      durationQuantity: entity.durationQuantity,
      durationType: entity.durationType,
      benefits: entity.benefits,
      roles: entity.roles,
      status: entity.status,
      progress: entity.progress,
      startDate: entity.startDate?.toISOString(),
      endDate: entity.endDate?.toISOString(),
      budget: entity.budget,
      userId: entity.userId,
      collaborators: entity.collaborators,
      tasks: entity.tasks,
      milestones: entity.milestones,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
      authorName: entity.authorName || entity.owner || 'Usuario'
    };
  }

  /**
   * Transform API response array to Project entities array
   * @param {Array} apiDataArray - Array of raw API data
   * @returns {Array<Project>} Array of Project entities
   */
  static fromApiArrayToEntityArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    return apiDataArray.map(this.fromApiToEntity);
  }

  /**
   * Transform Project entities array to API format array
   * @param {Array<Project>} entityArray - Array of Project entities
   * @returns {Array} Array of API formatted data
   */
  static fromEntityArrayToApiArray(entityArray) {
    if (!Array.isArray(entityArray)) return [];
    return entityArray.map(this.fromEntityToApi);
  }
}