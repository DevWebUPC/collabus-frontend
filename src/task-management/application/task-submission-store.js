// task-submission-store.js (MODIFICADO)
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TaskSubmissionApi } from '../infrastructure/task-submission-api.js';
import { TaskSubmissionAssembler } from '../infrastructure/task-submission.assembler.js';

export const useTaskSubmissionStore = defineStore('taskSubmission', () => {
    const submissions = ref([]);
    const currentSubmission = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const taskSubmissionApi = new TaskSubmissionApi();

    const setLoading = (value) => {
        loading.value = value;
    };

    const setError = (errorMessage) => {
        error.value = errorMessage;
    };

    const clearError = () => {
        error.value = null;
    };

    const loadSubmissionsByTask = async (taskId) => {
        try {
            setLoading(true);
            clearError();
            const response = await taskSubmissionApi.getByTaskId(taskId);
            const newSubmissions = TaskSubmissionAssembler.fromApiArrayToEntityArray(response.data);

            // ✅ EVITAR DUPLICADOS al agregar nuevas submissions
            newSubmissions.forEach(newSub => {
                const existingIndex = submissions.value.findIndex(sub => sub.id === newSub.id);
                if (existingIndex === -1) {
                    submissions.value.push(newSub);
                }
            });

            return submissions.value;
        } catch (err) {
            setError('Error loading submissions');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ✅ NUEVO MÉTODO: Obtener submission por taskId
    const getSubmissionByTaskId = (taskId) => {
        return submissions.value.find(submission =>
            submission.taskId === taskId.toString()
        );
    };

    // ✅ NUEVO MÉTODO: Verificar si existe submission para una tarea
    const hasSubmissionForTask = (taskId) => {
        return !!getSubmissionByTaskId(taskId);
    };

    const loadSubmission = async (submissionId) => {
        try {
            setLoading(true);
            clearError();
            const response = await taskSubmissionApi.getById(submissionId);
            currentSubmission.value = TaskSubmissionAssembler.fromApiToEntity(response.data);
            return currentSubmission.value;
        } catch (err) {
            setError('Error loading submission');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createSubmission = async (submissionData) => {
        try {
            setLoading(true);
            clearError();

            // ✅ FIX: Validar y asegurar que las fechas sean correctas
            const validatedData = {
                ...submissionData,
                submittedAt: submissionData.submittedAt instanceof Date ?
                    submissionData.submittedAt : new Date()
            };

            const apiData = TaskSubmissionAssembler.fromEntityToApi(validatedData);
            const response = await taskSubmissionApi.create(apiData);
            const newSubmission = TaskSubmissionAssembler.fromApiToEntity(response.data);
            submissions.value.push(newSubmission);
            return newSubmission;
        } catch (err) {
            setError('Error creating submission');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateSubmission = async (submissionId, updateData) => {
        try {
            setLoading(true);
            clearError();
            const apiData = TaskSubmissionAssembler.fromEntityToApi(updateData);
            const response = await taskSubmissionApi.update(submissionId, apiData);
            const updatedSubmission = TaskSubmissionAssembler.fromApiToEntity(response.data);
            const index = submissions.value.findIndex(s => s.id === submissionId);
            if (index !== -1) {
                submissions.value[index] = updatedSubmission;
            }
            if (currentSubmission.value && currentSubmission.value.id === submissionId) {
                currentSubmission.value = updatedSubmission;
            }
            return updatedSubmission;
        } catch (err) {
            setError('Error updating submission');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteSubmission = async (submissionId) => {
        try {
            setLoading(true);
            clearError();
            await taskSubmissionApi.delete(submissionId);
            submissions.value = submissions.value.filter(s => s.id !== submissionId);
            if (currentSubmission.value && currentSubmission.value.id === submissionId) {
                currentSubmission.value = null;
            }
        } catch (err) {
            setError('Error deleting submission');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getSubmissionByTaskAndCollaborator = (taskId, collaboratorId) => {
        return submissions.value.find(s => s.taskId === taskId && s.collaboratorId === collaboratorId);
    };

    const hasSubmittedTask = (taskId, collaboratorId) => {
        return !!getSubmissionByTaskAndCollaborator(taskId, collaboratorId);
    };

    return {
        submissions,
        currentSubmission,
        loading,
        error,
        loadSubmissionsByTask,
        loadSubmission,
        createSubmission,
        updateSubmission,
        deleteSubmission,
        getSubmissionByTaskAndCollaborator,
        hasSubmittedTask,
        getSubmissionByTaskId, // ✅ EXPORTAR NUEVO MÉTODO
        hasSubmissionForTask   // ✅ EXPORTAR NUEVO MÉTODO
    };
});