import { defineStore } from 'pinia';
import { TasksApi } from '../infrastructure/task-api.js';
import { TaskAssembler } from '../infrastructure/task.assembler.js';

/**
 * Task Store - ACTUALIZADO para backend .NET
 * Manages task state and operations for the task-management bounded context
 */
export const useTaskStore = defineStore('task', {
    state: () => ({
        tasks: [],
        currentTask: null,
        loading: false,
        error: null,
        projectTasks: new Map(), // Cache de tareas por proyecto
        collaboratorTasks: new Map() // Cache de tareas por colaborador
    }),

    getters: {
        /**
         * Get tasks for a specific project
         */
        getProjectTasks: (state) => (projectId) => {
            if (state.projectTasks.has(projectId)) {
                return state.projectTasks.get(projectId);
            }
            return state.tasks.filter(task => task.projectId === projectId);
        },

        /**
         * Get tasks assigned to a specific collaborator
         */
        getCollaboratorTasks: (state) => (projectId, collaboratorId) => {
            const cacheKey = `${projectId}_${collaboratorId}`;
            if (state.collaboratorTasks.has(cacheKey)) {
                return state.collaboratorTasks.get(cacheKey);
            }
            return state.tasks.filter(task =>
                task.projectId === projectId && task.assignedTo === collaboratorId
            );
        },

        /**
         * Get tasks by status for a project
         */
        getTasksByStatus: (state) => (projectId, status) => {
            const projectTasks = state.tasks.filter(task => task.projectId === projectId);
            return projectTasks.filter(task => task.status === status);
        },

        /**
         * Get overdue tasks for a project
         */
        getOverdueTasks: (state) => (projectId) => {
            const projectTasks = state.tasks.filter(task => task.projectId === projectId);
            return projectTasks.filter(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return isOverdue && task.status !== 'completed';
            });
        },

        /**
         * Get urgent tasks (high priority + due soon)
         */
        getUrgentTasks: (state) => (projectId) => {
            const projectTasks = state.tasks.filter(task => task.projectId === projectId);
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            return projectTasks.filter(task =>
                (task.priority === 'high' || task.priority === 'urgent') &&
                task.dueDate && new Date(task.dueDate) <= threeDaysFromNow &&
                task.status !== 'completed'
            );
        },

        /**
         * Get task statistics for a project
         */
        getTaskStats: (state) => (projectId) => {
            const projectTasks = state.tasks.filter(task => task.projectId === projectId);

            const total = projectTasks.length;
            const completed = projectTasks.filter(task => task.status === 'completed').length;
            const inProgress = projectTasks.filter(task => task.status === 'in_progress').length;
            const pending = projectTasks.filter(task => task.status === 'pending').length;
            const overdue = projectTasks.filter(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return isOverdue && task.status !== 'completed';
            }).length;

            const totalProgress = total > 0
                ? Math.round(projectTasks.reduce((sum, task) => sum + task.progress, 0) / total)
                : 0;

            return {
                total,
                completed,
                inProgress,
                pending,
                overdue,
                totalProgress,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        },

        /**
         * Check if store is loading
         */
        isLoading: (state) => state.loading,

        /**
         * Get current error
         */
        getError: (state) => state.error
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
         * Actualizar estados de tareas vencidas automáticamente
         */
        updateOverdueTasksStatus() {
            const now = new Date();

            this.tasks.forEach(task => {
                if (task.status !== 'completed' &&
                    task.dueDate &&
                    new Date(task.dueDate) < now) {
                    task.status = 'retrasado';
                }
            });

            // Limpiar caches ya que los estados han cambiado
            this.projectTasks.clear();
            this.collaboratorTasks.clear();
        },

        async addTaskTool(projectId, taskId, name) {
            try {
                const tasksApi = new TasksApi();
                const response = await tasksApi.addTaskTool(projectId, taskId, name);
                return TaskAssembler.fromApiToEntity(response.data);
            } catch (error) {
                console.error(`❌ Error adding tool to task ${taskId}:`, error);
                throw error;
            }
        },

        async removeTaskTool(projectId, taskId, toolId) {
            try {
                const tasksApi = new TasksApi();
                const response = await tasksApi.removeTaskTool(projectId, taskId, toolId);
                return TaskAssembler.fromApiToEntity(response.data);
            } catch (error) {
                console.error(`❌ Error removing tool from task ${taskId}:`, error);
                throw error;
            }
        },

        async toggleTaskTool(projectId, taskId, toolId) {
            try {
                const tasksApi = new TasksApi();
                const response = await tasksApi.toggleTaskTool(projectId, taskId, toolId);
                return TaskAssembler.fromApiToEntity(response.data);
            } catch (error) {
                console.error(`❌ Error toggling tool in task ${taskId}:`, error);
                throw error;
            }
        },
        /**
         * Load all tasks for a project
         */
        async loadProjectTasks(projectId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.getProjectTasks(projectId);

                const tasks = TaskAssembler.fromApiArrayToEntityArray(response.data);

                // Filtrar tareas existentes de este proyecto y agregar las nuevas
                this.tasks = [
                    ...this.tasks.filter(task => task.projectId !== projectId),
                    ...tasks
                ];

                this.updateOverdueTasksStatus();

                // Actualizar cache de proyecto
                this.projectTasks.set(projectId, tasks);

                console.log(`✅ Loaded ${tasks.length} tasks for project ${projectId}`);
                return tasks;
            } catch (error) {
                const errorMsg = `Error loading project tasks: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Load a specific task by ID
         */
        async loadTask(projectId, taskId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.getTask(projectId, taskId);

                this.currentTask = TaskAssembler.fromApiToEntity(response.data);

                console.log(`✅ Loaded task: ${this.currentTask?.title}`);
                return this.currentTask;
            } catch (error) {
                const errorMsg = `Error loading task: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Create a new task
         */
        async createTask(taskData) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();

                // Convertir a formato API .NET
                const apiData = TaskAssembler.fromFormToApi(
                    taskData,
                    taskData.projectId,
                    taskData.createdBy,
                    taskData.assignedTo,
                    taskData.assignedToName,
                    taskData.role
                );

                const response = await tasksApi.createTask(apiData);
                const newTask = TaskAssembler.fromApiToEntity(response.data);

                // Agregar a la lista global
                this.tasks.push(newTask);

                // Invalidar caches relevantes
                this.projectTasks.delete(newTask.projectId);
                const cacheKey = `${newTask.projectId}_${newTask.assignedTo}`;
                this.collaboratorTasks.delete(cacheKey);

                console.log(`✅ Created task: ${newTask.title}`);
                return newTask;
            } catch (error) {
                const errorMsg = `Error creating task: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Update a task
         */
        async updateTask(projectId, taskId, updateData) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();

                // Preparar datos para la actualización
                const apiUpdateData = {
                    ...updateData,
                    taskId: parseInt(taskId),
                    projectId: parseInt(projectId)
                };

                const response = await tasksApi.updateTask(projectId, taskId, apiUpdateData);
                const updatedTask = TaskAssembler.fromApiToEntity(response.data);

                // ✅ ACTUALIZAR ESTADO BASADO EN FECHA ANTES DE GUARDAR
                updatedTask.updateStatusBasedOnDueDate();

                // Actualizar en la lista global
                const index = this.tasks.findIndex(task => task.id === taskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }

                // Actualizar current task si es el mismo
                if (this.currentTask && this.currentTask.id === taskId) {
                    this.currentTask = updatedTask;
                }

                // ✅ EJECUTAR ACTUALIZACIÓN DE ESTADOS VENCIDOS
                this.updateOverdueTasksStatus();

                // Invalidar caches relevantes
                this.projectTasks.delete(updatedTask.projectId);
                const cacheKey = `${updatedTask.projectId}_${updatedTask.assignedTo}`;
                this.collaboratorTasks.delete(cacheKey);

                console.log(`✅ Updated task: ${updatedTask.title}`);
                return updatedTask;
            } catch (error) {
                const errorMsg = `Error updating task: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Update task status
         */
        async updateTaskStatus(projectId, taskId, status) {
            try {
                console.log(`🔄 Updating task status: ${taskId}, status: ${status}`);

                const tasksApi = new TasksApi();
                const response = await tasksApi.updateTaskStatus(projectId, taskId, status);
                const updatedTask = TaskAssembler.fromApiToEntity(response.data);

                // ✅ FORZAR ACTUALIZACIÓN INMEDIATA EN EL STORE
                const index = this.tasks.findIndex(task => task.id === taskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }

                // Invalidar caches
                this.projectTasks.delete(projectId);
                this.collaboratorTasks.clear();

                console.log('🎯 Task status updated - store updated');
                return updatedTask;
            } catch (error) {
                console.error(`❌ Error updating task status for task ${taskId}:`, error);
                throw error;
            }
        },

        /**
         * Update task due date
         */
        async updateTaskDueDate(projectId, taskId, dueDate, updatedBy) {
            try {
                console.log(`📅 Updating task due date: ${taskId} -> ${dueDate}`);

                const tasksApi = new TasksApi();
                const response = await tasksApi.updateTaskDueDate(projectId, taskId, dueDate, updatedBy);
                const updatedTask = TaskAssembler.fromApiToEntity(response.data);

                // Actualizar en el store
                const index = this.tasks.findIndex(task => task.id === taskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }

                // Invalidar caches
                this.projectTasks.delete(projectId);
                this.collaboratorTasks.clear();

                console.log('✅ Task due date updated - store updated');
                return updatedTask;
            } catch (error) {
                console.error(`❌ Error updating task due date for task ${taskId}:`, error);
                throw error;
            }
        },

        /**
         * Delete a task
         */
        async deleteTask(projectId, taskId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const deletedBy = localStorage.getItem('userId') || '1'; // Obtener ID del usuario actual

                await tasksApi.deleteTask(projectId, taskId, deletedBy);

                // ✅ ELIMINAR INMEDIATAMENTE de la lista global
                this.tasks = this.tasks.filter(task => task.id !== taskId);

                // ✅ LIMPIAR current task si es el mismo
                if (this.currentTask && this.currentTask.id === taskId) {
                    this.currentTask = null;
                }

                // ✅ INVALIDAR CACHES COMPLETAMENTE
                this.projectTasks.clear();
                this.collaboratorTasks.clear();

                console.log(`✅ Deleted task: ${taskId}`);
                return true;
            } catch (error) {
                const errorMsg = `Error deleting task: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Add checklist item to task
         */
        async addChecklistItem(projectId, taskId, text) {
            try {
                const tasksApi = new TasksApi();
                const response = await tasksApi.addChecklistItem(projectId, taskId, text);
                return TaskAssembler.fromApiToEntity(response.data);
            } catch (error) {
                console.error(`❌ Error adding checklist item to task ${taskId}:`, error);
                throw error;
            }
        },

        /**
         * Remove checklist item from task
         */
        async removeChecklistItem(projectId, taskId, itemId) {
            try {
                const tasksApi = new TasksApi();
                const response = await tasksApi.removeChecklistItem(projectId, taskId, itemId);
                return TaskAssembler.fromApiToEntity(response.data);
            } catch (error) {
                console.error(`❌ Error removing checklist item from task ${taskId}:`, error);
                throw error;
            }
        },

        /**
         * Toggle checklist item completion
         */
        async toggleChecklistItem(projectId, taskId, itemId) {
            try {
                const tasksApi = new TasksApi();
                const response = await tasksApi.toggleChecklistItem(projectId, taskId, itemId);
                return TaskAssembler.fromApiToEntity(response.data);
            } catch (error) {
                console.error(`❌ Error toggling checklist item in task ${taskId}:`, error);
                throw error;
            }
        },

        /**
         * Clear current task
         */
        clearCurrentTask() {
            this.currentTask = null;
        },

        /**
         * Reset store state
         */
        reset() {
            this.tasks = [];
            this.currentTask = null;
            this.loading = false;
            this.error = null;
            this.projectTasks.clear();
            this.collaboratorTasks.clear();
        }
    }
});