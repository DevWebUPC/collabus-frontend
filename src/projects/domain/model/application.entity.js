
export class Application {
    constructor({
                    id = null,
                    projectId = null,
                    applicantId = null,
                    applicantName = "",
                    applicantEmail = "",
                    roleId = null,
                    applicantPortfolio = '',
                    applicantPhone = '',
                    cvFile = null,
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
        this.applicantName = applicantName;
        this.applicantEmail = applicantEmail;
        this.roleId = roleId;
        this.applicantPortfolio = applicantPortfolio;
        this.applicantPhone = applicantPhone;
        this.cvFile = cvFile;
        this.cvFileName = cvFileName;
        this.message = message;
        this.acceptedTerms = acceptedTerms;
        this.status = status;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    }

    // ... (el resto de métodos se mantiene igual)

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
