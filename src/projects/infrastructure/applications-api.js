import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Applications API Service
 * Handles HTTP requests for application-related operations
 */
export class ApplicationsApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        super(baseApi, '/applications');
    }

    /**
     * Submit a new application to a project role
     * @param {Object} applicationData - Application data
     * @returns {Promise} API response
     */
    submitApplication(applicationData) {
        return this.http.post(this.endpointPath, applicationData);
    }

    /**
     * Get applications submitted by the current user
     * @param {string} userId - User ID
     * @returns {Promise} API response
     */
    getUserApplications(userId) {
        return this.http.get(`${this.endpointPath}?applicantId=${userId}`);
    }

    /**
     * Get applications for a project (for project owner)
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    getProjectApplications(projectId) {
        // Asegúrate de que este endpoint funcione correctamente
        return this.http.get(`${this.endpointPath}?projectId=${projectId}`);
    }

    /**
     * Get a specific application by ID
     * @param {string} applicationId - Application ID
     * @returns {Promise} API response
     */
    getApplication(applicationId) {
        return this.http.get(`${this.endpointPath}/${applicationId}`);
    }
    
    /**
     * Withdraw an application (delete)
     * @param {string} applicationId - Application ID
     * @returns {Promise} API response
     */
    withdrawApplication(applicationId) {
        return this.http.delete(`${this.endpointPath}/${applicationId}`);
    }

    /**
     * Get application statistics for a user
     * @param {string} userId - User ID
     * @returns {Promise} API response
     */
    getUserApplicationStats(userId) {
        return this.http.get(`${this.endpointPath}/user/${userId}/stats`);
    }

    /**
     * Update an application
     * @param {string} applicationId - Application ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} API response
     */
    updateApplication(applicationId, updateData) {
        return this.http.patch(`${this.endpointPath}/${applicationId}`, updateData);
    }

    /**
     * Accept an application
     * @param {string} applicationId - Application ID
     * @param {Object} data - Acceptance data
     * @returns {Promise} API response
     */
    acceptApplication(applicationId, data) {
        return this.http.post(`${this.endpointPath}/${applicationId}/accept`, data);
    }

    /**
     * Reject an application
     * @param {string} applicationId - Application ID
     * @param {Object} data - Rejection data
     * @returns {Promise} API response
     */
    rejectApplication(applicationId, data) {
        return this.http.post(`${this.endpointPath}/${applicationId}/reject`, data);
    }

    /**
     * Update application status
     * @param {string} applicationId - Application ID
     * @param {Object} data - Status update data
     * @returns {Promise} API response
     */
    updateApplicationStatus(applicationId, data) {
        return this.http.patch(`${this.endpointPath}/${applicationId}/status`, data);
    }
}