import { Task } from '../domain/model/task.entity.js';

/**
 * Task Assembler - ADAPTADO para backend .NET
 * Transforms data between .NET API and domain entities
 */
export class TaskAssembler {
    /**
     * Transform .NET API response to Task entity
     * @param {Object} apiData - Raw API data from .NET backend
     * @returns {Task} Task entity
     */
    static fromApiToEntity(apiData) {
        if (!apiData) return null;

        console.log('🔄 Transforming API data to entity:', apiData);

        return new Task({
            id: apiData.id?.toString() || this.generateId(),
            title: apiData.title || '',
            description: apiData.description || '',
            dueDate: apiData.dueDate ? new Date(apiData.dueDate) : null,
            status: apiData.status || 'pending',
            priority: apiData.priority || 'medium',
            projectId: apiData.projectId,
            assignedTo: apiData.assignedTo,
            assignedToName: apiData.assignedToName || '',
            role: apiData.role || '',
            checklist: (apiData.checklist || []).map(item => ({
                id: item.id?.toString() || this.generateId(),
                text: item.text || '',
                completed: item.completed || false,
                createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
            })),
            tools: (apiData.tools || []).map(tool => ({
                id: tool.id?.toString() || this.generateId(),
                name: tool.name || '',
                checked: tool.checked || false
            })),
            attachments: (apiData.attachments || []).map(attachment => ({
                id: attachment.id?.toString() || this.generateId(),
                name: attachment.name || '',
                type: attachment.type || 'file',
                url: attachment.url || '',
                icon: attachment.icon || 'pi pi-file',
                uploadedAt: attachment.uploadedAt ? new Date(attachment.uploadedAt) : new Date()
            })),
            comment: apiData.comment || '',
            progress: apiData.progress || 0,
            estimatedHours: apiData.estimatedHours || 0,
            actualHours: apiData.actualHours || 0,
            createdBy: apiData.createdBy,
            createdAt: apiData.createdAt ? new Date(apiData.createdAt) : new Date(),
            updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : new Date(),
            completedAt: apiData.completedAt ? new Date(apiData.completedAt) : null
        });
    }

    /**
     * Transform Task entity to .NET API format
     * @param {Task} entity - Task entity
     * @returns {Object} .NET API formatted data
     */
    static fromEntityToApi(entity) {
        if (!entity) return null;

        console.log('🔄 Transforming entity to API data:', entity);

        return {
            id: entity.id ? parseInt(entity.id) : 0,
            title: entity.title,
            description: entity.description,
            dueDate: entity.dueDate?.toISOString(),
            status: entity.status,
            priority: entity.priority,
            projectId: entity.projectId,
            assignedTo: entity.assignedTo,
            assignedToName: entity.assignedToName,
            role: entity.role,
            checklist: (entity.checklist || []).map(item => ({
                id: item.id ? parseInt(item.id) : 0,
                text: item.text,
                completed: item.completed || false
            })),
            tools: (entity.tools || []).map(tool => ({
                id: tool.id ? parseInt(tool.id) : 0,
                name: tool.name,
                checked: tool.checked || false
            })),
            comment: entity.comment,
            attachments: (entity.attachments || []).map(attachment => ({
                id: attachment.id ? parseInt(attachment.id) : 0,
                name: attachment.name,
                type: attachment.type,
                url: attachment.url,
                icon: attachment.icon
            })),
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
     * Transform form data from TaskCreateForm to .NET API format
     * @param {Object} formData - Form data from TaskCreateForm.vue
     * @param {number} projectId - Project ID
     * @param {number} createdBy - User ID who created the task
     * @param {number} assignedTo - Collaborator ID
     * @param {string} assignedToName - Collaborator name
     * @param {string} role - Collaborator role
     * @returns {Object} .NET API submission data
     */
    static fromFormToApi(formData, projectId, createdBy, assignedTo, assignedToName, role) {
        console.log('🔄 Transforming form data to API:', formData);

        return {
            title: formData.title || '',
            description: formData.description || '',
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            status: 'pending',
            priority: formData.priority || 'medium',
            projectId: parseInt(projectId),
            assignedTo: parseInt(assignedTo),
            assignedToName: assignedToName,
            role: role,
            checklist: (formData.checklist || []).map(item => ({
                text: item.text,
                completed: item.completed || false
            })),
            tools: (formData.tools || []).map(tool => ({
                name: tool.name,
                checked: tool.checked || false
            })),
            comment: formData.comment || '',
            attachments: (formData.attachments || []).map(attachment => ({
                name: attachment.name,
                type: attachment.type || 'file',
                url: attachment.url || '',
                icon: attachment.icon || 'pi pi-file'
            })),
            estimatedHours: formData.estimatedHours || 0,
            createdBy: parseInt(createdBy)
        };
    }

    /**
     * Transform update form data to .NET API format
     * @param {Object} formData - Form data for update
     * @param {number} projectId - Project ID
     * @param {number} taskId - Task ID
     * @returns {Object} .NET API update data
     */
    static fromUpdateFormToApi(formData, projectId, taskId) {
        return {
            taskId: parseInt(taskId),
            projectId: parseInt(projectId),
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            status: formData.status,
            priority: formData.priority,
            assignedTo: parseInt(formData.assignedTo),
            assignedToName: formData.assignedToName,
            role: formData.role,
            comment: formData.comment,
            estimatedHours: formData.estimatedHours || 0,
            actualHours: formData.actualHours || 0
        };
    }

    /**
     * Transform API response array to Task entities array
     * @param {Array} apiDataArray - Array of raw API data from .NET
     * @returns {Array<Task>} Array of Task entities
     */
    static fromApiArrayToEntityArray(apiDataArray) {
        if (!Array.isArray(apiDataArray)) return [];
        return apiDataArray.map(this.fromApiToEntity);
    }

    /**
     * Transform Task entities array to API format array
     * @param {Array<Task>} entityArray - Array of Task entities
     * @returns {Array} Array of .NET API formatted data
     */
    static fromEntityArrayToApiArray(entityArray) {
        if (!Array.isArray(entityArray)) return [];
        return entityArray.map(this.fromEntityToApi);
    }

    /**
     * Generate a simple unique ID
     * @returns {string} Unique ID
     */
    static generateId() {
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Transform status update data to .NET API format
     * @param {string} status - New status
     * @returns {string} API status data
     */
    static toStatusUpdateApi(status) {
        return status;
    }

    /**
     * Transform due date update data to .NET API format
     * @param {Date} dueDate - New due date
     * @param {number} updatedBy - User ID who updated
     * @returns {Object} API due date update data
     */
    static toDueDateUpdateApi(dueDate, updatedBy) {
        return {
            newDueDate: dueDate.toISOString(),
            updatedBy: updatedBy
        };
    }

    /**
     * Transform delete data to .NET API format
     * @param {number} deletedBy - User ID who deleted
     * @returns {Object} API delete data
     */
    static toDeleteApi(deletedBy) {
        return {
            deletedBy: deletedBy
        };
    }
}