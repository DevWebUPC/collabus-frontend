import { MilestoneTaskSubmission } from '../domain/model/milestone-task-submission.entity.js';

export class MilestoneTaskSubmissionAssembler {
    /**
     * Transform API response to MilestoneTaskSubmission entity
     * @param {Object} apiData - Raw API data
     * @returns {MilestoneTaskSubmission} MilestoneTaskSubmission entity
     */
    static fromApiToEntity(apiData) {
        if (!apiData) return null;

        return new MilestoneTaskSubmission({
            id: apiData.id,
            milestoneTaskId: apiData.milestoneTaskId,
            collaboratorId: apiData.collaboratorId,
            submittedAt: apiData.submittedAt,
            links: apiData.links || [],
            attachments: apiData.attachments || [],
            notes: apiData.notes || '',
            status: apiData.status || 'submitted',
            milestoneId: apiData.milestoneId,
            projectId: apiData.projectId,
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt
        });
    }

    /**
     * Transform MilestoneTaskSubmission entity to API format
     * @param {MilestoneTaskSubmission} entity - MilestoneTaskSubmission entity
     * @returns {Object} API formatted data
     */
    static fromEntityToApi(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            milestoneTaskId: entity.milestoneTaskId,
            collaboratorId: entity.collaboratorId,
            submittedAt: entity.submittedAt?.toISOString(),
            links: entity.links,
            attachments: entity.attachments,
            notes: entity.notes,
            status: entity.status,
            milestoneId: entity.milestoneId,
            projectId: entity.projectId,
            createdAt: entity.createdAt?.toISOString(),
            updatedAt: entity.updatedAt?.toISOString()
        };
    }

    /**
     * Transform form data to API format for submission
     * @param {Object} formData - Form data from MilestoneTaskSubmitView.vue
     * @param {string} milestoneTaskId - Milestone Task ID
     * @param {string} collaboratorId - Collaborator ID
     * @param {string} milestoneId - Milestone ID
     * @param {string} projectId - Project ID
     * @returns {Object} API submission data
     */
    static fromFormToApi(formData, milestoneTaskId, collaboratorId, milestoneId, projectId) {
        console.log('🔧 Assembler - Transformando datos del formulario:', {
            formData,
            milestoneTaskId,
            collaboratorId,
            milestoneId,
            projectId
        });

        // Transform files to attachments format
        const fileAttachments = (formData.files || []).map(file => ({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: 'file',
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString()
        }));

        // Transform links to attachments format
        const linkAttachments = (formData.links || []).map(link => ({
            id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `Enlace - ${link}`,
            type: 'link',
            url: link,
            uploadedAt: new Date().toISOString()
        }));

        const apiData = {
            milestoneTaskId: milestoneTaskId.toString(),
            collaboratorId: collaboratorId.toString(),
            submittedAt: new Date().toISOString(),
            links: formData.links || [],
            attachments: [...fileAttachments, ...linkAttachments],
            notes: formData.notes || '',
            status: 'submitted',
            milestoneId: milestoneId.toString(),
            projectId: projectId.toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('📤 API data preparada:', apiData);
        return apiData;
    }
    /**
     * Transform API response array to MilestoneTaskSubmission entities array
     * @param {Array} apiDataArray - Array of raw API data
     * @returns {Array<MilestoneTaskSubmission>} Array of MilestoneTaskSubmission entities
     */
    static fromApiArrayToEntityArray(apiDataArray) {
        if (!Array.isArray(apiDataArray)) return [];
        return apiDataArray.map(this.fromApiToEntity);
    }

    /**
     * Transform MilestoneTaskSubmission entities array to API format array
     * @param {Array<MilestoneTaskSubmission>} entityArray - Array of MilestoneTaskSubmission entities
     * @returns {Array} Array of API formatted data
     */
    static fromEntityArrayToApiArray(entityArray) {
        if (!Array.isArray(entityArray)) return [];
        return entityArray.map(this.fromEntityToApi);
    }

    /**
     * Transform submission data for task update
     * @param {Object} submissionData - Submission data
     * @returns {Object} Task update data
     */
    static toTaskUpdateData(submissionData) {
        return {
            status: 'completed',
            progress: 100,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
}