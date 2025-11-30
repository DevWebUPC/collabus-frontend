import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MilestoneTaskSubmissionApi } from '../infrastructure/milestones-task-submission-api.js';
import { MilestoneTaskSubmissionAssembler } from '../infrastructure/milestone-task-submission.assembler.js';
import { MilestoneTaskSubmission } from '../domain/model/milestone-task-submission.entity.js';

export const useMilestoneTaskSubmissionStore = defineStore('milestoneTaskSubmission', () => {
    // State
    const submissions = ref([]);
    const currentSubmission = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const api = new MilestoneTaskSubmissionApi();

    // Getters
    const getSubmissions = computed(() => submissions.value);
    const getCurrentSubmission = computed(() => currentSubmission.value);
    const isLoading = computed(() => loading.value);
    const getError = computed(() => error.value);

    // Get submission by milestone task ID
    const getSubmissionByMilestoneTaskId = (milestoneTaskId) => {
        console.log('🔍 [STORE] Buscando submission para milestoneTaskId:', milestoneTaskId);
        console.log('📋 [STORE] Tipo de milestoneTaskId:', typeof milestoneTaskId);
        console.log('📦 [STORE] Todas las submissions disponibles:', submissions.value);

        const found = submissions.value.find(submission => {
            console.log(`   🔄 [STORE] Comparando: "${submission.milestoneTaskId}" (${typeof submission.milestoneTaskId}) === "${milestoneTaskId}" (${typeof milestoneTaskId})`);
            console.log(`   📝 [STORE] Submission details:`, submission);

            // Intentar diferentes formas de comparación
            const match1 = submission.milestoneTaskId === milestoneTaskId.toString();
            const match2 = submission.milestoneTaskId === milestoneTaskId;
            const match3 = submission.milestoneTaskId?.toString() === milestoneTaskId?.toString();

            console.log(`   ✅ [STORE] Match results:`, { match1, match2, match3 });

            return match3; // Usar la comparación más flexible
        });

        console.log('🎯 [STORE] Resultado de búsqueda:', found);
        return found;
    };

    // Check if milestone task has submission
    const hasSubmissionForMilestoneTask = (milestoneTaskId) => {
        return !!getSubmissionByMilestoneTaskId(milestoneTaskId);
    };

    // Get submissions by project ID
    const getSubmissionsByProjectId = (projectId) => {
        return submissions.value.filter(submission =>
            submission.projectId === projectId.toString()
        );
    };

    // Get submissions by milestone ID
    const getSubmissionsByMilestoneId = (milestoneId) => {
        return submissions.value.filter(submission =>
            submission.milestoneId === milestoneId.toString()
        );
    };

    // Get submissions by collaborator ID
    const getSubmissionsByCollaboratorId = (collaboratorId) => {
        return submissions.value.filter(submission =>
            submission.collaboratorId === collaboratorId.toString()
        );
    };

    // Actions
    const setLoading = (value) => {
        loading.value = value;
    };

    const setError = (errorMessage) => {
        error.value = errorMessage;
    };

    const clearError = () => {
        error.value = null;
    };

    /**
     * Load submissions for a specific milestone task
     */
    const loadSubmissionsByMilestoneTask = async (milestoneTaskId) => {
        try {
            setLoading(true);
            clearError();

            console.log(`🔍 Loading submissions for milestone task: ${milestoneTaskId}`);
            const response = await api.getByMilestoneTaskId(milestoneTaskId);

            const newSubmissions = MilestoneTaskSubmissionAssembler.fromApiArrayToEntityArray(response.data);

            // Update state with new submissions
            newSubmissions.forEach(newSub => {
                const existingIndex = submissions.value.findIndex(sub => sub.id === newSub.id);
                if (existingIndex === -1) {
                    submissions.value.push(newSub);
                } else {
                    submissions.value[existingIndex] = newSub;
                }
            });

            console.log(`✅ Loaded ${newSubmissions.length} submissions for milestone task`);
            return newSubmissions;
        } catch (err) {
            const errorMsg = `Error loading milestone task submissions: ${err.message}`;
            setError(errorMsg);
            console.error('❌', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load submission by ID
     */
    const loadSubmission = async (submissionId) => {
        try {
            setLoading(true);
            clearError();

            console.log(`🔍 Loading submission: ${submissionId}`);
            const response = await api.getById(submissionId);

            currentSubmission.value = MilestoneTaskSubmissionAssembler.fromApiToEntity(response.data);

            // Update in submissions array
            const index = submissions.value.findIndex(sub => sub.id === submissionId);
            if (index !== -1) {
                submissions.value[index] = currentSubmission.value;
            } else {
                submissions.value.push(currentSubmission.value);
            }

            console.log('✅ Submission loaded successfully');
            return currentSubmission.value;
        } catch (err) {
            const errorMsg = `Error loading submission: ${err.message}`;
            setError(errorMsg);
            console.error('❌', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get submission by milestone task and collaborator
     */
    const getSubmissionByTaskAndCollaborator = async (milestoneTaskId, collaboratorId) => {
        try {
            setLoading(true);
            clearError();

            console.log(`🔍 Getting submission for task ${milestoneTaskId} and collaborator ${collaboratorId}`);
            const response = await api.getByTaskAndCollaborator(milestoneTaskId, collaboratorId);

            if (response.data) {
                const submission = MilestoneTaskSubmissionAssembler.fromApiToEntity(response.data);

                // Update in submissions array
                const index = submissions.value.findIndex(sub => sub.id === submission.id);
                if (index !== -1) {
                    submissions.value[index] = submission;
                } else {
                    submissions.value.push(submission);
                }

                console.log('✅ Submission found');
                return submission;
            }

            console.log('📭 No submission found');
            return null;
        } catch (err) {
            const errorMsg = `Error getting submission: ${err.message}`;
            setError(errorMsg);
            console.error('❌', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create a new milestone task submission
     */
    const createSubmission = async (submissionData) => {
        try {
            setLoading(true);
            clearError();

            console.log('📝 Creating new milestone task submission:', submissionData);

            // Validar datos requeridos
            if (!submissionData.milestoneTaskId || !submissionData.collaboratorId) {
                throw new Error('Missing required fields: milestoneTaskId and collaboratorId are required');
            }

            const apiData = MilestoneTaskSubmissionAssembler.fromFormToApi(
                submissionData,
                submissionData.milestoneTaskId,
                submissionData.collaboratorId,
                submissionData.milestoneId,
                submissionData.projectId
            );

            console.log('🔧 Calling API with data:', apiData);

            const response = await api.create(apiData);
            const newSubmission = MilestoneTaskSubmissionAssembler.fromApiToEntity(response.data);

            // Agregar al state
            submissions.value.push(newSubmission);
            currentSubmission.value = newSubmission;

            console.log('✅ Submission created successfully:', newSubmission);
            return newSubmission;

        } catch (err) {
            console.error('❌ Error detallado en createSubmission:', err);
            const errorMsg = `Error creating milestone task submission: ${err.message}`;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    /**
     * Create submission from form data
     */
    const createSubmissionFromForm = async (formData, milestoneTaskId, collaboratorId, milestoneId, projectId) => {
        try {
            console.log('🎯 Creating submission from form data:', {
                formData,
                milestoneTaskId,
                collaboratorId,
                milestoneId,
                projectId
            });

            // ✅ CORREGIDO: Pasar todos los parámetros necesarios
            const submissionData = {
                ...formData,
                milestoneTaskId,
                collaboratorId,
                milestoneId,
                projectId
            };

            return await createSubmission(submissionData);
        } catch (err) {
            console.error('❌ Error creating submission from form:', err);
            throw err;
        }
    };

    /**
     * Update a submission
     */
    const updateSubmission = async (submissionId, updateData) => {
        try {
            setLoading(true);
            clearError();

            console.log(`🔄 Updating submission ${submissionId}:`, updateData);

            const response = await api.update(submissionId, updateData);
            const updatedSubmission = MilestoneTaskSubmissionAssembler.fromApiToEntity(response.data);

            // Update in state
            const index = submissions.value.findIndex(sub => sub.id === submissionId);
            if (index !== -1) {
                submissions.value[index] = updatedSubmission;
            }

            if (currentSubmission.value && currentSubmission.value.id === submissionId) {
                currentSubmission.value = updatedSubmission;
            }

            console.log('✅ Submission updated successfully');
            return updatedSubmission;
        } catch (err) {
            const errorMsg = `Error updating submission: ${err.message}`;
            setError(errorMsg);
            console.error('❌', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Delete a submission
     */
    const deleteSubmission = async (submissionId) => {
        try {
            setLoading(true);
            clearError();

            console.log(`🗑️ Deleting submission: ${submissionId}`);

            await api.delete(submissionId);

            // Remove from state
            submissions.value = submissions.value.filter(sub => sub.id !== submissionId);

            if (currentSubmission.value && currentSubmission.value.id === submissionId) {
                currentSubmission.value = null;
            }

            console.log('✅ Submission deleted successfully');
            return true;
        } catch (err) {
            const errorMsg = `Error deleting submission: ${err.message}`;
            setError(errorMsg);
            console.error('❌', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load submissions by project
     */
    const loadSubmissionsByProject = async (projectId) => {
        try {
            setLoading(true);
            clearError();

            console.log(`🔍 Loading submissions for project: ${projectId}`);
            const response = await api.getByProjectId(projectId);

            const newSubmissions = MilestoneTaskSubmissionAssembler.fromApiArrayToEntityArray(response.data);

            // Update state
            newSubmissions.forEach(newSub => {
                const existingIndex = submissions.value.findIndex(sub => sub.id === newSub.id);
                if (existingIndex === -1) {
                    submissions.value.push(newSub);
                } else {
                    submissions.value[existingIndex] = newSub;
                }
            });

            console.log(`✅ Loaded ${newSubmissions.length} submissions for project`);
            return newSubmissions;
        } catch (err) {
            const errorMsg = `Error loading project submissions: ${err.message}`;
            setError(errorMsg);
            console.error('❌', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load submissions by milestone
     */
    const loadSubmissionsByMilestone = async (milestoneId) => {
        try {
            setLoading(true);
            clearError();

            console.log(`🔍 Loading submissions for milestone: ${milestoneId}`);
            const response = await api.getByMilestoneId(milestoneId);

            const newSubmissions = MilestoneTaskSubmissionAssembler.fromApiArrayToEntityArray(response.data);

            // Update state
            newSubmissions.forEach(newSub => {
                const existingIndex = submissions.value.findIndex(sub => sub.id === newSub.id);
                if (existingIndex === -1) {
                    submissions.value.push(newSub);
                } else {
                    submissions.value[existingIndex] = newSub;
                }
            });

            console.log(`✅ Loaded ${newSubmissions.length} submissions for milestone`);
            return newSubmissions;
        } catch (err) {
            const errorMsg = `Error loading milestone submissions: ${err.message}`;
            setError(errorMsg);
            console.error('❌', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clear current submission
     */
    const clearCurrentSubmission = () => {
        currentSubmission.value = null;
    };

    /**
     * Reset store state
     */
    const reset = () => {
        submissions.value = [];
        currentSubmission.value = null;
        loading.value = false;
        error.value = null;
    };

    return {
        // State
        submissions: getSubmissions,
        currentSubmission: getCurrentSubmission,
        loading: isLoading,
        error: getError,

        // Getters
        getSubmissionByMilestoneTaskId,
        hasSubmissionForMilestoneTask,
        getSubmissionsByProjectId,
        getSubmissionsByMilestoneId,
        getSubmissionsByCollaboratorId,

        // Actions
        loadSubmissionsByMilestoneTask,
        loadSubmission,
        getSubmissionByTaskAndCollaborator,
        createSubmission,
        createSubmissionFromForm,
        updateSubmission,
        deleteSubmission,
        loadSubmissionsByProject,
        loadSubmissionsByMilestone,
        clearCurrentSubmission,
        reset
    };
});