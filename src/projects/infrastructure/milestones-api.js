import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Milestones API Service
 * Handles HTTP requests for milestone-related operations
 */
export class MilestonesApi extends BaseEndpoint {
  constructor() {
    const baseApi = new BaseApi();
    super(baseApi, '/milestones');
  }

  /**
   * Get milestones by project ID
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  getByProject(projectId) {
    return this.http.get(`${this.endpointPath}?projectId=${projectId}`);
  }

  /**
   * Get upcoming milestones for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  getUpcomingMilestones(projectId) {
    return this.http.get(`${this.endpointPath}/project/${projectId}/upcoming`);
  }

  /**
   * Get completed milestones for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  getCompletedMilestones(projectId) {
    return this.http.get(`${this.endpointPath}/project/${projectId}/completed`);
  }

  /**
   * Update milestone progress
   * @param {string} milestoneId - Milestone ID
   * @param {number} progress - Progress percentage
   * @returns {Promise} API response
   */
  updateProgress(milestoneId, progress) {
    return this.http.patch(`${this.endpointPath}/${milestoneId}/progress`, { progress });
  }

  /**
   * Add deliverable to milestone
   * @param {string} milestoneId - Milestone ID
   * @param {Object} deliverable - Deliverable data
   * @returns {Promise} API response
   */
  addDeliverable(milestoneId, deliverable) {
    return this.http.post(`${this.endpointPath}/${milestoneId}/deliverables`, deliverable);
  }
}