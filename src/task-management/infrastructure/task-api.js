import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Tasks API Service
 * Handles HTTP requests for task-related operations
 */
export class TasksApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        super(baseApi, '/projects');
    }

    /**
     * Get all tasks for a project
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    getProjectTasks(projectId) {
        return this.http.get(`${this.endpointPath}/${projectId}`)
            .then(response => {
                // Extraer tasks del proyecto
                return {
                    data: response.data.tasks || []
                };
            });
    }

    /**
     * Get tasks assigned to a specific collaborator
     * @param {string} projectId - Project ID
     * @param {string} collaboratorId - Collaborator ID
     * @returns {Promise} API response
     */
    getCollaboratorTasks(projectId, collaboratorId) {
        return this.http.get(`${this.endpointPath}/${projectId}`)
            .then(response => {
                const tasks = response.data.tasks || [];
                const collaboratorTasks = tasks.filter(task =>
                    task.assignedTo === collaboratorId
                );
                return { data: collaboratorTasks };
            });
    }

    /**
     * Get a specific task by ID
     * @param {string} taskId - Task ID
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    getTask(projectId, taskId) {
        return this.http.get(`${this.endpointPath}/${projectId}`)
            .then(response => {
                const tasks = response.data.tasks || [];
                const task = tasks.find(t => t.id === taskId);
                return { data: task };
            });
    }


    /**
     * Create a new task
     * @param {Object} taskData - Task data
     * @returns {Promise} API response
     */
    async createTask(taskData) {
        const { projectId, ...task } = taskData;

        // Obtener el proyecto actual
        const projectResponse = await this.http.get(`${this.endpointPath}/${projectId}`);
        const project = projectResponse.data;

        // Agregar la tarea al array de tasks del proyecto
        if (!project.tasks) {
            project.tasks = [];
        }

        const newTask = {
            ...task,
            id: Date.now().toString(), // Generar ID único
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        project.tasks.push(newTask);

        // Actualizar el proyecto con la nueva tarea
        const updateResponse = await this.http.patch(`${this.endpointPath}/${projectId}`, {
            tasks: project.tasks
        });

        return { data: newTask };
    }

    /**
     * Update a task
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} API response
     */
    async updateTask(projectId, taskId, updateData) {
        // Obtener el proyecto actual
        const projectResponse = await this.http.get(`${this.endpointPath}/${projectId}`);
        const project = projectResponse.data;

        // Encontrar y actualizar la tarea
        const taskIndex = project.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        project.tasks[taskIndex] = {
            ...project.tasks[taskIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        // Actualizar el proyecto
        await this.http.patch(`${this.endpointPath}/${projectId}`, {
            tasks: project.tasks
        });

        return { data: project.tasks[taskIndex] };
    }

    /**
     * Delete a task
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @returns {Promise} API response
     */
    async deleteTask(projectId, taskId) {
        // Obtener el proyecto actual
        const projectResponse = await this.http.get(`${this.endpointPath}/${projectId}`);
        const project = projectResponse.data;

        // Filtrar la tarea a eliminar
        const initialLength = project.tasks.length;
        project.tasks = project.tasks.filter(t => t.id !== taskId);

        if (project.tasks.length === initialLength) {
            throw new Error('Task not found');
        }

        // Actualizar el proyecto
        await this.http.patch(`${this.endpointPath}/${projectId}`, {
            tasks: project.tasks
        });

        return { data: { success: true } };
    }

    /**
     * Update task status
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {string} status - New status
     * @param {number} progress - Progress percentage (optional)
     * @returns {Promise} API response
     */
    updateTaskStatus(projectId, taskId, status, progress = null) {
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

        return this.updateTask(projectId, taskId, updateData);
    }

    /**
     * Update task progress
     * @param {string} taskId - Task ID
     * @param {number} progress - Progress percentage
     * @returns {Promise} API response
     */
    updateTaskProgress(taskId, progress) {
        return this.http.patch(`${this.endpointPath}/${taskId}/progress`, {
            progress: progress,
            updatedAt: new Date().toISOString(),
            status: progress === 100 ? 'completed' : 'in_progress'
        });
    }

    /**
     * Update task checklist
     * @param {string} taskId - Task ID
     * @param {Array} checklist - Updated checklist
     * @returns {Promise} API response
     */
    updateTaskChecklist(taskId, checklist) {
        const completedItems = checklist.filter(item => item.completed).length;
        const progress = checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;

        return this.http.patch(`${this.endpointPath}/${taskId}/checklist`, {
            checklist: checklist,
            progress: progress,
            updatedAt: new Date().toISOString(),
            status: progress === 100 ? 'completed' : 'in_progress'
        });
    }

    /**
     * Reassign a task to another collaborator
     * @param {string} taskId - Task ID
     * @param {string} collaboratorId - New collaborator ID
     * @param {string} collaboratorName - New collaborator name
     * @param {string} role - New role
     * @returns {Promise} API response
     */
    reassignTask(taskId, collaboratorId, collaboratorName, role = '') {
        return this.http.patch(`${this.endpointPath}/${taskId}/reassign`, {
            assignedTo: collaboratorId,
            assignedToName: collaboratorName,
            role: role,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Update task due date
     * @param {string} taskId - Task ID
     * @param {string} dueDate - New due date (ISO string)
     * @returns {Promise} API response
     */
    updateTaskDueDate(taskId, dueDate) {
        return this.http.patch(`${this.endpointPath}/${taskId}/due-date`, {
            dueDate: dueDate,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Log time spent on a task
     * @param {string} taskId - Task ID
     * @param {number} hours - Hours to add
     * @returns {Promise} API response
     */
    logTaskTime(taskId, hours) {
        return this.http.patch(`${this.endpointPath}/${taskId}/log-time`, {
            actualHours: hours,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Get overdue tasks for a project
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    getOverdueTasks(projectId) {
        return this.http.get(`${this.endpointPath}/overdue?projectId=${projectId}`);
    }

    /**
     * Get tasks by status for a project
     * @param {string} projectId - Project ID
     * @param {string} status - Task status
     * @returns {Promise} API response
     */
    getTasksByStatus(projectId, status) {
        return this.http.get(`${this.endpointPath}?projectId=${projectId}&status=${status}`);
    }

    /**
     * Get urgent tasks (high priority + due soon)
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    getUrgentTasks(projectId) {
        return this.http.get(`${this.endpointPath}/urgent?projectId=${projectId}`);
    }

    /**
     * Get task statistics for a project
     * @param {string} projectId - Project ID
     * @returns {Promise} API response
     */
    getTaskStats(projectId) {
        return this.http.get(`${this.endpointPath}/stats?projectId=${projectId}`);
    }

    /**
     * Get task statistics for a collaborator
     * @param {string} projectId - Project ID
     * @param {string} collaboratorId - Collaborator ID
     * @returns {Promise} API response
     */
    getCollaboratorTaskStats(projectId, collaboratorId) {
        return this.http.get(`${this.endpointPath}/stats?projectId=${projectId}&assignedTo=${collaboratorId}`);
    }
}
