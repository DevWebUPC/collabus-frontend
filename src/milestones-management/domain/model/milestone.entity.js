/**
 * Milestone Entity
 * Represents a group milestone containing multiple collaborative tasks
 * Milestones are team objectives, not individual tasks
 */
export class Milestone {
    constructor({
                    id = null,
                    title = '',
                    description = '',
                    tools = [],
                    generalComment = '',
                    dueDate = null,
                    attachments = [],
                    milestoneTasks = [], // Tareas específicas del hito (no las tasks individuales del proyecto)
                    status = 'active',
                    progress = 0,
                    projectId = null,
                    createdBy = null,
                    createdAt = null,
                    updatedAt = null,
                    completedAt = null
                } = {}) {
        this.id = id || this.generateId();
        this.title = title;
        this.description = description;
        this.tools = Array.isArray(tools) ? tools : [];
        this.generalComment = generalComment;
        this.dueDate = dueDate ? new Date(dueDate) : null;
        this.attachments = Array.isArray(attachments) ? attachments.map(attachment => ({
            id: attachment.id || this.generateId(),
            name: attachment.name || '',
            type: attachment.type || 'file', // 'file' or 'link'
            url: attachment.url || '',
            icon: attachment.icon || (attachment.type === 'link' ? 'pi pi-link' : 'pi pi-file'),
            uploadedAt: attachment.uploadedAt ? new Date(attachment.uploadedAt) : new Date()
        })) : [];
        this.milestoneTasks = Array.isArray(milestoneTasks) ? milestoneTasks.map(task =>
            typeof task === 'object' ? {
                id: task.id || this.generateId(),
                title: task.title || '',
                description: task.description || '',
                assignedTo: task.assignedTo || null,
                assignedToName: task.assignedToName || '',
                checklist: Array.isArray(task.checklist) ? task.checklist.map(item => ({
                    id: item.id || this.generateId(),
                    text: item.text || '',
                    completed: item.completed || false
                })) : [],
                attachments: Array.isArray(task.attachments) ? task.attachments.map(att => ({
                    id: att.id || this.generateId(),
                    name: att.name || '',
                    type: att.type || 'file',
                    url: att.url || '',
                    icon: att.icon || 'pi pi-file'
                })) : [],
                comment: task.comment || '',
                status: task.status || 'pending',
                progress: task.progress || 0,
                dueDate: task.dueDate ? new Date(task.dueDate) : null
            } : task
        ) : [];
        this.status = status; // 'active', 'completed'
        this.progress = progress;
        this.projectId = projectId;
        this.createdBy = createdBy;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
        this.completedAt = completedAt ? new Date(completedAt) : null;
    }

