import { Application } from '../domain/model/application.entity.js';

/**
 * Application Assembler
 * Transforms data between API and domain entities
 */
export class ApplicationAssembler {
    /**
     * Transform API response to Application entity
     * @param {Object} apiData - Raw API data
     * @returns {Application} Application entity
     */
    static fromApiToEntity(apiData) {
        if (!apiData) return null;

        return new Application({
            id: apiData.id,
            projectId: Number(apiData.projectId),
            projectTitle: apiData.projectTitle || '',
            applicantId: apiData.applicantId,
            applicantName: apiData.applicantName || '',
            applicantEmail: apiData.applicantEmail || '',
            applicantPortfolio: apiData.applicantPortfolio || '',
            applicantPhone: apiData.applicantPhone || '',
            roleId: apiData.roleId,
            roleName: apiData.roleName || '',
            cvFile: apiData.cvFile || null,
            cvFileName: apiData.cvFileName || '',
            cvUrl: apiData.cvUrl || '',
            message: apiData.message || '',
            acceptedTerms: apiData.acceptedTerms || false,
            status: apiData.status || 'pending',
            appliedAt: apiData.appliedAt,
            reviewedAt: apiData.reviewedAt,
            reviewedBy: apiData.reviewedBy,
            reviewNotes: apiData.reviewNotes || '',
            project: apiData.project || null,
            role: apiData.role || null,
            applicant: apiData.applicant || null
        });
    }

    /**
     * Transform Application entity to API format
     * @param {Application} entity - Application entity
     * @returns {Object} API formatted data
     */
    static fromEntityToApi(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            projectId: Number(entity.projectId),            projectTitle: entity.projectTitle,
            applicantId: entity.applicantId,
            applicantName: entity.applicantName,
            applicantEmail: entity.applicantEmail,
            applicantPortfolio: entity.applicantPortfolio,
            applicantPhone: entity.applicantPhone,
            roleId: entity.roleId,
            roleName: entity.roleName,
            cvFile: entity.cvFile, // Incluir el archivo base64
            cvFileName: entity.cvFileName,
            cvUrl: entity.cvUrl,
            message: entity.message,
            acceptedTerms: entity.acceptedTerms,
            status: entity.status,
            appliedAt: entity.appliedAt?.toISOString(),
            reviewedAt: entity.reviewedAt?.toISOString(),
            reviewedBy: entity.reviewedBy,
            reviewNotes: entity.reviewNotes
        };
    }
    /**
     * Transform API response array to Application entities array
     * @param {Array} apiDataArray - Array of raw API data
     * @returns {Array<Application>} Array of Application entities
     */
    static fromApiArrayToEntityArray(apiDataArray) {
        if (!Array.isArray(apiDataArray)) return [];
        return apiDataArray.map(this.fromApiToEntity);
    }

    /**
     * Transform Application entities array to API format array
     * @param {Array<Application>} entityArray - Array of Application entities
     * @returns {Array} Array of API formatted data
     */
    static fromEntityArrayToApiArray(entityArray) {
        if (!Array.isArray(entityArray)) return [];
        return entityArray.map(this.fromEntityToApi);
    }

    /**
     * Transform form data to API submission format
     * @param {Object} formData - Form data from ProjectApplication.vue
     * @param {string} userId - Current user ID
     * @returns {Object} API submission data
     */
    static fromFormToApi(formData, userId) {
        return {
            projectId: Number(formData.projectId),            applicantId: userId,
            applicantName: formData.applicantName,
            applicantEmail: formData.applicantEmail,
            applicantPortfolio: formData.applicantPortfolio,
            applicantPhone: formData.applicantPhone,
            roleId: formData.roleId,
            message: formData.message,
            acceptedTerms: formData.acceptedTerms,
            cvFile: formData.cvFile, // Incluir el archivo base64
            cvFileName: formData.cvFileName
        };
    }

    /**
     * Transform API response to application summary for lists
     * @param {Object} apiData - Raw API data
     * @returns {Object} Application summary
     */
    static toApplicationSummary(apiData) {
        if (!apiData) return null;

        const application = this.fromApiToEntity(apiData);

        return {
            id: application.id,
            projectTitle: application.projectTitle,
            roleName: application.roleName,
            applicantName: application.applicantName,
            status: application.status,
            appliedAt: application.appliedAt,
            daysSinceApplied: application.getDaysSinceApplied(),
            cvUrl: application.cvUrl,
            projectId: application.projectId
        };
    }

    /**
     * Transform API response to detailed application view
     * @param {Object} apiData - Raw API data
     * @returns {Object} Detailed application data
     */
    static toApplicationDetail(apiData) {
        if (!apiData) return null;

        const application = this.fromApiToEntity(apiData);

        return {
            application,
            project: application.project,
            role: application.role,
            applicant: application.applicant,
            canWithdraw: application.canBeWithdrawn(),
            canEdit: application.canBeEdited(),
            isAccepted: application.isAccepted(),
            isRejected: application.isRejected()
        };
    }

    /**
     * Transform status update data to API format
     * @param {string} applicationId - Application ID
     * @param {string} status - New status
     * @param {string} reviewNotes - Review notes
     * @param {string} reviewerId - Reviewer ID
     * @returns {Object} API status update data
     */
    static toStatusUpdateApi(applicationId, status, reviewNotes = '', reviewerId = null) {
        return {
            applicationId,
            status,
            reviewNotes,
            reviewedBy: reviewerId,
            reviewedAt: new Date().toISOString()
        };
    }

    /**
     * Transform bulk status update data to API format
     * @param {Array} applicationIds - Array of application IDs
     * @param {string} status - New status
     * @param {string} reviewNotes - Review notes
     * @param {string} reviewerId - Reviewer ID
     * @returns {Object} API bulk status update data
     */
    static toBulkStatusUpdateApi(applicationIds, status, reviewNotes = '', reviewerId = null) {
        return {
            applicationIds,
            status,
            reviewNotes,
            reviewedBy: reviewerId,
            reviewedAt: new Date().toISOString()
        };
    }
}