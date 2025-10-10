import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Projects API Service
 * Handles HTTP requests for project-related operations
 */
export class ProjectsApi extends BaseEndpoint {
  constructor() {
    const baseApi = new BaseApi();
    super(baseApi, '/projects');
  }

  /**
   * Get projects where user is participating
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  getParticipatingProjects(userId) {
    return this.http.get(`${this.endpointPath}/participating/${userId}`);
  }

  /**
   * Get projects owned by user
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  getOwnedProjects(userId) {
    return this.http.get(`${this.endpointPath}/owned/${userId}`);
  }

  /**
   * Get project statistics
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  getProjectStats(projectId) {
    return this.http.get(`${this.endpointPath}/${projectId}/stats`);
  }

  /**
   * Add collaborator to project
   * @param {string} projectId - Project ID
   * @param {Object} collaborator - Collaborator data
   * @returns {Promise} API response
   */
  addCollaborator(projectId, collaborator) {
    return this.http.post(`${this.endpointPath}/${projectId}/collaborators`, collaborator);
  }

  /**
   * Remove collaborator from project
   * @param {string} projectId - Project ID
   * @param {string} collaboratorId - Collaborator ID
   * @returns {Promise} API response
   */
  removeCollaborator(projectId, collaboratorId) {
    return this.http.delete(`${this.endpointPath}/${projectId}/collaborators/${collaboratorId}`);
  }

  /**
   * Get project notifications
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  getProjectNotifications(projectId) {
    return this.http.get(`${this.endpointPath}/${projectId}/notifications`);
  }

  /**
   * Update project status
   * @param {string} projectId - Project ID
   * @param {string} status - New status
   * @returns {Promise} API response
   */
  updateStatus(projectId, status) {
    return this.http.patch(`${this.endpointPath}/${projectId}/status`, { status });
  }

  /**
   * Search projects by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise} API response
   */
  searchProjects(criteria) {
    return this.http.get(`${this.endpointPath}/search`, { params: criteria });
  }

  /**
   * Add project to user's owned projects
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  addToOwnedProjects(userId, projectId) {
    return this.http.post(`${this.endpointPath}/owned/${userId}`, { projectId });
  }

  /**
   * Get projects created by user (temporary method using userId filter)
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  getProjectsByUserId(userId) {
    return this.http.get(`${this.endpointPath}?userId=${userId}`);
  }
}