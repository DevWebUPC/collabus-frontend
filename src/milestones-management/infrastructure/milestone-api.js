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
    getProjectMilestones(projectId) {
        console.log('🔍 Fetching milestones for project:', projectId);

        // CORRECCIÓN: Obtener el proyecto completo y extraer los milestones
        return this.http.get(`${this.endpointPath}/${projectId}`)
            .then(response => {
                console.log('📦 Project response:', response.data);

                // Extraer milestones del proyecto - manejar diferentes estructuras
                const milestones = response.data.milestones ||
                    response.data.project?.milestones ||
                    [];

                console.log('✅ Milestones found:', milestones.length);
                return {
                    data: milestones
                };
            })
            .catch(error => {
                console.error('❌ Error fetching project:', error);
                throw error;
            });
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

            // Obtener el proyecto
            const projectResponse = await this.http.get(`${this.endpointPath}/${projectId}`);
            const project = projectResponse.data;

            console.log('📋 Milestones del proyecto:', project.milestones);

            if (!project.milestones || !Array.isArray(project.milestones)) {
                console.log('❌ No hay milestones en el proyecto');
                throw new Error('No milestones found in project');
            }

            // Normalizar IDs para comparación
            const normalizedMilestoneId = String(milestoneId);

            // Buscar el milestone específico
            const milestone = project.milestones.find(m => {
                const normalizedExistingId = String(m.id);
                console.log(`🔍 Comparando: ${normalizedExistingId} con ${normalizedMilestoneId}`);
                return normalizedExistingId === normalizedMilestoneId;
            });

            if (!milestone) {
                console.log('❌ Milestone no encontrado. Milestones disponibles:', project.milestones.map(m => m.id));
                throw new Error(`Milestone not found: ${milestoneId}`);
            }

            console.log('✅ Milestone encontrado:', milestone);
            return { data: milestone };
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

        // Obtener el proyecto actual
        const projectResponse = await this.http.get(`${this.endpointPath}/${projectId}`);
        const project = projectResponse.data;

        // Agregar el milestone al array de milestones del proyecto
        if (!project.milestones) {
            project.milestones = [];
        }

        const newMilestone = {
            ...milestone,
            id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generar ID único
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        project.milestones.push(newMilestone);

        // Actualizar el proyecto con el nuevo milestone
        const updateResponse = await this.http.patch(`${this.endpointPath}/${projectId}`, {
            milestones: project.milestones
        });

        return { data: newMilestone };
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

            // Obtener el proyecto actual
            const projectResponse = await this.http.get(`${this.endpointPath}/${projectId}`);
            const project = projectResponse.data;

            if (!project.milestones || !Array.isArray(project.milestones)) {
                throw new Error('No milestones found in project');
            }

            // Normalizar IDs para comparación
            const normalizedMilestoneId = String(milestoneId);

            // Encontrar y actualizar el milestone
            const milestoneIndex = project.milestones.findIndex(m => {
                const normalizedExistingId = String(m.id);
                return normalizedExistingId === normalizedMilestoneId;
            });

            if (milestoneIndex === -1) {
                console.error('❌ Milestone not found. Available milestones:', project.milestones.map(m => ({ id: m.id, type: typeof m.id })));
                throw new Error(`Milestone not found: ${milestoneId}`);
            }

            // Actualizar el milestone
            project.milestones[milestoneIndex] = {
                ...project.milestones[milestoneIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            // Actualizar el proyecto completo
            await this.http.patch(`${this.endpointPath}/${projectId}`, {
                milestones: project.milestones
            });

            console.log('✅ Milestone updated successfully:', project.milestones[milestoneIndex]);
            return { data: project.milestones[milestoneIndex] };
        } catch (error) {
            console.error('❌ Error in updateMilestone:', error);
            throw error;
        }
    }

    /**
     * Delete a milestone
     * @param {string} projectId - Project ID
     * @param {string} milestoneId - Milestone ID
     * @returns {Promise} API response
     */
    async deleteMilestone(projectId, milestoneId) {
        // Obtener el proyecto actual
        const projectResponse = await this.http.get(`${this.endpointPath}/${projectId}`);
        const project = projectResponse.data;

        // Filtrar el milestone a eliminar
        const initialLength = project.milestones.length;
        project.milestones = project.milestones.filter(m => m.id !== milestoneId);

        if (project.milestones.length === initialLength) {
            throw new Error('Milestone not found');
        }

        // Actualizar el proyecto
        await this.http.patch(`${this.endpointPath}/${projectId}`, {
            milestones: project.milestones
        });

        return { data: { success: true } };
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
        // Obtener el milestone actual
        const milestoneResponse = await this.getMilestone(projectId, milestoneId);
        const milestone = milestoneResponse.data;

        if (!milestone.milestoneTasks || !Array.isArray(milestone.milestoneTasks)) {
            throw new Error('No tasks found in milestone');
        }

        // Encontrar y actualizar la tarea
        const taskIndex = milestone.milestoneTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Task not found in milestone');
        }

        milestone.milestoneTasks[taskIndex] = {
            ...milestone.milestoneTasks[taskIndex],
            ...updateData
        };

        // Actualizar el milestone
        return this.updateMilestone(projectId, milestoneId, {
            milestoneTasks: milestone.milestoneTasks
        });
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