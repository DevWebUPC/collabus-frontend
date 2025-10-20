import { Milestone } from '../domain/model/milestone.entity.js';

/**
 * Milestone Assembler
 * Transforms data between API and domain entities
 */
export class MilestoneAssembler {
    /**
     * Transform API response to Milestone entity
     * @param {Object} apiData - Raw API data
     * @returns {Milestone} Milestone entity
     */
    static fromApiToEntity(apiData) {
        if (!apiData) return null;

        return new Milestone({
            id: apiData.id,
            title: apiData.title || '',
            description: apiData.description || '',
            tools: apiData.tools || [],
            generalComment: apiData.generalComment || '',
            dueDate: apiData.dueDate,
            attachments: apiData.attachments || [],
            milestoneTasks: apiData.milestoneTasks || [],
            status: apiData.status || 'active',
            progress: apiData.progress || 0,
            projectId: apiData.projectId,
            createdBy: apiData.createdBy,
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt,
            completedAt: apiData.completedAt
        });
    }

    /**
     * Transform Milestone entity to API format
     * @param {Milestone} entity - Milestone entity
     * @returns {Object} API formatted data
     */
    static fromEntityToApi(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            tools: entity.tools,
            generalComment: entity.generalComment,
            dueDate: entity.dueDate?.toISOString(),
            attachments: entity.attachments,
            milestoneTasks: entity.milestoneTasks,
            status: entity.status,
            progress: entity.progress,
            projectId: entity.projectId,
            createdBy: entity.createdBy,
            createdAt: entity.createdAt?.toISOString(),
            updatedAt: entity.updatedAt?.toISOString(),
            completedAt: entity.completedAt?.toISOString()
        };
    }

    /**
     * Transform form data from MilestoneCreateForm to API format
     * @param {Object} formData - Form data from MilestoneCreateForm.vue
     * @param {string} projectId - Project ID
     * @param {string} createdBy - User ID who created the milestone
     * @param {Array} collaborators - List of collaborators for the project
     * @returns {Object} API submission data
     */
    static fromFormToApi(formData, projectId, createdBy, collaborators = []) {
        console.log('🔧 Assembler - Project ID:', projectId); // Debug

        // Transformar las tareas del formulario a milestoneTasks
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
                progress: 0,
                dueDate: formData.fechaVencimiento
            };
        });

        const apiData = {
            title: formData.nombre,
            description: formData.descripcion,
            tools: formData.herramientas,
            generalComment: formData.comentarioGeneral,
            dueDate: formData.fechaVencimiento ? new Date(formData.fechaVencimiento).toISOString() : null,
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
            status: 'active',
            progress: 0,
            projectId: projectId, // ✅ Asegurar que projectId se incluya
            createdBy: createdBy
        };

        console.log('📤 API Data to send:', apiData); // Debug
        return apiData;
    }

    /**
     * Transform API response array to Milestone entities array
     * @param {Array} apiDataArray - Array of raw API data
     * @returns {Array<Milestone>} Array of Milestone entities
     */
    static fromApiArrayToEntityArray(apiDataArray) {
        if (!Array.isArray(apiDataArray)) return [];
        return apiDataArray.map(this.fromApiToEntity);
    }

    /**
     * Transform Milestone entities array to API format array
     * @param {Array<Milestone>} entityArray - Array of Milestone entities
     * @returns {Array} Array of API formatted data
     */
    static fromEntityArrayToApiArray(entityArray) {
        if (!Array.isArray(entityArray)) return [];
        return entityArray.map(this.fromEntityToApi);
    }

    /**
     * Transform API response to milestone summary for lists
     * @param {Object} apiData - Raw API data
     * @returns {Object} Milestone summary
     */
    static toMilestoneSummary(apiData) {
        if (!apiData) return null;

        const milestone = this.fromApiToEntity(apiData);

        return {
            id: milestone.id,
            title: milestone.title,
            dueDate: milestone.dueDate,
            status: milestone.status,
            progress: milestone.progress,
            daysRemaining: milestone.getDaysRemaining(),
            isOverdue: milestone.isOverdue(),
            taskCount: milestone.milestoneTasks.length,
            completedTaskCount: milestone.getCompletedMilestoneTasks().length
        };
    }

    /**
     * Transform status update data to API format
     * @param {string} milestoneId - Milestone ID
     * @param {string} status - New status
     * @param {number} progress - Progress percentage
     * @returns {Object} API status update data
     */
    static toStatusUpdateApi(milestoneId, status, progress = null) {
        const updateData = {
            status: status,
            updatedAt: new Date().toISOString()
        };

        if (progress !== null) {
            updateData.progress = progress;
        }

        if (status === 'completed') {
            updateData.completedAt = new Date().toISOString();
        }

        return updateData;
    }

    /**
     * Transform progress update data to API format
     * @param {string} milestoneId - Milestone ID
     * @param {number} progress - Progress percentage
     * @returns {Object} API progress update data
     */
    static toProgressUpdateApi(milestoneId, progress) {
        return {
            progress: progress,
            updatedAt: new Date().toISOString(),
            status: progress === 100 ? 'completed' : 'active'
        };
    }
}
