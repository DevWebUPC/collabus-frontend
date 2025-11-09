import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Tasks API Service - ADAPTADO para backend .NET
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
    async getProjectTasks(projectId) {
        try {
            console.log(`📋 Getting tasks for project ${projectId}`);
            const response = await this.http.get(`${this.endpointPath}/${projectId}/tasks`);
            console.log('✅ Tasks received:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error getting project tasks:', error);
            throw error;
        }
    }

    /**
     * Search tasks with filters
     * @param {string} projectId - Project ID
     * @param {Object} filters - Search filters
     * @returns {Promise} API response
     */
    async searchTasks(projectId, filters = {}) {
        try {
            const params = new URLSearchParams();

            if (filters.assignedToName) {
                params.append('assignedToName', filters.assignedToName);
            }
            if (filters.status) {
                params.append('status', filters.status);
            }

            const queryString = params.toString();
            const url = `${this.endpointPath}/${projectId}/tasks/search${queryString ? `?${queryString}` : ''}`;

            const response = await this.http.get(url);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error searching tasks:', error);
            throw error;
        }
    }

    /**
     * Get a specific task by ID
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @returns {Promise} API response
     */
    async getTask(projectId, taskId) {
        try {
            console.log(`🔍 Getting task ${taskId} from project ${projectId}`);
            const response = await this.http.get(`${this.endpointPath}/${projectId}/tasks/${taskId}`);
            console.log('✅ Task received:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error getting task:', error);
            throw error;
        }
    }

    /**
     * Create a new task
     * @param {Object} taskData - Task data in backend format
     * @returns {Promise} API response
     */
    async createTask(taskData) {
        try {
            console.log('🚀 Creating task:', taskData);
            const response = await this.http.post(
                `${this.endpointPath}/${taskData.projectId}/tasks`,
                taskData
            );
            console.log('✅ Task created:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error creating task:', error);
            throw error;
        }
    }

    /**
     * Toggle task tool
     */
    async toggleTaskTool(projectId, taskId, toolId) {
        try {
            console.log(`🔄 Toggling task tool ${toolId} for task ${taskId}`);
            const response = await this.http.patch(
                `${this.endpointPath}/${projectId}/tasks/${taskId}/tools/${toolId}/toggle`
            );
            console.log('✅ Task tool toggled:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error toggling task tool:', error);
            throw error;
        }
    }

    /**
     * Add task tool
     */
    async addTaskTool(projectId, taskId, name) {
        try {
            console.log(`➕ Adding task tool to task ${taskId}: ${name}`);
            const response = await this.http.post(
                `${this.endpointPath}/${projectId}/tasks/${taskId}/tools`,
                { name },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ Task tool added:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error adding task tool:', error);
            throw error;
        }
    }

    /**
     * Remove task tool
     */
    async removeTaskTool(projectId, taskId, toolId) {
        try {
            console.log(`🗑️ Removing task tool ${toolId} from task ${taskId}`);
            const response = await this.http.delete(
                `${this.endpointPath}/${projectId}/tasks/${taskId}/tools/${toolId}`
            );
            console.log('✅ Task tool removed:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error removing task tool:', error);
            throw error;
        }
    }

    /**
     * Update a task
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} API response
     */
    async updateTask(projectId, taskId, updateData) {
        try {
            console.log(`🔄 Updating task ${taskId}:`, updateData);
            const response = await this.http.put(
                `${this.endpointPath}/${projectId}/tasks/${taskId}`,
                updateData
            );
            console.log('✅ Task updated:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error updating task:', error);
            throw error;
        }
    }

    /**
     * Update task status
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {string} status - New status
     * @returns {Promise} API response
     */
    async updateTaskStatus(projectId, taskId, status) {
        try {
            console.log(`🔄 Updating task status: ${taskId} -> ${status}`);
            const response = await this.http.patch(
                `${this.endpointPath}/${projectId}/tasks/${taskId}/status`,
                status, // El backend espera solo el string del status
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ Task status updated:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error updating task status:', error);
            throw error;
        }
    }

    /**
     * Update task due date
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {string} dueDate - New due date (ISO string)
     * @param {string} updatedBy - User ID who updated
     * @returns {Promise} API response
     */
    async updateTaskDueDate(projectId, taskId, dueDate, updatedBy) {
        try {
            console.log(`📅 Updating task due date: ${taskId} -> ${dueDate}`);

            // ✅ CORREGIR: Enviar solo la fecha en el body y updatedBy como query parameter
            const response = await this.http.patch(
                `${this.endpointPath}/${projectId}/tasks/${taskId}/due-date?updatedBy=${updatedBy}`,
                dueDate.toISOString(),  // Solo la fecha ISO en el body
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Task due date updated:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error updating task due date:', error);
            throw error;
        }
    }
    /**
     * Delete a task
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {string} deletedBy - User ID who deleted
     * @returns {Promise} API response
     */
    async deleteTask(projectId, taskId, deletedBy) {
        try {
            console.log(`🗑️ Deleting task ${taskId}`);
            const response = await this.http.delete(
                `${this.endpointPath}/${projectId}/tasks/${taskId}?deletedBy=${deletedBy}`
            );
            console.log('✅ Task deleted successfully');
            return { data: { success: true } };
        } catch (error) {
            console.error('❌ Error deleting task:', error);
            throw error;
        }
    }

    /**
     * Add checklist item to task
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {string} text - Checklist item text
     * @returns {Promise} API response
     */
    async addChecklistItem(projectId, taskId, text) {
        try {
            console.log(`📝 Adding checklist item to task ${taskId}: ${text}`);
            const response = await this.http.post(
                `${this.endpointPath}/${projectId}/tasks/${taskId}/checklist`,
                text,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ Checklist item added:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error adding checklist item:', error);
            throw error;
        }
    }

    /**
     * Remove checklist item from task
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {string} itemId - Checklist item ID
     * @returns {Promise} API response
     */
    async removeChecklistItem(projectId, taskId, itemId) {
        try {
            console.log(`🗑️ Removing checklist item ${itemId} from task ${taskId}`);
            const response = await this.http.delete(
                `${this.endpointPath}/${projectId}/tasks/${taskId}/checklist/${itemId}`
            );
            console.log('✅ Checklist item removed:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error removing checklist item:', error);
            throw error;
        }
    }

    /**
     * Toggle checklist item completion
     * @param {string} projectId - Project ID
     * @param {string} taskId - Task ID
     * @param {string} itemId - Checklist item ID
     * @returns {Promise} API response
     */
    async toggleChecklistItem(projectId, taskId, itemId) {
        try {
            console.log(`🔄 Toggling checklist item ${itemId} for task ${taskId}`);
            const response = await this.http.patch(
                `${this.endpointPath}/${projectId}/tasks/${taskId}/checklist/${itemId}/toggle`
            );
            console.log('✅ Checklist item toggled:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error toggling checklist item:', error);
            throw error;
        }
    }

    /**
     * Create tasks for all accepted applicants
     * @param {Object} baseTaskData - Base task data
     * @returns {Promise} API response
     */
    async createTasksForAllAcceptedApplicants(baseTaskData) {
        try {
            console.log('🚀 Creating tasks for all accepted applicants:', baseTaskData);
            const response = await this.http.post(
                `${this.endpointPath}/${baseTaskData.projectId}/tasks/bulk`,
                baseTaskData
            );
            console.log('✅ Bulk tasks created:', response.data);
            return { data: response.data };
        } catch (error) {
            console.error('❌ Error creating bulk tasks:', error);
            throw error;
        }
    }
}