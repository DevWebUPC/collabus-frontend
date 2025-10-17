// project-detail.store.js - REEMPLAZAR TODO EL CONTENIDO
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ProjectsApi } from "../infrastructure/projects-api.js";
import { ProjectAssembler } from "../infrastructure/project.assembler.js";

export const useProjectDetailStore = defineStore("project-detail", () => {
    // State
    const project = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // API instances
    const projectsApi = new ProjectsApi();

    // ✅ SOLUCIÓN: Siempre leer userId del localStorage directamente
    const getCurrentUserId = () => {
        const userId = localStorage.getItem("userId");
        console.log('🆔 UserId from localStorage:', userId);
        return userId || "1";
    };

    // Computed properties - ✅ ACTUALIZADO para usar función
    const isParticipating = computed(() => {
        if (!project.value) return false;
        const userId = getCurrentUserId();
        return project.value.userId !== userId;
    });

    const isOwned = computed(() => {
        if (!project.value) return false;
        const userId = getCurrentUserId();
        return project.value.userId === userId;
    });

    // Basic project stats from project data
    const projectStats = computed(() => {
        if (!project.value) return {};

        return {
            progress: project.value.progress || 0,
            tasksCompleted: project.value.tasksCompleted || 0,
            totalTasks: project.value.totalTasks || 0,
        };
    });

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

    // Project Actions
    const fetchProjectById = async (id) => {
        try {
            setLoading(true);
            clearError();

            console.log('🔄 Fetching project:', id, 'for user:', getCurrentUserId());

            // Fetch project data
            const response = await projectsApi.getById(id);
            const projectDetailData = ProjectAssembler.getProjectDetailData(
                response.data
            );
            const projectEntity = projectDetailData.project;

            project.value = projectEntity;

            console.log('✅ Project loaded - isOwned:', projectEntity.userId === getCurrentUserId());
            console.log('✅ Project loaded - isParticipating:', projectEntity.userId !== getCurrentUserId());

            return projectEntity;
        } catch (err) {
            setError("Failed to fetch project");
            console.error("Error fetching project:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Load project detail data (simplified)
    const loadProjectDetail = async (projectId) => {
        try {
            console.log('🚀 Loading project detail for:', projectId);
            // Reset before loading new project
            project.value = null;
            await fetchProjectById(projectId);
            return project.value;
        } catch (err) {
            console.error("Error loading project detail:", err);
            throw err;
        }
    };

    const addCollaborator = async (collaboratorData) => {
        try {
            if (!project.value) {
                throw new Error('No project loaded');
            }

            console.log('🔄 Adding collaborator to project:', project.value.id, collaboratorData);

            // Agregar colaborador localmente
            const success = project.value.addCollaborator(collaboratorData);
            if (!success) {
                throw new Error('Collaborator already exists');
            }

            // ✅ SOLUCIÓN: Actualizar en la API con TODOS los datos del colaborador
            const updateData = {
                collaborators: project.value.collaborators
            };

            console.log('📤 Sending update to API:', updateData);
            await projectsApi.update(project.value.id, updateData);

            console.log('✅ Collaborator added successfully:', collaboratorData);
            return true;
        } catch (err) {
            setError('Failed to add collaborator: ' + err.message);
            console.error('Error adding collaborator:', err);
            throw err;
        }
    };

    const removeCollaborator = async (collaboratorId) => {
        try {
            if (!project.value) {
                throw new Error('No project loaded');
            }

            // Remover colaborador localmente
            const success = project.value.removeCollaborator(collaboratorId);
            if (!success) {
                throw new Error('Collaborator not found');
            }

            // Actualizar en la API
            const updateData = {
                collaborators: project.value.collaborators
            };

            await projectsApi.update(project.value.id, updateData);

            console.log('✅ Collaborator removed:', collaboratorId);
            return true;
        } catch (err) {
            setError('Failed to remove collaborator: ' + err.message);
            console.error('Error removing collaborator:', err);
            throw err;
        }
    };

    // Reset state
    const reset = () => {
        project.value = null;
        loading.value = false;
        error.value = null;
    };

    return {
        // State
        project,
        loading,
        error,

        // Computed
        projectStats,
        isParticipating,
        isOwned,

        // Actions
        fetchProjectById,
        loadProjectDetail,
        setLoading,
        setError,
        clearError,
        reset,
        getCurrentUserId,
        addCollaborator,
        removeCollaborator
    };
});