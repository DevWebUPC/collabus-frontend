import { BaseApi } from '../../shared/infrastructure/base-api.js';

export class ProjectsApi extends BaseApi {
    constructor() {
        super();
        this.resourcePath = "/projects";
    }

    /**
     * Create new project
     * @param {Object} projectData - Project data
     * @returns {Promise<Object>} API response with created project
     */
    async create(projectData) {
        try {
            // Transformar datos del frontend al formato del backend
            const backendData = this.transformToBackendFormat(projectData);

            const response = await this.http.post(this.resourcePath, backendData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            return response;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    /**
     * Transform frontend data to backend format
     * @param {Object} frontendData - Data from Vue store
     * @returns {Object} Backend compatible data
     */
    transformToBackendFormat(frontendData) {
        // Transformar roles al formato del backend
        const roles = frontendData.roles.map(role => ({
            name: role.name,
            cards: role.cards.map(card => ({
                title: card.title,
                items: card.items.filter(item => item.trim() !== '') // Filtrar items vacíos
            }))
        }));

        return {
            userId: parseInt(frontendData.userId) || 1, // Temporal - usar ID real del usuario
            title: frontendData.title,
            description: frontendData.summary, // Mapear summary a description
            summary: frontendData.summary,
            academicLevelName: frontendData.academicLevel,
            benefits: frontendData.benefits,
            skills: frontendData.skills,
            durationQuantity: frontendData.durationQuantity,
            durationType: frontendData.durationType,
            areas: frontendData.areas,
            tags: frontendData.tags,
            roles: roles,
            status: "draft",
            progress: 0
        };
    }

    /**
     * Get all projects
     * @returns {Promise<Object>} API response with projects
     */
    async getAll() {
        return this.http.get(this.resourcePath);
    }

    /**
     * Get project by ID
     * @param {string} id - Project ID
     * @returns {Promise<Object>} API response with project
     */
    async getById(id) {
        console.log('🌐 API: Fetching project with ID:', id);
        try {
            const response = await this.http.get(`${this.resourcePath}/${id}`);
            console.log('🌐 API: Response received:', response.data);
            return response;
        } catch (error) {
            console.error('🌐 API: Error fetching project:', error);
            throw error;
        }
    }

    /**
     * Update project
     * @param {string} id - Project ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} API response
     */
    async update(id, updateData) {
        return this.http.patch(`${this.resourcePath}/${id}`, updateData);
    }

    /**
     * Delete project
     * @param {string} id - Project ID
     * @returns {Promise<Object>} API response
     */
    async delete(id) {
        return this.http.delete(`${this.resourcePath}/${id}`);
    }

    /**
     * Search projects
     * @param {Object} criteria - Search criteria
     * @returns {Promise<Object>} API response
     */
    async search(criteria) {
        return this.http.get(`${this.resourcePath}/search`, { params: criteria });
    }
}