    /**
     * Generate a simple unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Business logic methods

    isOverdue() {
        if (!this.dueDate || this.status === 'completed') return false;

        const now = new Date();
        const dueDate = new Date(this.dueDate);
        return dueDate < now;
    }

    isCompleted() {
        return this.status === 'completed';
    }

    isActive() {
        return this.status === 'active';
    }

    getProgressPercentage() {
        if (this.milestoneTasks.length === 0) return this.progress;

        const totalProgress = this.milestoneTasks.reduce((sum, task) => sum + task.progress, 0);
        return Math.round(totalProgress / this.milestoneTasks.length);
    }

    updateProgress() {
        this.progress = this.getProgressPercentage();
        this.updatedAt = new Date();

        // Auto-complete if all milestone tasks are done
        if (this.progress === 100 && this.status !== 'completed') {
            this.markAsCompleted();
        }
    }

    markAsCompleted() {
        this.status = 'completed';
        this.progress = 100;
        this.completedAt = new Date();
        this.updatedAt = new Date();

        // Mark all milestone tasks as completed
        this.milestoneTasks.forEach(task => {
            task.status = 'completed';
            task.progress = 100;
        });
    }

    markAsActive() {
        if (this.status === 'completed') {
            this.status = 'active';
            this.completedAt = null;
            this.updatedAt = new Date();
        }
    }

    // Métodos para gestionar las milestone tasks (tareas del hito)
    addMilestoneTask(taskData) {
        const newTask = {
            id: this.generateId(),
            title: taskData.title || '',
            description: taskData.description || '',
            assignedTo: taskData.assignedTo || null,
            assignedToName: taskData.assignedToName || '',
            checklist: Array.isArray(taskData.checklist) ? taskData.checklist.map(item => ({
                id: this.generateId(),
                text: item.text || item,
                completed: false
            })) : [],
            attachments: [],
            comment: taskData.comment || '',
            status: 'pending',
            progress: 0,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null
        };

        this.milestoneTasks.push(newTask);
        this.updateProgress();
        return newTask;
    }

    removeMilestoneTask(taskId) {
        const initialLength = this.milestoneTasks.length;
        this.milestoneTasks = this.milestoneTasks.filter(task => task.id !== taskId);

        if (this.milestoneTasks.length < initialLength) {
            this.updateProgress();
            return true;
        }
        return false;
    }

    getMilestoneTask(taskId) {
        return this.milestoneTasks.find(task => task.id === taskId);
    }

    updateMilestoneTask(taskId, updates) {
        const task = this.getMilestoneTask(taskId);
        if (task) {
            Object.assign(task, updates);
            task.updatedAt = new Date();
            this.updateProgress();
            return true;
        }
        return false;
    }

    getMilestoneTasksByCollaborator(collaboratorId) {
        return this.milestoneTasks.filter(task => task.assignedTo === collaboratorId);
    }

    getCompletedMilestoneTasks() {
        return this.milestoneTasks.filter(task => task.status === 'completed');
    }

    // Métodos para herramientas
    addTool(name) {
        if (name.trim()) {
            this.tools.push(name.trim());
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    removeTool(toolName) {
        const index = this.tools.indexOf(toolName);
        if (index > -1) {
            this.tools.splice(index, 1);
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Métodos para archivos
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

    getDaysRemaining() {
        if (!this.dueDate || this.isCompleted()) return null;

        const now = new Date();
        const diffTime = this.dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    }

    // Método para crear desde el formulario Vue
    static fromFormData(formData, projectId, createdBy, collaborators = []) {
        const milestoneTasks = formData.tareas.map(tarea => {
            const collaborator = collaborators.find(c => c.id === tarea.colaborador?.id);
            return {
                title: tarea.nombre,
                description: tarea.descripcion,
                assignedTo: tarea.colaborador?.id,
                assignedToName: collaborator?.name || tarea.colaborador?.name || '',
                checklist: tarea.checklist.map(item => ({
                    text: item,
                    completed: false
                })),
                attachments: [
                    ...tarea.archivos.map(archivo => ({
                        name: archivo.name,
                        type: 'file',
                        url: URL.createObjectURL(archivo)
                    })),
                    ...tarea.enlaces.map(enlace => ({
                        name: enlace.nombre,
                        type: 'link',
                        url: enlace.url,
                        icon: 'pi pi-link'
                    }))
                ],
                comment: '',
                status: 'pending',
                progress: 0
            };
        });

        return new Milestone({
            title: formData.nombre,
            description: formData.descripcion,
            tools: formData.herramientas,
            generalComment: formData.comentarioGeneral,
            dueDate: formData.fechaVencimiento,
            attachments: [
                ...formData.archivosAdjuntos.map(archivo => ({
                    name: archivo.name,
                    type: 'file',
                    url: URL.createObjectURL(archivo)
                })),
                ...formData.enlacesAdjuntos.map(enlace => ({
                    name: enlace.nombre,
                    type: 'link',
                    url: enlace.url,
                    icon: 'pi pi-link'
                }))
            ],
            milestoneTasks: milestoneTasks,
            projectId: projectId,
            createdBy: createdBy
        });
    }

    // Utility methods
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            tools: this.tools,
            generalComment: this.generalComment,
            dueDate: this.dueDate?.toISOString(),
            attachments: this.attachments,
            milestoneTasks: this.milestoneTasks,
            status: this.status,
            progress: this.progress,
            projectId: this.projectId,
            createdBy: this.createdBy,
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            completedAt: this.completedAt?.toISOString()
        };
    }

    static fromJSON(jsonData) {
        return new Milestone(jsonData);
    }
}
