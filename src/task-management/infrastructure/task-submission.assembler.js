import { TaskSubmission } from '../domain/model/task-submission.entity.js';

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

        // ✅ FORMATO CORRECTO PARA EL BACKEND .NET
        return {
            taskId: parseInt(entity.taskId),
            collaboratorId: parseInt(entity.collaboratorId),
            collaboratorName: entity.collaboratorName || 'Colaborador', // ✅ REQUERIDO
            notes: entity.notes || '',
            links: (entity.links || []).map(link => ({
                url: typeof link === 'string' ? link : link.url,
                description: typeof link === 'string' ? '' : (link.description || '')
            })),
            attachments: (entity.attachments || []).map(attachment => ({
                name: attachment.name || 'archivo',
                type: attachment.type || 'file',
                url: attachment.url || '',
                size: attachment.size || 0
            }))
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