import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Milestones API Service
 * Handles HTTP requests for milestone-related operations
 */
export class MilestonesApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        super(baseApi, '/projects');
    }

    /**
     * Get all milestones for a project
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    async getProjectMilestones(projectId) {
        try {
            console.log('🔍 Fetching milestones from correct endpoint:', projectId);

            // ✅ USAR EL ENDPOINT CORRECTO
            const response = await this.http.get(`${this.endpointPath}/${projectId}/milestones`);

            console.log('📦 API Response from milestones endpoint:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error fetching milestones:', error);
            throw error;
        }
    }

    /**
     * Get a specific milestone by ID
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @returns {Promise} API response
     */
    async getMilestone(projectId, milestoneId) {
        try {
            console.log(`🔍 Buscando milestone ${milestoneId} en proyecto ${projectId}`);

            // ✅ USAR EL ENDPOINT CORRECTO
            const response = await this.http.get(`${this.endpointPath}/${projectId}/milestones/${milestoneId}`);

            console.log('✅ Milestone encontrado:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error en getMilestone:', error);
            throw error;
        }
    }


    /**
     * Create a new milestone
     * @param {Object} milestoneData - Milestone data
     * @returns {Promise} API response
     */
    async createMilestone(milestoneData) {
        const { projectId, ...milestone } = milestoneData;

        console.log('📡 API - Datos COMPLETOS para crear milestone:', JSON.stringify(milestone, null, 2));
        console.log('🔍 API - Verificando estructura de milestoneTasks:', milestone.milestoneTasks);

        try {
            // ✅ AGREGAR LOG DETALLADO
            console.log('🎯 URL de la petición:', `${this.endpointPath}/${projectId}/milestones`);
            console.log('📦 BODY enviado:', milestone);

            const response = await this.http.post(
                `${this.endpointPath}/${projectId}/milestones`,
                milestone
            );

            console.log('✅ API - Milestone creado exitosamente:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error creando hito - DETALLES:');

            if (error.response) {
                // El servidor respondió con un código de error
                console.error('   Status:', error.response.status);
                console.error('   Data:', error.response.data);
                console.error('   Mensaje del backend:', error.response.data?.message || error.response.data);
            } else if (error.request) {
                // La petición fue hecha pero no se recibió respuesta
                console.error('   No se recibió respuesta del servidor');
            } else {
                // Algo pasó al configurar la petición
                console.error('   Error de configuración:', error.message);
            }

            throw error;
        }
    }
    /**
     * Update a milestone
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} API response
     */
    async updateMilestone(projectId, milestoneId, updateData) {
        try {
            console.log(`🔄 Updating milestone ${milestoneId} in project ${projectId}`, updateData);

            // ✅ USAR PUT EN LUGAR DE PATCH
            const response = await this.http.put(
                `${this.endpointPath}/${projectId}/milestones/${milestoneId}`,
                updateData
            );

            console.log('✅ Milestone updated successfully via PUT endpoint');
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error in updateMilestone:', error);

            // ✅ FALLBACK: Intentar con PATCH
            try {
                console.log('🔄 Trying PATCH method as fallback...');
                const patchResponse = await this.http.patch(
                    `${this.endpointPath}/${projectId}/milestones/${milestoneId}`,
                    updateData
                );
                console.log('✅ Milestone updated successfully via PATCH fallback');
                return { data: patchResponse.data };
            } catch (patchError) {
                console.error('❌ Both PUT and PATCH failed:', patchError);
                throw error;
            }
        }
    }

    /**
     * Delete a milestone
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @returns {Promise} API response
     */
    async deleteMilestone(projectId, milestoneId) {
        try {
            console.log(`🗑️ Deleting milestone ${milestoneId} from project ${projectId}`);

            // ✅ USAR EL ENDPOINT CORRECTO DEL BACKEND
            const response = await this.http.delete(
                `${this.endpointPath}/${projectId}/milestones/${milestoneId}`
            );

            console.log('✅ Milestone deleted successfully');
            return { data: { success: true } };
        } catch (error) {
            console.error('❌ Error in deleteMilestone:', error);

            if (error.response) {
                console.error('Backend error details:', error.response.data);
            }

            throw error;
        }
    }

    /**
     * Update milestone status
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @param {string} status - New status
     * @param {number} progress - Progress percentage (optional)
     * @returns {Promise} API response
     */
    updateMilestoneStatus(projectId, milestoneId, status, progress = null) {
        const updateData = {
            status: status,
            updatedAt: new Date().toISOString()
        };

        if (progress !== null) {
            updateData.progress = progress;
        }

        if (status === 'completed') {
            updateData.completedAt = new Date().toISOString();
        }

        return this.updateMilestone(projectId, milestoneId, updateData);
    }

    /**
     * Update milestone progress
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @param {number} progress - Progress percentage
     * @returns {Promise} API response
     */
    updateMilestoneProgress(projectId, milestoneId, progress) {
        const updateData = {
            progress: progress,
            updatedAt: new Date().toISOString(),
            status: progress === 100 ? 'completed' : 'active'
        };

        return this.updateMilestone(projectId, milestoneId, updateData);
    }

    /**
     * Add a task to a milestone
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @param {Object} taskData - Task data to add
     * @returns {Promise} API response
     */
    async addMilestoneTask(projectId, milestoneId, taskData) {
        // Obtener el milestone actual
        const milestoneResponse = await this.getMilestone(projectId, milestoneId);
        const milestone = milestoneResponse.data;

        // Agregar la tarea al array de milestoneTasks
        if (!milestone.milestoneTasks) {
            milestone.milestoneTasks = [];
        }

        const newTask = {
            ...taskData,
            id: `mt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generar ID único
            status: 'pending',
            progress: 0
        };

        milestone.milestoneTasks.push(newTask);

        // Actualizar el milestone
        return this.updateMilestone(projectId, milestoneId, {
            milestoneTasks: milestone.milestoneTasks
        });
    }

    /**
     * Update a task within a milestone
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @param {string} taskId - Task ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} API response
     */
    async updateMilestoneTask(projectId, milestoneId, taskId, updateData) {
        try {
            console.log(`🔄 API - Updating milestone task:`, {
                projectId,
                milestoneId,
                taskId,
                updateData
            });

            // ✅ USAR PUT EN LUGAR DE PATCH - el backend tiene PUT
            const response = await this.http.put(
                `${this.endpointPath}/${projectId}/milestones/${milestoneId}/tasks/${taskId}`,
                updateData
            );

            console.log('✅ Task updated successfully via PUT endpoint');
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error in updateMilestoneTask:', error);

            // ✅ FALLBACK: Intentar con PATCH por si acaso
            try {
                console.log('🔄 Trying PATCH method as fallback...');
                const patchResponse = await this.http.patch(
                    `${this.endpointPath}/${projectId}/milestones/${milestoneId}/tasks/${taskId}`,
                    updateData
                );
                console.log('✅ Task updated successfully via PATCH fallback');
                return { data: patchResponse.data };
            } catch (patchError) {
                console.error('❌ Both PUT and PATCH failed:', patchError);
                throw error;
            }
        }
    }

    /**
     * Delete a task from a milestone
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @param {string} taskId - Task ID
     * @returns {Promise} API response
     */
    async deleteMilestoneTask(projectId, milestoneId, taskId) {
        // Obtener el milestone actual
        const milestoneResponse = await this.getMilestone(projectId, milestoneId);
        const milestone = milestoneResponse.data;

        if (!milestone.milestoneTasks || !Array.isArray(milestone.milestoneTasks)) {
            throw new Error('No tasks found in milestone');
        }

        // Filtrar la tarea a eliminar
        const initialLength = milestone.milestoneTasks.length;
        milestone.milestoneTasks = milestone.milestoneTasks.filter(t => t.id !== taskId);

        if (milestone.milestoneTasks.length === initialLength) {
            throw new Error('Task not found in milestone');
        }

        // Actualizar el milestone
        return this.updateMilestone(projectId, milestoneId, {
            milestoneTasks: milestone.milestoneTasks
        });
    }

    /**
     * Get milestones by status for a project
     * @param {string} projectId - Project ID
     * @param {string} status - Milestone status
     * @returns {Promise} API response
     */
    async getMilestonesByStatus(projectId, status) {
        const response = await this.getProjectMilestones(projectId);
        const milestones = response.data;
        const filtered = milestones.filter(m => m.status === status);
        return { data: filtered };
    }

    /**
     * Get overdue milestones for a project
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    async getOverdueMilestones(projectId) {
        const response = await this.getProjectMilestones(projectId);
        const milestones = response.data;
        const now = new Date();
        const overdue = milestones.filter(m =>
            m.status !== 'completed' &&
            m.dueDate &&
            new Date(m.dueDate) < now
        );
        return { data: overdue };
    }

    /**
     * Get milestone statistics for a project
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    async getMilestoneStats(projectId) {
        const response = await this.getProjectMilestones(projectId);
        const milestones = response.data;

        const total = milestones.length;
        const completed = milestones.filter(m => m.status === 'completed').length;
        const active = milestones.filter(m => m.status === 'active').length;
        const overdue = milestones.filter(m =>
            m.status !== 'completed' &&
            m.dueDate &&
            new Date(m.dueDate) < new Date()
        ).length;

        const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
        const averageProgress = total > 0 ? totalProgress / total : 0;

        return {
            data: {
                total,
                completed,
                active,
                overdue,
                averageProgress: Math.round(averageProgress)
            }
        };
    }
}