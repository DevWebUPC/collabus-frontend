import { TaskSubmission } from '../domain/model/TaskSubmission.js';

export class TaskSubmissionAssembler {
    static fromApiToEntity(apiData) {
        if (!apiData) return null;

        return new TaskSubmission({
            id: apiData.id,
            taskId: apiData.taskId,
            collaboratorId: apiData.collaboratorId,
            submittedAt: apiData.submittedAt,
            links: apiData.links || [],
            attachments: apiData.attachments || [],
            notes: apiData.notes || '',
            status: apiData.status || 'submitted',
            reviewedAt: apiData.reviewedAt,
            reviewerId: apiData.reviewerId,
            reviewNotes: apiData.reviewNotes || '',
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt
        });
    }

    static fromEntityToApi(entity) {
        if (!entity) return null;

        const safeDate = (date) => {
            if (!date) return null;
            const dateObj = date instanceof Date ? date : new Date(date);
            return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
        };

        return {
            id: entity.id,
            taskId: entity.taskId,
            collaboratorId: entity.collaboratorId,
            submittedAt: safeDate(entity.submittedAt),
            links: entity.links,
            attachments: entity.attachments,
            notes: entity.notes,
            status: entity.status,
            reviewedAt: safeDate(entity.reviewedAt),
            reviewerId: entity.reviewerId,
            reviewNotes: entity.reviewNotes,
            createdAt: safeDate(entity.createdAt),
            updatedAt: safeDate(entity.updatedAt)
        };
    }

    static fromApiArrayToEntityArray(apiDataArray) {
        if (!Array.isArray(apiDataArray)) return [];
        return apiDataArray.map(this.fromApiToEntity);
    }

    static fromEntityArrayToApiArray(entityArray) {
        if (!Array.isArray(entityArray)) return [];
        return entityArray.map(this.fromEntityToApi);
    }
}