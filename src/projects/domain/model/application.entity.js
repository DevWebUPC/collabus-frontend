export class Application {
    constructor({
                    id = null,
                    projectId = null,
                    applicantId = null,
                    roleId = null,
                    portfolioLink = '',
                    phone = '',
                    cvFile = null, // Cambiar a null por defecto
                    cvFileName = '',
                    message = '',
                    acceptedTerms = false,
                    status = 'pending',
                    createdAt = null,
                    updatedAt = null,
                } = {}) {
        this.id = id;
        this.projectId = projectId;
        this.applicantId = applicantId;
        this.roleId = roleId;
        this.portfolioLink = portfolioLink;
        this.phone = phone;
        this.cvFile = cvFile;
        this.cvFileName = cvFileName;
        this.message = message;
        this.acceptedTerms = acceptedTerms;
        this.status = status;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    }

    // Métodos de negocio
    isPending() {
        return this.status === 'pending';
    }

    isAccepted() {
        return this.status === 'accepted';
    }

    isRejected() {
        return this.status === 'rejected';
    }

    accept() {
        this.status = 'accepted';
        this.updatedAt = new Date();
    }

    reject() {
        this.status = 'rejected';
        this.updatedAt = new Date();
    }

    validate() {
        const errors = [];

        if (!this.projectId) {
            errors.push('Project ID is required');
        }

        if (!this.applicantId) {
            errors.push('Applicant ID is required');
        }

        if (!this.roleId) {
            errors.push('Role ID is required');
        }

        // Validar que exista el archivo CV
        if (!this.cvFile && !this.cvFileName) {
            errors.push('CV file is required');
        }

        if (!this.message.trim()) {
            errors.push('Message is required');
        }

        if (!this.acceptedTerms) {
            errors.push('You must accept the terms and conditions');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Método para obtener el contenido del CV
    getCvContent() {
        return this.cvFile;
    }

    // Método para verificar si tiene CV
    hasCv() {
        return !!this.cvFile || !!this.cvFileName;
    }
}