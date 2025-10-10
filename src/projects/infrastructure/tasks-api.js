import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Tasks API Service
 * Handles HTTP requests for task-related operations
 */
export class TasksApi extends BaseEndpoint {
  constructor() {
    const baseApi = new BaseApi();
    super(baseApi, '/tasks');
  }

  /**
   * Get tasks by project ID
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  getByProject(projectId) {
    return this.http.get(`${this.endpointPath}?projectId=${projectId}`);
  }

  /**
   * Get tasks assigned to user
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  getAssignedTasks(userId) {
    return this.http.get(`${this.endpointPath}/assigned/${userId}`);
  }

  /**
   * Get urgent tasks for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  getUrgentTasks(projectId) {
    return this.http.get(`${this.endpointPath}/project/${projectId}/urgent`);
  }

  /**
   * Get completed tasks for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} API response
   */
  getCompletedTasks(projectId) {
    return this.http.get(`${this.endpointPath}/project/${projectId}/completed`);
  }

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   * @returns {Promise} API response
   */
  updateStatus(taskId, status) {
    return this.http.patch(`${this.endpointPath}/${taskId}/status`, { status });
  }

  /**
   * Assign task to user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  assignTask(taskId, userId) {
    return this.http.patch(`${this.endpointPath}/${taskId}/assign`, { userId });
  }

  /**
   * Add time log to task
   * @param {string} taskId - Task ID
   * @param {Object} timeLog - Time log data
   * @returns {Promise} API response
   */
  addTimeLog(taskId, timeLog) {
    return this.http.post(`${this.endpointPath}/${taskId}/time-logs`, timeLog);
  }
}