import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Profile API Service
 * Handles HTTP requests for profile-related operations
 */
export class ProfileApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        super(baseApi, '/profile');
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
     * Get all profiles
     * @returns {Promise} API response
     */
    getAll() {
        return this.http.get(this.endpointPath);
    }

    /**
     * Create a new profile
     * @param {Object} profileData - Profile data
     * @returns {Promise} API response
     */
    create(profileData) {
        return this.http.post(this.endpointPath, profileData); // ✅ Ahora será /api/v1/profile
    }

    /**
     * Get profile by user ID - NUEVO MÉTODO
     * @param {string} userId - User ID
     * @returns {Promise} API response
     */
    getByUserId(userId) {
        // Primero intentamos obtener todos los perfiles y filtrar
        return this.http.get(this.endpointPath)
            .then(response => {
                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Respuesta inválida de la API');
                }

                // Buscar el perfil que coincida con el userId
                const profile = response.data.find(p =>
                    p.userId === userId ||
                    p.userId === parseInt(userId) ||
                    p.userId?.toString() === userId.toString()
                );

                if (!profile) {
                    // Crear un error 404 simulado
                    const error = new Error('Profile not found');
                    error.response = { status: 404 };
                    throw error;
                }

                // Devolver la respuesta en el mismo formato que el backend
                return { data: profile };
            });
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
        return this.http.put(`${this.endpointPath}/${id}`, profileData);
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