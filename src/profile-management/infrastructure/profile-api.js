// infrastructure/profile-api.js
import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Profile API Service
 * Handles HTTP requests for profile-related operations
 */
export class ProfileApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        super(baseApi, '/profiles');

        // Agregar interceptors para debugging
        this.http.interceptors.request.use(request => {
            console.log('🚀 Profile API Request:', request.method?.toUpperCase(), request.url);
            console.log('📦 Profile Request Data:', request.data);
            return request;
        });

        this.http.interceptors.response.use(response => {
            console.log('✅ Profile API Response:', response.status, response.data);
            return response;
        }, error => {
            console.log('❌ Profile API Error:', error.response?.status, error.message);
            console.log('📋 Profile Error Details:', error.response?.data);
            return Promise.reject(error);
        });
    }

    /**
     * Create a new profile
     * @param {Object} profileData - Profile data
     * @returns {Promise} API response
     */
    create(profileData) {
        return this.http.post(this.endpointPath, profileData);
    }

    /**
     * Get profile by user ID
     * @param {string} userId - User ID
     * @returns {Promise} API response
     */
    getByUserId(userId) {
        return this.http.get(`${this.endpointPath}?userId=${encodeURIComponent(userId)}`);
    }

    /**
     * Update profile
     * @param {string} id - Profile ID
     * @param {Object} profileData - Updated profile data
     * @returns {Promise} API response
     */
    update(id, profileData) {
        return this.http.put(`${this.endpointPath}/${id}`, profileData);
    }

    /**
     * Update profile partially
     * @param {string} id - Profile ID
     * @param {Object} profileData - Partial profile data
     * @returns {Promise} API response
     */
    patch(id, profileData) {
        return this.http.patch(`${this.endpointPath}/${id}`, profileData);
    }

    /**
     * Delete profile
     * @param {string} id - Profile ID
     * @returns {Promise} API response
     */
    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}