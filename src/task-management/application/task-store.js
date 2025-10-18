import { defineStore } from 'pinia';
import { TasksApi } from '../infrastructure/task-api.js';
import { TaskAssembler } from '../infrastructure/task.assembler.js';

/**
 * Task Store
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
            return projectTasks.filter(task => task.isOverdue && task.status !== 'completed');
        },

        /**
         * Get urgent tasks (high priority + due soon)
         */
        getUrgentTasks: (state) => (projectId) => {
            const projectTasks = state.tasks.filter(task => task.projectId === projectId);
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            return projectTasks.filter(task =>
                task.priority === 'high' || task.priority === 'urgent' &&
                task.dueDate && task.dueDate <= threeDaysFromNow &&
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
            const overdue = projectTasks.filter(task => task.isOverdue && task.status !== 'completed').length;

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
         * Get task statistics for a collaborator
         */
        getCollaboratorTaskStats: (state) => (projectId, collaboratorId) => {
            const collaboratorTasks = state.tasks.filter(task =>
                task.projectId === projectId && task.assignedTo === collaboratorId
            );

            const total = collaboratorTasks.length;
            const completed = collaboratorTasks.filter(task => task.status === 'completed').length;
            const inProgress = collaboratorTasks.filter(task => task.status === 'in_progress').length;
            const pending = collaboratorTasks.filter(task => task.status === 'pending').length;

            const totalProgress = total > 0
                ? Math.round(collaboratorTasks.reduce((sum, task) => sum + task.progress, 0) / total)
                : 0;

            return {
                total,
                completed,
                inProgress,
                pending,
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
         * Load all tasks for a project
         */
        async loadProjectTasks(projectId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.getProjectTasks(projectId);

                const tasks = TaskAssembler.fromApiArrayToEntityArray(response.data);

                // Actualizar estados de tareas vencidas
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
         * Load tasks for a specific collaborator
         */
        async loadCollaboratorTasks(projectId, collaboratorId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.getCollaboratorTasks(projectId, collaboratorId);

                const tasks = TaskAssembler.fromApiArrayToEntityArray(response.data);

                // Actualizar cache de colaborador
                const cacheKey = `${projectId}_${collaboratorId}`;
                this.collaboratorTasks.set(cacheKey, tasks);

                console.log(`✅ Loaded ${tasks.length} tasks for collaborator ${collaboratorId}`);
                return tasks;
            } catch (error) {
                const errorMsg = `Error loading collaborator tasks: ${error.message}`;
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
        async loadTask(taskId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.getTask(taskId);

                this.currentTask = TaskAssembler.fromApiToEntity(response.data);

                console.log(`✅ Loaded task: ${this.currentTask.title}`);
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
                const response = await tasksApi.createTask(taskData);

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
         * Create task from form data
         */
        async createTaskFromForm(formData, projectId, createdBy, assignedTo, assignedToName, role) {
            const apiData = TaskAssembler.fromFormToApi(
                formData,
                projectId,
                createdBy,
                assignedTo,
                assignedToName,
                role
            );
            return await this.createTask(apiData);
        },

        /**
         * Update a task
         */
        /**
         * Update a task
         */
        async updateTask(projectId, taskId, updateData) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.updateTask(projectId, taskId, updateData);

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
        async updateTaskStatus(taskId, status, progress = null) {
            const updateData = TaskAssembler.toStatusUpdateApi(taskId, status, progress);
            return await this.updateTask(taskId, updateData);
        },

        /**
         * Update task progress
         */
        async updateTaskProgress(taskId, progress) {
            const updateData = TaskAssembler.toProgressUpdateApi(taskId, progress);
            return await this.updateTask(taskId, updateData);
        },

        /**
         * Update task checklist
         */
        async updateTaskChecklist(taskId, checklist) {
            const updateData = TaskAssembler.toChecklistUpdateApi(taskId, checklist);
            return await this.updateTask(taskId, updateData);
        },

        /**
         * Reassign task to another collaborator
         */
        async reassignTask(taskId, collaboratorId, collaboratorName, role = '') {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.reassignTask(taskId, collaboratorId, collaboratorName, role);

                const updatedTask = TaskAssembler.fromApiToEntity(response.data);

                // Actualizar en la lista global
                const index = this.tasks.findIndex(task => task.id === taskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }

                // Invalidar caches relevantes
                this.projectTasks.delete(updatedTask.projectId);
                // Invalidar cache del colaborador anterior y nuevo
                this.collaboratorTasks.forEach((_, key) => {
                    if (key.includes(updatedTask.projectId)) {
                        this.collaboratorTasks.delete(key);
                    }
                });

                console.log(`✅ Reassigned task to: ${collaboratorName}`);
                return updatedTask;
            } catch (error) {
                const errorMsg = `Error reassigning task: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
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
                await tasksApi.deleteTask(projectId, taskId);

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
         * Load overdue tasks for a project
         */
        async loadOverdueTasks(projectId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.getOverdueTasks(projectId);

                const tasks = TaskAssembler.fromApiArrayToEntityArray(response.data);
                console.log(`✅ Loaded ${tasks.length} overdue tasks for project ${projectId}`);
                return tasks;
            } catch (error) {
                const errorMsg = `Error loading overdue tasks: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Load urgent tasks for a project
         */
        async loadUrgentTasks(projectId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.getUrgentTasks(projectId);

                const tasks = TaskAssembler.fromApiArrayToEntityArray(response.data);
                console.log(`✅ Loaded ${tasks.length} urgent tasks for project ${projectId}`);
                return tasks;
            } catch (error) {
                const errorMsg = `Error loading urgent tasks: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Load task statistics for a project
         */
        async loadTaskStats(projectId) {
            try {
                this.setLoading(true);
                this.clearError();

                const tasksApi = new TasksApi();
                const response = await tasksApi.getTaskStats(projectId);

                console.log(`✅ Loaded task stats for project ${projectId}`);
                return response.data;
            } catch (error) {
                const errorMsg = `Error loading task stats: ${error.message}`;
                this.setError(errorMsg);
                console.error('❌', errorMsg);
                throw error;
            } finally {
                this.setLoading(false);
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