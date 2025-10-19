/**
 * Task Entity
 * Represents a task assigned to a collaborator in a project
 */
export class Task {
    constructor({
                    id = null,
                    title = '',
                    description = '',
                    dueDate = null,
                    status = 'pending',
                    priority = 'medium',
                    projectId = null,
                    assignedTo = null, // collaboratorId
                    assignedToName = '',
                    role = '',
                    checklist = [],
                    tools = [],
                    comment = '',
                    attachments = [],
                    progress = 0,
                    estimatedHours = 0,
                    actualHours = 0,
                    createdBy = null,
                    createdAt = null,
                    updatedAt = null,
                    completedAt = null
                } = {}) {
        this.id = id || this.generateId();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate ? new Date(dueDate) : null;
        let finalStatus = status;
        if (status !== 'completed' && this.dueDate && new Date() > this.dueDate) {
            finalStatus = 'retrasado';
        }
        this.status = status;
        this.priority = priority;
        this.projectId = projectId;
        this.assignedTo = assignedTo; // collaboratorId
        this.assignedToName = assignedToName;
        this.role = role;
        this.checklist = Array.isArray(checklist) ? checklist.map(item => ({
            id: item.id || this.generateId(),
            text: item.text || '',
            completed: item.completed || false,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
        })) : [];
        this.tools = Array.isArray(tools) ? tools.map(tool => ({
            id: tool.id || this.generateId(),
            name: tool.name || '',
            checked: tool.checked || false
        })) : [];
        this.comment = comment;
        this.attachments = Array.isArray(attachments) ? attachments.map(attachment => ({
            id: attachment.id || this.generateId(),
            name: attachment.name || '',
            type: attachment.type || 'file', // 'file' or 'link'
            url: attachment.url || '',
            icon: attachment.icon || 'pi pi-file',
            uploadedAt: attachment.uploadedAt ? new Date(attachment.uploadedAt) : new Date()
        })) : [];
        this.progress = progress;
        this.estimatedHours = estimatedHours;
        this.actualHours = actualHours;
        this.createdBy = createdBy;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
        this.completedAt = completedAt ? new Date(completedAt) : null;
    }
    /**
     * Actualizar estado automáticamente basado en fecha de vencimiento
     */
    updateStatusBasedOnDueDate() {
        if (this.status === 'completed') return;

        const now = new Date();
        const dueDate = new Date(this.dueDate);

        if (this.dueDate && dueDate < now) {
            // Si la fecha es pasada, marcar como retrasado
            this.status = 'retrasado';
            this.updatedAt = new Date();
        } else if (this.status === 'retrasado' && this.dueDate && dueDate >= now) {
            // Si ya no está vencida, volver a pendiente
            this.status = 'pending';
            this.updatedAt = new Date();
        }
    }

    /**
     * Validar y actualizar estado antes de guardar
     */
    validateAndUpdateStatus() {
        this.updateStatusBasedOnDueDate();
        return this.validate();
    }

