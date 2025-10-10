import { BaseApi } from '../../shared/infrastructure/base-api.js';

/**
 * Collaborators API
 * Handles API calls related to project collaborators
 */
export class CollaboratorsApi extends BaseApi {
  constructor() {
    super();
    this.resourceEndpoint = '/collaborators';
  }

  /**
   * Get collaborator by ID
   * @param {string} id - Collaborator ID
   * @returns {Promise} API response
   */
  async getById(id) {
    return this.http.get(`${this.resourceEndpoint}/${id}`);
  }

  /**
   * Get all collaborators
   * @returns {Promise} API response
   */
  async getAll() {
    return this.http.get(this.resourceEndpoint);
  }

  /**
   * Get collaborators by project ID
   * @param {string} projectId - Project ID
   * @returns {Promise} API response with collaborators
   */
  async getByProjectId(projectId) {
    return this.http.get(`${this.resourceEndpoint}?projectId=${projectId}`);
  }

  /**
   * Get collaborators by IDs
   * @param {Array<string>} ids - Array of collaborator IDs
   * @returns {Promise} API response with collaborators
   */
  async getByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { data: [] };
    }

    try {
      const collaboratorPromises = ids.map(id => this.getById(id));
      const responses = await Promise.all(collaboratorPromises);
      const collaborators = responses
        .map(response => response.data)
        .filter(Boolean);
      
      return { data: collaborators };
    } catch (error) {
      console.error('Error fetching collaborators by IDs:', error);
      throw error;
    }
  }

  /**
   * Create new collaborator
   * @param {Object} collaboratorData - Collaborator data
   * @returns {Promise} API response
   */
  async create(collaboratorData) {
    return this.http.post(this.resourceEndpoint, collaboratorData);
  }

  /**
   * Update collaborator
   * @param {string} id - Collaborator ID
   * @param {Object} collaboratorData - Updated collaborator data
   * @returns {Promise} API response
   */
  async update(id, collaboratorData) {
    return this.http.put(`${this.resourceEndpoint}/${id}`, collaboratorData);
  }

  /**
   * Delete collaborator
   * @param {string} id - Collaborator ID
   * @returns {Promise} API response
   */
  async delete(id) {
    return this.http.delete(`${this.resourceEndpoint}/${id}`);
  }
}