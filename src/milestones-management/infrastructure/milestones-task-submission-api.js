import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Milestone Task Submission API Service
 * Handles HTTP requests for milestone task submission operations
 */
export class MilestoneTaskSubmissionApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        super(baseApi, '/milestone-task-submissions');
    }

    /**
     * Get all submissions for a milestone task
     * @param {string} milestoneTaskId - Milestone Task ID
     * @returns {Promise} API response
     */
    getByMilestoneTaskId(milestoneTaskId) {
        return this.http.get(`${this.endpointPath}?milestoneTaskId=${milestoneTaskId}`)
            .then(response => {
                console.log('📦 Milestone task submissions response:', response.data);
                return response;
            })
            .catch(error => {
                console.error('❌ Error fetching milestone task submissions:', error);
                throw error;
            });
    }

    /**
     * Get a specific submission by ID
     * @param {string} submissionId - Submission ID
     * @returns {Promise} API response
     */
    async getById(submissionId) {
        try {
            console.log(`🔍 Fetching milestone task submission: ${submissionId}`);

            const response = await this.http.get(`${this.endpointPath}/${submissionId}`);
            console.log('✅ Milestone task submission found:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Error fetching milestone task submission:', error);
            throw error;
        }
    }

    /**
     * Get submission by milestone task and collaborator
     * @param {string} milestoneTaskId - Milestone Task ID
     * @param {string} collaboratorId - Collaborator ID
     * @returns {Promise} API response
     */
    async getByTaskAndCollaborator(milestoneTaskId, collaboratorId) {
        try {
            console.log(`🔍 Fetching submission for task ${milestoneTaskId} and collaborator ${collaboratorId}`);

            const response = await this.http.get(
                `${this.endpointPath}?milestoneTaskId=${milestoneTaskId}&collaboratorId=${collaboratorId}`
            );

            // Return the first submission found (should be only one per task per collaborator)
            const submissions = response.data || [];
            console.log(`✅ Found ${submissions.length} submissions`);

            return {
                data: submissions.length > 0 ? submissions[0] : null
            };
        } catch (error) {
            console.error('❌ Error fetching submission by task and collaborator:', error);
            throw error;
        }
    }

    /**
     * Create a new milestone task submission
     * @param {Object} submissionData - Submission data
     * @returns {Promise} API response
     */
    async create(submissionData) {
        try {
            console.log('📡 Creating milestone task submission:', submissionData);

            // ✅ CORREGIDO: Usar el endpoint correcto para milestone-task-submissions
            const response = await this.http.post(this.endpointPath, submissionData);

            console.log('✅ Milestone task submission created successfully:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Error creating milestone task submission:', error);

            // Si falla el POST, intentar con PUT para JSON Server
            try {
                console.log('🔄 Trying alternative method for JSON Server...');

                // Obtener submissions existentes
                const existingResponse = await this.http.get(this.endpointPath);
                const existingSubmissions = existingResponse.data || [];

                // Crear nueva submission con ID
                const newSubmission = {
                    ...submissionData,
                    id: `milestone_submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // Agregar a las existentes
                const updatedSubmissions = [...existingSubmissions, newSubmission];

                // Guardar usando PUT (JSON Server)
                await this.http.put(this.endpointPath, updatedSubmissions);

                console.log('✅ Milestone task submission created successfully (alternative method)');
                return { data: newSubmission };
            } catch (fallbackError) {
                console.error('❌ Error in fallback method:', fallbackError);
                throw fallbackError;
            }
        }
    }
    /**
     * Update a milestone task submission
     * @param {string} submissionId - Submission ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} API response
     */
    async update(submissionId, updateData) {
        try {
            console.log(`🔄 Updating milestone task submission ${submissionId}:`, updateData);

            // Get all existing submissions
            const existingResponse = await this.http.get(this.endpointPath);
            const existingSubmissions = existingResponse.data || [];

            // Find and update the submission
            const submissionIndex = existingSubmissions.findIndex(sub => sub.id === submissionId);

            if (submissionIndex === -1) {
                throw new Error(`Milestone task submission not found: ${submissionId}`);
            }

            const updatedSubmission = {
                ...existingSubmissions[submissionIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            existingSubmissions[submissionIndex] = updatedSubmission;

            // Update the entire collection
            await this.http.put(this.endpointPath, existingSubmissions);

            console.log('✅ Milestone task submission updated successfully');
            return { data: updatedSubmission };
        } catch (error) {
            console.error('❌ Error updating milestone task submission:', error);
            throw error;
        }
    }

    /**
     * Delete a milestone task submission
     * @param {string} submissionId - Submission ID
     * @returns {Promise} API response
     */
    async delete(submissionId) {
        try {
            console.log(`🗑️ Deleting milestone task submission: ${submissionId}`);

            // Get all existing submissions
            const existingResponse = await this.http.get(this.endpointPath);
            const existingSubmissions = existingResponse.data || [];

            // Filter out the submission to delete
            const filteredSubmissions = existingSubmissions.filter(sub => sub.id !== submissionId);

            if (filteredSubmissions.length === existingSubmissions.length) {
                throw new Error(`Milestone task submission not found: ${submissionId}`);
            }

            // Update the entire collection
            await this.http.put(this.endpointPath, filteredSubmissions);

            console.log('✅ Milestone task submission deleted successfully');
            return { data: { success: true } };
        } catch (error) {
            console.error('❌ Error deleting milestone task submission:', error);
            throw error;
        }
    }

    /**
     * Get all submissions for a project
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    getByProjectId(projectId) {
        return this.http.get(`${this.endpointPath}?projectId=${projectId}`);
    }

    /**
     * Get all submissions for a milestone
     * @param {string} milestoneId - Milestone ID
     * @returns {Promise} API response
     */
    getByMilestoneId(milestoneId) {
        return this.http.get(`${this.endpointPath}?milestoneId=${milestoneId}`);
    }

    /**
     * Get all submissions by a collaborator
     * @param {string} collaboratorId - Collaborator ID
     * @returns {Promise} API response
     */
    getByCollaboratorId(collaboratorId) {
        return this.http.get(`${this.endpointPath}?collaboratorId=${collaboratorId}`);
    }
}