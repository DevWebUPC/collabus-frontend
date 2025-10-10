// infrastructure/user-api.js
import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Users API Service
 * Handles HTTP requests for user-related operations
 */
export class UsersApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        super(baseApi, '/users');

        // Agregar interceptors para debugging
        this.http.interceptors.request.use(request => {
            console.log('🚀 API Request:', request.method?.toUpperCase(), request.url);
            console.log('📦 Request Data:', request.data);
            return request;
        });

        this.http.interceptors.response.use(response => {
            console.log('✅ API Response:', response.status, response.data);
            return response;
        }, error => {
            console.log('❌ API Error:', error.response?.status, error.message);
            console.log('📋 Error Details:', error.response?.data);
            return Promise.reject(error);
        });
    }

    /**
     * Register a new user - CORREGIDO
     * @param {Object} userData - User registration data
     * @returns {Promise} API response
     */
    register(userData) {
        // JSON Server usa POST directo al endpoint para crear
        return this.http.post(this.endpointPath, userData);
    }

    /**
     * Get user by email - CORREGIDO
     * @param {string} email - User email
     * @returns {Promise} API response
     */
    getByEmail(email) {
        return this.http.get(`${this.endpointPath}?email=${encodeURIComponent(email)}`);
    }

    /**
     * Update user profile
     * @param {string} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise} API response
     */
    updateProfile(id, userData) {
        return this.http.put(`${this.endpointPath}/${id}`, userData);
    }

    /**
     * Complete user onboarding - CORREGIDO
     * @param {string} id - User ID
     * @param {Object} onboardingData - Onboarding data
     * @returns {Promise} API response
     */
    completeOnboarding(id, onboardingData) {
        // Para JSON Server, hacemos un PATCH para actualizar parcialmente
        return this.http.patch(`${this.endpointPath}/${id}`, onboardingData);
    }
}