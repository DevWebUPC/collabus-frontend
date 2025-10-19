
import { Task } from '../domain/model/task.entity.js';

/**
 * Task Assembler
 * Transforms data between API and domain entities
 */
export class TaskAssembler {
    /**
     * Transform API response to Task entity
     * @param {Object} apiData - Raw API data
     * @returns {Task} Task entity
     */
    static fromApiToEntity(apiData) {
        if (!apiData) return null;

        return new Task({
            id: apiData.id,
            title: apiData.title || '',
            description: apiData.description || '',
            dueDate: apiData.dueDate,
            status: apiData.status || 'pending',
            priority: apiData.priority || 'medium',
            projectId: apiData.projectId,
            assignedTo: apiData.assignedTo,
            assignedToName: apiData.assignedToName || '',
            role: apiData.role || '',
            checklist: apiData.checklist || [],
            tools: apiData.tools || [],
            comment: apiData.comment || '',
            attachments: apiData.attachments || [],
            progress: apiData.progress || 0,
            estimatedHours: apiData.estimatedHours || 0,
            actualHours: apiData.actualHours || 0,
            createdBy: apiData.createdBy,
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt,
            completedAt: apiData.completedAt
        });
    }

    /**
     * Transform Task entity to API format
     * @param {Task} entity - Task entity
     * @returns {Object} API formatted data
     */
    static fromEntityToApi(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            dueDate: entity.dueDate?.toISOString(),
            status: entity.status,
            priority: entity.priority,
            projectId: entity.projectId,
            assignedTo: entity.assignedTo,
            assignedToName: entity.assignedToName,
            role: entity.role,
            checklist: entity.checklist,
            tools: entity.tools,
            comment: entity.comment,
            attachments: entity.attachments,
            progress: entity.progress,
            estimatedHours: entity.estimatedHours,
            actualHours: entity.actualHours,
            createdBy: entity.createdBy,
            createdAt: entity.createdAt?.toISOString(),
            updatedAt: entity.updatedAt?.toISOString(),
            completedAt: entity.completedAt?.toISOString()
        };
    }

    /**
     * Transform form data from TaskCreateForm to API format
     * @param {Object} formData - Form data from TaskCreateForm.vue
     * @param {string} projectId - Project ID
     * @param {string} createdBy - User ID who created the task
     * @param {string} assignedTo - Collaborator ID
     * @param {string} assignedToName - Collaborator name
     * @param {string} role - Collaborator role
     * @returns {Object} API submission data
     */
    static fromFormToApi(formData, projectId, createdBy, assignedTo, assignedToName, role) {
        return {
            title: formData.title || '',
            description: formData.description || '',
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            status: 'pending',
            priority: formData.priority || 'medium',
            projectId: projectId,
            assignedTo: assignedTo,
            assignedToName: assignedToName,
            role: role,
            checklist: formData.checklist || [],
            tools: formData.tools || [],
            comment: formData.comment || '',
            attachments: formData.attachments || [],
            progress: 0,
            estimatedHours: formData.estimatedHours || 0,
            actualHours: 0,
            createdBy: createdBy
        };
    }


    /**
     * Transform API response array to Task entities array
     * @param {Array} apiDataArray - Array of raw API data
     * @returns {Array<Task>} Array of Task entities
     */
    static fromApiArrayToEntityArray(apiDataArray) {
        if (!Array.isArray(apiDataArray)) return [];
        return apiDataArray.map(this.fromApiToEntity);
    }

    /**
     * Transform Task entities array to API format array
     * @param {Array<Task>} entityArray - Array of Task entities
     * @returns {Array} Array of API formatted data
     */
    static fromEntityArrayToApiArray(entityArray) {
        if (!Array.isArray(entityArray)) return [];
        return entityArray.map(this.fromEntityToApi);
    }

    /**
     * Transform API response to task summary for lists
     * @param {Object} apiData - Raw API data
     * @returns {Object} Task summary
     */
    static toTaskSummary(apiData) {
        if (!apiData) return null;

        const task = this.fromApiToEntity(apiData);

        return {
            id: task.id,
            title: task.title,
            assignedToName: task.assignedToName,
            role: task.role,
            dueDate: task.dueDate,
            status: task.status,
            priority: task.priority,
            progress: task.progress,
            daysRemaining: task.getDaysRemaining(),
            isOverdue: task.isOverdue()
        };
    }

    /**
     * Transform status update data to API format
     * @param {string} taskId - Task ID
     * @param {string} status - New status
     * @param {number} progress - Progress percentage
     * @returns {Object} API status update data
     */
    static toStatusUpdateApi(taskId, status, progress = null) {
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

        return updateData;
    }

    /**
     * Transform progress update data to API format
     * @param {string} taskId - Task ID
     * @param {number} progress - Progress percentage
     * @returns {Object} API progress update data
     */
    static toProgressUpdateApi(taskId, progress) {
        return {
            progress: progress,
            updatedAt: new Date().toISOString(),
            status: progress === 100 ? 'completed' : 'in_progress'
        };
    }

    /**
     * Transform checklist update data to API format
     * @param {string} taskId - Task ID
     * @param {Array} checklist - Updated checklist
     * @returns {Object} API checklist update data
     */
    static toChecklistUpdateApi(taskId, checklist) {
        const completedItems = checklist.filter(item => item.completed).length;
        const progress = checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;

        return {
            checklist: checklist,
            progress: progress,
            updatedAt: new Date().toISOString(),
            status: progress === 100 ? 'completed' : 'in_progress'
        };
    }
}