    /**
     * Generate a simple unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Business logic methods

    isOverdue() {
        if (!this.dueDate || this.status === 'completed') return false;

        const now = new Date();
        const dueDate = new Date(this.dueDate);

        // Solo comparar fechas (ignorar horas)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        return due < today;
    }

    isCompleted() {
        return this.status === 'completed';
    }

    isInProgress() {
        return this.status === 'in_progress';
    }

    isPending() {
        return this.status === 'pending';
    }

    getDaysRemaining() {
        if (!this.dueDate || this.isCompleted()) return null;

        const now = new Date();
        const diffTime = this.dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    }

    getProgressPercentage() {
        if (this.checklist.length === 0) return this.progress;

        const completedItems = this.checklist.filter(item => item.completed).length;
        return Math.round((completedItems / this.checklist.length) * 100);
    }

    updateProgress() {
        this.progress = this.getProgressPercentage();
        this.updatedAt = new Date();

        // Auto-complete if all checklist items are done
        if (this.progress === 100 && this.status !== 'completed') {
            this.markAsCompleted();
        }
    }

    markAsCompleted() {
        this.status = 'completed';
        this.progress = 100;
        this.completedAt = new Date();
        this.updatedAt = new Date();

        // Mark all checklist items as completed
        this.checklist.forEach(item => {
            item.completed = true;
        });
    }

    markAsInProgress() {
        if (this.status === 'pending') {
            this.status = 'in_progress';
            this.updatedAt = new Date();
        }
    }

    reopen() {
        if (this.status === 'completed') {
            this.status = 'in_progress';
            this.progress = Math.max(0, this.progress - 25); // Reduce progress when reopening
            this.completedAt = null;
            this.updatedAt = new Date();
        }
    }

    addChecklistItem(text) {
        if (text.trim()) {
            const newItem = {
                id: this.generateId(),
                text: text.trim(),
                completed: false,
                createdAt: new Date()
            };
            this.checklist.push(newItem);
            this.updateProgress();
            return newItem;
        }
        return null;
    }

    removeChecklistItem(itemId) {
        const initialLength = this.checklist.length;
        this.checklist = this.checklist.filter(item => item.id !== itemId);

        if (this.checklist.length < initialLength) {
            this.updateProgress();
            return true;
        }
        return false;
    }

    toggleChecklistItem(itemId) {
        const item = this.checklist.find(item => item.id === itemId);
        if (item) {
            item.completed = !item.completed;
            item.updatedAt = new Date();
            this.updateProgress();
            return true;
        }
        return false;
    }

    addTool(name) {
        if (name.trim()) {
            const newTool = {
                id: this.generateId(),
                name: name.trim(),
                checked: false
            };
            this.tools.push(newTool);
            this.updatedAt = new Date();
            return newTool;
        }
        return null;
    }

    removeTool(toolId) {
        const index = this.tools.findIndex(tool => tool.id === toolId);
        if (index > -1) {
            this.tools.splice(index, 1);
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    toggleTool(toolId) {
        const tool = this.tools.find(tool => tool.id === toolId);
        if (tool) {
            tool.checked = !tool.checked;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    addAttachment(attachmentData) {
        const newAttachment = {
            id: attachmentData.id || this.generateId(),
            name: attachmentData.name || '',
            type: attachmentData.type || 'file',
            url: attachmentData.url || '',
            icon: attachmentData.icon || (attachmentData.type === 'link' ? 'pi pi-link' : 'pi pi-file'),
            uploadedAt: new Date()
        };

        this.attachments.push(newAttachment);
        this.updatedAt = new Date();
        return newAttachment;
    }

    removeAttachment(attachmentId) {
        const index = this.attachments.findIndex(att => att.id === attachmentId);
        if (index > -1) {
            this.attachments.splice(index, 1);
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    updateDueDate(newDueDate) {
        this.dueDate = new Date(newDueDate);
        this.updatedAt = new Date();
    }

    updatePriority(newPriority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (validPriorities.includes(newPriority)) {
            this.priority = newPriority;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    reassign(newCollaboratorId, newCollaboratorName, newRole = '') {
        this.assignedTo = newCollaboratorId;
        this.assignedToName = newCollaboratorName;
        this.role = newRole || this.role;
        this.updatedAt = new Date();
    }

    logTime(hours) {
        if (hours > 0) {
            this.actualHours += hours;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    validate() {
        const errors = [];

        if (!this.title.trim()) {
            errors.push('Task title is required');
        }

        if (!this.projectId) {
            errors.push('Project ID is required');
        }

        if (!this.assignedTo) {
            errors.push('Task must be assigned to a collaborator');
        }

        if (!this.dueDate) {
            errors.push('Due date is required');
        } else if (this.dueDate < new Date()) {
            errors.push('Due date cannot be in the past');
        }

        if (this.estimatedHours < 0) {
            errors.push('Estimated hours cannot be negative');
        }

        if (this.actualHours < 0) {
            errors.push('Actual hours cannot be negative');
        }

        // Validate checklist items
        this.checklist.forEach((item, index) => {
            if (!item.text.trim()) {
                errors.push(`Checklist item ${index + 1} cannot be empty`);
            }
        });

        // Validate tools
        this.tools.forEach((tool, index) => {
            if (!tool.name.trim()) {
                errors.push(`Tool ${index + 1} cannot be empty`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Utility methods
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            dueDate: this.dueDate?.toISOString(),
            status: this.status,
            priority: this.priority,
            projectId: this.projectId,
            assignedTo: this.assignedTo,
            assignedToName: this.assignedToName,
            role: this.role,
            checklist: this.checklist,
            tools: this.tools,
            comment: this.comment,
            attachments: this.attachments,
            progress: this.progress,
            estimatedHours: this.estimatedHours,
            actualHours: this.actualHours,
            createdBy: this.createdBy,
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            completedAt: this.completedAt?.toISOString()
        };
    }

    static fromJSON(jsonData) {
        return new Task(jsonData);
    }
}