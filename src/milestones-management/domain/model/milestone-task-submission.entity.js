export class MilestoneTaskSubmission {
    constructor({
                    id = null,
                    milestoneTaskId = null,        // ID de la tarea del hito
                    collaboratorId = null,         // ID del colaborador que envía
                    submittedAt = null,            // Fecha de envío
                    links = [],                    // Array de enlaces (strings)
                    attachments = [],              // Array de archivos adjuntos
                    notes = '',                    // Notas del colaborador
                    status = 'submitted',          // Solo submitted, ya que no hay revisión
                    milestoneId = null,            // ID del hito (para fácil acceso)
                    projectId = null,              // ID del proyecto (para fácil acceso)
                    createdAt = null,
                    updatedAt = null
                } = {}) {
        this.id = id || this.generateId();
        this.milestoneTaskId = milestoneTaskId;
        this.collaboratorId = collaboratorId;
        this.submittedAt = this.parseDate(submittedAt) || new Date();
        this.links = links;
        this.attachments = attachments;
        this.notes = notes;
        this.status = status; // Siempre será 'submitted'
        this.milestoneId = milestoneId;
        this.projectId = projectId;
        this.createdAt = this.parseDate(createdAt) || new Date();
        this.updatedAt = this.parseDate(updatedAt) || new Date();
    }

    parseDate(dateValue) {
        if (!dateValue) return null;
        if (dateValue instanceof Date) return dateValue;

        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
    }

    generateId() {
        return `milestone_submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Métodos para agregar y quitar enlaces y adjuntos
    addLink(link) {
        if (link.trim()) {
            this.links.push(link.trim());
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    removeLink(linkIndex) {
        if (linkIndex >= 0 && linkIndex < this.links.length) {
            this.links.splice(linkIndex, 1);
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    addAttachment(attachment) {
        if (attachment) {
            this.attachments.push({
                id: attachment.id || this.generateId(),
                name: attachment.name,
                type: attachment.type || 'file',
                url: attachment.url,
                uploadedAt: new Date()
            });
            this.updatedAt = new Date();
            return true;
        }
        return false;
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

    validate() {
        const errors = [];

        if (!this.milestoneTaskId) {
            errors.push('Milestone Task ID is required');
        }

        if (!this.collaboratorId) {
            errors.push('Collaborator ID is required');
        }

        if (this.links.length === 0 && this.attachments.length === 0) {
            errors.push('At least one link or attachment is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Métodos de utilidad
    toJSON() {
        return {
            id: this.id,
            milestoneTaskId: this.milestoneTaskId,
            collaboratorId: this.collaboratorId,
            submittedAt: this.submittedAt?.toISOString(),
            links: this.links,
            attachments: this.attachments,
            notes: this.notes,
            status: this.status,
            milestoneId: this.milestoneId,
            projectId: this.projectId,
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString()
        };
    }

    static fromJSON(jsonData) {
        return new MilestoneTaskSubmission(jsonData);
    }
}