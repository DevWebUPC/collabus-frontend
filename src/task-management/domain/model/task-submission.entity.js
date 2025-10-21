export class TaskSubmission {
    constructor({
                    id = null,
                    taskId = null,
                    collaboratorId = null,
                    submittedAt = null,
                    links = [], // Array de enlaces (strings)
                    attachments = [], // Array de archivos (objetos con nombre, url, tipo, etc.)
                    notes = '', // Notas del colaborador
                    status = 'submitted', // submitted, reviewed, etc.
                    reviewedAt = null,
                    reviewerId = null,
                    reviewNotes = '',
                    createdAt = null,
                    updatedAt = null
                } = {}) {
        this.id = id;
        this.taskId = taskId;
        this.collaboratorId = collaboratorId;
        this.submittedAt = this.parseDate(submittedAt);
        this.links = links;
        this.attachments = attachments;
        this.notes = notes;
        this.status = status;
        this.reviewedAt = this.parseDate(reviewedAt);
        this.reviewerId = reviewerId;
        this.reviewNotes = reviewNotes;
        this.createdAt = this.parseDate(createdAt) || new Date();
        this.updatedAt = this.parseDate(updatedAt) || new Date();
    }

    parseDate(dateValue) {
        if (!dateValue) return null;
        if (dateValue instanceof Date) return dateValue;

        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
    }

    // Métodos de negocio
    markAsReviewed(reviewerId, notes) {
        this.status = 'reviewed';
        this.reviewerId = reviewerId;
        this.reviewNotes = notes;
        this.reviewedAt = new Date();
        this.updatedAt = new Date();
    }

    isReviewed() {
        return this.status === 'reviewed';
    }

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
                id: attachment.id || Date.now().toString(),
                name: attachment.name,
                type: attachment.type,
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

        if (!this.taskId) {
            errors.push('Task ID is required');
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
}