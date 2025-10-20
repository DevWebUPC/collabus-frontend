import {defineStore} from "pinia";
import {MilestonesApi} from "../infrastructure/milestone-api.js";
import {MilestoneAssembler} from "../infrastructure/milestone.assembler.js";

/**
 * Milestone Store
 * Manages milestone state and operations for the milestones-management bounded context
 */

export const useMilestonesStore = defineStore('milestone', {
    state: () => ({
        milestones: [],
        currentMilestone: null,
        loading: false,
        error: null,
        projectMilestones: new Map(), // Cache de milestones por proyecto
        milestoneStats: new Map() // Cache de estadísticas por proyecto
    }),
    getters: {
        /**
         * Get milestones for a specific project
         */
        getProjectMilestones: (state) => (projectId) => {
            if (state.projectMilestones.has(projectId)) {
                return state.projectMilestones.get(projectId);
            }
            return state.milestones.filter(milestone => milestone.projectId === projectId);
        },

        /**
         * Get milestones by status for a project
         */
        getMilestonesByStatus: (state) => (projectId, status) => {
            const projectMilestones = state.milestones.filter(milestone => milestone.projectId === projectId);
            return projectMilestones.filter(milestone => milestone.status === status);
        },

        /**
         * Get overdue milestones for a project
         */
        getOverdueMilestones: (state) => (projectId) => {
            const projectMilestones = state.milestones.filter(milestone => milestone.projectId === projectId);
            const now = new Date();
            return projectMilestones.filter(milestone =>
                milestone.status !== 'completed' &&
                milestone.dueDate &&
                new Date(milestone.dueDate) < now
            );
        },

        /**
         * Get milestone tasks for a specific collaborator
         */
        getCollaboratorMilestoneTasks: (state) => (projectId, collaboratorId) => {
            const projectMilestones = state.milestones.filter(milestone => milestone.projectId === projectId);
            const collaboratorTasks = [];

            projectMilestones.forEach(milestone => {
                const tasks = milestone.milestoneTasks.filter(task =>
                    task.assignedTo === collaboratorId
                );
                collaboratorTasks.push(...tasks.map(task => ({
                    ...task,
                    milestoneTitle: milestone.title,
                    milestoneId: milestone.id
                })));
            });

            return collaboratorTasks;
        },

        /**
         * Get milestone statistics for a project
         */
        getMilestoneStats: (state) => (projectId) => {
            // Verificar cache primero
            if (state.milestoneStats.has(projectId)) {
                return state.milestoneStats.get(projectId);
            }

            const projectMilestones = state.milestones.filter(milestone => milestone.projectId === projectId);

            const total = projectMilestones.length;
            const completed = projectMilestones.filter(milestone => milestone.status === 'completed').length;
            const active = projectMilestones.filter(milestone => milestone.status === 'active').length;
            const overdue = projectMilestones.filter(milestone =>
                milestone.status !== 'completed' &&
                milestone.dueDate &&
                new Date(milestone.dueDate) < new Date()
            ).length;

            const totalProgress = projectMilestones.reduce((sum, milestone) => sum + milestone.progress, 0);
            const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;

            const totalTasks = projectMilestones.reduce((sum, milestone) =>
                sum + (milestone.milestoneTasks?.length || 0), 0
            );
            const completedTasks = projectMilestones.reduce((sum, milestone) =>
                sum + milestone.milestoneTasks.filter(task => task.status === 'completed').length, 0
            );

            const stats = {
                total,
                completed,
                active,
                overdue,
                averageProgress,
                totalTasks,
                completedTasks,
                taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            };

            // Guardar en cache
            state.milestoneStats.set(projectId, stats);
            return stats;
        },

        /**
         * Get upcoming milestones (due in the next 7 days)
         */
        getUpcomingMilestones: (state) => (projectId) => {
            const projectMilestones = state.milestones.filter(milestone => milestone.projectId === projectId);
            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            return projectMilestones.filter(milestone =>
                milestone.status === 'active' &&
                milestone.dueDate &&
                new Date(milestone.dueDate) <= sevenDaysFromNow &&
                new Date(milestone.dueDate) >= now
            ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        },

        /**
         * Check if store is loading
         */
        isLoading: (state) => state.loading,

        /**
         * Get current error
         */
        getError: (state) => state.error,

        /**
         * Get current milestone
         */
        getCurrentMilestone: (state) => state.currentMilestone
    },
    actions: {
        /**
         * Set loading state
         */
        setLoading(loading) {
            this.loading = loading;
        },

        /**
         * Set error
         */
        setError(error) {
            this.error = error;
        },

        /**
         * Clear error
         */
        clearError() {
            this.error = null;
        },

        /**
         * Actualizar estados de milestones vencidos automáticamente
         */
        updateOverdueMilestonesStatus() {
            const now = new Date();

            this.milestones.forEach(milestone => {
                if (milestone.status !== 'completed' &&
                    milestone.dueDate &&
                    new Date(milestone.dueDate) < now) {
                    // No cambiamos el status del milestone, pero podemos marcarlo como overdue en el UI
                    // El status se mantiene como 'active' pero podemos detectar el overdue con getters
                }
            });

            // Limpiar caches ya que los estados pueden haber cambiado
            this.milestoneStats.clear();
        },

        /**
         * Load all milestones for a project
         */
        async loadProjectMilestones(projectId) {
            try {
                this.setLoading(true);
                this.clearError();

                console.log('🚀 Loading milestones for project:', projectId);
                console.log('📝 Store state before load:', this.milestones.length);

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.getProjectMilestones(projectId);

                console.log('📦 API Response:', response);

                const milestones = MilestoneAssembler.fromApiArrayToEntityArray(response.data);

                console.log('✅ Transformed milestones:', milestones);

                // Reemplazar milestones del proyecto específico
                this.milestones = [
                    ...this.milestones.filter(milestone => milestone.projectId !== projectId),
                    ...milestones
                ];

                this.updateOverdueMilestonesStatus();

                // Actualizar cache de proyecto
                this.projectMilestones.set(projectId, milestones);

                // Invalidar cache de estadísticas
                this.milestoneStats.delete(projectId);

                console.log(`✅ Loaded ${milestones.length} milestones for project ${projectId}`);
                return milestones;
            } catch (error) {
                const errorMsg = `Error loading project milestones: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                console.error('🔍 Error details:', error.response?.data || error);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Load a specific milestone by ID
         */
        async loadMilestone(projectId, milestoneId) {
            try {
                this.setLoading(true);
                this.clearError();

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.getMilestone(projectId, milestoneId);

                this.currentMilestone = MilestoneAssembler.fromApiToEntity(response.data);

                console.log(`✅ Loaded milestone: ${this.currentMilestone?.title}`);
                return this.currentMilestone;
            } catch (error) {
                const errorMsg = `Error loading milestone: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },


        /**
         * Create a new milestone
         */
        async createMilestone(milestoneData) {
            try {
                this.setLoading(true);
                this.clearError();

                console.log('🎯 Store - Datos recibidos para crear milestone:', milestoneData);
                console.log('🔍 Store - Verificando milestoneTasks:', milestoneData.milestoneTasks);

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.createMilestone(milestoneData);

                console.log('📡 Store - Respuesta del API:', response.data);

                const newMilestone = MilestoneAssembler.fromApiToEntity(response.data);

                console.log('✅ Store - Milestone creado con tasks:', newMilestone.milestoneTasks);

                // Agregar a la lista global
                this.milestones.push(newMilestone);

                // Invalidar caches relevantes
                this.projectMilestones.delete(newMilestone.projectId);
                this.milestoneStats.delete(newMilestone.projectId);

                console.log(`✅ Created milestone: ${newMilestone.title}`);
                return newMilestone;
            } catch (error) {
                console.error('❌ Store - Error creating milestone:', error);
                const errorMsg = `Error creating milestone: ${error.message}`;
                this.setError(errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Create milestone from form data
         */
        async createMilestoneFromForm(formData, projectId, createdBy, collaborators = []) {
            const apiData = MilestoneAssembler.fromFormToApi(
                formData,
                projectId,
                createdBy,
                collaborators
            );
            return await this.createMilestone(apiData);
        },

        /**
         * Update a milestone
         */
        async updateMilestone(projectId, milestoneId, updateData) {
            try {
                this.setLoading(true);
                this.clearError();

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.updateMilestone(projectId, milestoneId, updateData);

                const updatedMilestone = MilestoneAssembler.fromApiToEntity(response.data);

                // Actualizar en la lista global
                const index = this.milestones.findIndex(milestone => milestone.id === milestoneId);
                if (index !== -1) {
                    this.milestones[index] = updatedMilestone;
                }

                // Actualizar current milestone si es el mismo
                if (this.currentMilestone && this.currentMilestone.id === milestoneId) {
                    this.currentMilestone = updatedMilestone;
                }

                this.updateOverdueMilestonesStatus();

                // Invalidar caches relevantes
                this.projectMilestones.delete(updatedMilestone.projectId);
                this.milestoneStats.delete(updatedMilestone.projectId);

                console.log(`✅ Updated milestone: ${updatedMilestone.title}`);
                return updatedMilestone;
            } catch (error) {
                const errorMsg = `Error updating milestone: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Update milestone status
         */
        async updateMilestoneStatus(projectId, milestoneId, status, progress = null) {
            try {
                console.log(`🔄 Updating milestone status: ${milestoneId}, status: ${status}, progress: ${progress}`);

                const updateData = MilestoneAssembler.toStatusUpdateApi(milestoneId, status, progress);
                const updatedMilestone = await this.updateMilestone(projectId, milestoneId, updateData);

                // Forzar actualización inmediata en el store
                if (status === 'completed') {
                    const index = this.milestones.findIndex(milestone => milestone.id === milestoneId);
                    if (index !== -1) {
                        this.milestones[index] = updatedMilestone;
                    }

                    // Invalidar caches
                    this.projectMilestones.delete(projectId);
                    this.milestoneStats.delete(projectId);

                    console.log('🎯 Milestone completado - store actualizado');
                }

                return updatedMilestone;
            } catch (error) {
                console.error(`❌ Error updating milestone status for milestone ${milestoneId}:`, error);
                throw error;
            }
        },

        /**
         * Update milestone progress
         */
        async updateMilestoneProgress(projectId, milestoneId, progress) {
            const updateData = MilestoneAssembler.toProgressUpdateApi(milestoneId, progress);
            return await this.updateMilestone(projectId, milestoneId, updateData);
        },

        /**
         * Add a task to a milestone
         */
        async addMilestoneTask(projectId, milestoneId, taskData) {
            try {
                this.setLoading(true);
                this.clearError();

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.addMilestoneTask(projectId, milestoneId, taskData);

                const updatedMilestone = MilestoneAssembler.fromApiToEntity(response.data);

                // Actualizar en la lista global
                const index = this.milestones.findIndex(milestone => milestone.id === milestoneId);
                if (index !== -1) {
                    this.milestones[index] = updatedMilestone;
                }

                // Actualizar current milestone si es el mismo
                if (this.currentMilestone && this.currentMilestone.id === milestoneId) {
                    this.currentMilestone = updatedMilestone;
                }

                // Invalidar caches relevantes
                this.projectMilestones.delete(projectId);
                this.milestoneStats.delete(projectId);

                console.log(`✅ Added task to milestone: ${taskData.title}`);
                return updatedMilestone;
            } catch (error) {
                const errorMsg = `Error adding task to milestone: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Update a task within a milestone
         */
        async updateMilestoneTask(projectId, milestoneId, taskId, updateData) {
            try {
                this.setLoading(true);
                this.clearError();

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.updateMilestoneTask(projectId, milestoneId, taskId, updateData);

                const updatedMilestone = MilestoneAssembler.fromApiToEntity(response.data);

                // Actualizar en la lista global
                const index = this.milestones.findIndex(milestone => milestone.id === milestoneId);
                if (index !== -1) {
                    this.milestones[index] = updatedMilestone;
                }

                // Actualizar current milestone si es el mismo
                if (this.currentMilestone && this.currentMilestone.id === milestoneId) {
                    this.currentMilestone = updatedMilestone;
                }

                // Invalidar caches relevantes
                this.projectMilestones.delete(projectId);
                this.milestoneStats.delete(projectId);

                console.log(`✅ Updated milestone task: ${taskId}`);
                return updatedMilestone;
            } catch (error) {
                const errorMsg = `Error updating milestone task: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Delete a task from a milestone
         */
        async deleteMilestoneTask(projectId, milestoneId, taskId) {
            try {
                this.setLoading(true);
                this.clearError();

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.deleteMilestoneTask(projectId, milestoneId, taskId);

                const updatedMilestone = MilestoneAssembler.fromApiToEntity(response.data);

                // Actualizar en la lista global
                const index = this.milestones.findIndex(milestone => milestone.id === milestoneId);
                if (index !== -1) {
                    this.milestones[index] = updatedMilestone;
                }

                // Actualizar current milestone si es el mismo
                if (this.currentMilestone && this.currentMilestone.id === milestoneId) {
                    this.currentMilestone = updatedMilestone;
                }

                // Invalidar caches relevantes
                this.projectMilestones.delete(projectId);
                this.milestoneStats.delete(projectId);

                console.log(`✅ Deleted milestone task: ${taskId}`);
                return updatedMilestone;
            } catch (error) {
                const errorMsg = `Error deleting milestone task: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Delete a milestone
         */
        async deleteMilestone(projectId, milestoneId) {
            try {
                this.setLoading(true);
                this.clearError();

                const milestonesApi = new MilestonesApi();
                await milestonesApi.deleteMilestone(projectId, milestoneId);

                // Eliminar inmediatamente de la lista global
                this.milestones = this.milestones.filter(milestone => milestone.id !== milestoneId);

                // Limpiar current milestone si es el mismo
                if (this.currentMilestone && this.currentMilestone.id === milestoneId) {
                    this.currentMilestone = null;
                }

                // Invalidar caches completamente
                this.projectMilestones.delete(projectId);
                this.milestoneStats.delete(projectId);

                console.log(`✅ Deleted milestone: ${milestoneId}`);
                return true;
            } catch (error) {
                const errorMsg = `Error deleting milestone: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Load overdue milestones for a project
         */
        async loadOverdueMilestones(projectId) {
            try {
                this.setLoading(true);
                this.clearError();

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.getOverdueMilestones(projectId);

                const milestones = MilestoneAssembler.fromApiArrayToEntityArray(response.data);
                console.log(`✅ Loaded ${milestones.length} overdue milestones for project ${projectId}`);
                return milestones;
            } catch (error) {
                const errorMsg = `Error loading overdue milestones: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Load milestone statistics for a project
         */
        async loadMilestoneStats(projectId) {
            try {
                this.setLoading(true);
                this.clearError();

                const milestonesApi = new MilestonesApi();
                const response = await milestonesApi.getMilestoneStats(projectId);

                // Actualizar cache
                this.milestoneStats.set(projectId, response.data);

                console.log(`✅ Loaded milestone stats for project ${projectId}`);
                return response.data;
            } catch (error) {
                const errorMsg = `Error loading milestone stats: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Clear current milestone
         */
        clearCurrentMilestone() {
            this.currentMilestone = null;
        },

        /**
         * Reset store state
         */
        reset() {
            this.milestones = [];
            this.currentMilestone = null;
            this.loading = false;
            this.error = null;
            this.projectMilestones.clear();
            this.milestoneStats.clear();
        }
    }
})