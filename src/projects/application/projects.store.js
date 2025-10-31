import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ProjectsApi } from '../infrastructure/projects-api.js';
import { ProjectAssembler } from '../infrastructure/project.assembler.js';
import { FavoritesApi } from '../infrastructure/favorites-api.js';
import { FavoriteAssembler } from '../infrastructure/favorite.assembler.js';

export const useProjectsStore = defineStore('projects', () => {
    // State
    const projects = ref([]);
    const categories = ref([]);
    const loading = ref(false);
    const error = ref(null);


    // API instances
    const projectsApi = new ProjectsApi();
    const favoritesApi = new FavoritesApi();


    // Use ref instead of computed for participatingProjects and ownedProjects
    const participatingProjects = ref([]);
    const ownedProjects = ref([]);

    // FAVORITES
    const favorites = ref([]); // Array of Favorite entities
    const favoriteProjects = computed(() => {
        // Devuelve los proyectos favoritos del usuario actual
        const favProjectIds = favorites.value.map(fav => fav.projectId);
        return projects.value.filter(p => favProjectIds.includes(p.id));
    });
    // FAVORITES actions
    const fetchFavorites = async (profileId) => {
        try {
            setLoading(true);
            clearError();
            const response = await favoritesApi.getFavoritesByProfile(profileId);
            favorites.value = FavoriteAssembler.fromApiArrayToEntityArray(response.data);
        } catch (err) {
            setError('Failed to fetch favorites');
            console.error('Error fetching favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    const addFavorite = async (profileId, projectId) => {
        try {
            setLoading(true);
            clearError();
            await favoritesApi.addFavorite(profileId, projectId);
            // Refetch favorites after adding
            await fetchFavorites(profileId);
        } catch (err) {
            setError('Failed to add favorite');
            console.error('Error adding favorite:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (profileId, projectId) => {
        try {
            setLoading(true);
            clearError();
            // Buscar el favoriteId correspondiente
            const favorite = favorites.value.find(fav => String(fav.profileId) === String(profileId) && String(fav.projectId) === String(projectId));
            if (!favorite) {
                setError('Favorite not found');
                return;
            }
            await favoritesApi.removeFavorite(favorite.id);
            // Refetch favorites after removing
            await fetchFavorites(profileId);
        } catch (err) {
            setError('Failed to remove favorite');
            console.error('Error removing favorite:', err);
        } finally {
            setLoading(false);
        }
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

    // Helper to get current user ID (should be replaced with actual auth implementation)
    const getCurrentUserId = () => {
        // TODO: Implement actual user authentication
        return localStorage.getItem("userId") || "1";
    };

    // Helper to update participatingProjects and ownedProjects based on projects
    const updateProjectRefs = () => {
        const userId = getCurrentUserId();

        // - Owned projects: proyectos donde el userId del proyecto coincide con el usuario actual
        ownedProjects.value = projects.value.filter((p) => String(p.userId) === String(userId));

        // ✅ CORREGIDO: Participating projects - proyectos donde el usuario actual es colaborador
        participatingProjects.value = projects.value.filter((p) => {
            // No incluir proyectos propios
            if (String(p.userId) === String(userId)) return false;

            // ✅ SOLUCIÓN: Verificar si el usuario actual está en la lista de colaboradores
            if (p.collaborators && Array.isArray(p.collaborators)) {
                return p.collaborators.some(collab =>
                    String(collab.applicantId) === String(userId)
                );
            }

            return false;
        });

        console.log('🔄 Updated project refs:', {
            owned: ownedProjects.value.length,
            participating: participatingProjects.value.length,
            userId: userId
        });
    };

    // Project Actions
    const fetchProjects = async () => {
        try {
            setLoading(true);
            clearError();

            const response = await projectsApi.getAll();
            projects.value = ProjectAssembler.fromApiArrayToEntityArray(
                response.data
            );

            updateProjectRefs();
        } catch (err) {
            setError("Failed to fetch projects");
            console.error("Error fetching projects:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipatingProjects = async () => {
        try {
            setLoading(true);
            clearError();

            const userId = getCurrentUserId();
            const response = await projectsApi.getParticipatingProjects(userId);
            const participatingProjectsData =
                ProjectAssembler.fromApiArrayToEntityArray(response.data);

            // Update projects array with participating projects
            participatingProjectsData.forEach((project) => {
                const existingIndex = projects.value.findIndex(
                    (p) => p.id === project.id
                );
                if (existingIndex >= 0) {
                    projects.value[existingIndex] = project;
                } else {
                    projects.value.push(project);
                }
            });
        } catch (err) {
            setError("Failed to fetch participating projects");
            console.error("Error fetching participating projects:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOwnedProjects = async () => {
        try {
            setLoading(true);
            clearError();

            const userId = getCurrentUserId();
            const response = await projectsApi.getOwnedProjects(userId);
            const ownedProjectsData = ProjectAssembler.fromApiArrayToEntityArray(
                response.data
            );

            // Update projects array with owned projects
            ownedProjectsData.forEach((project) => {
                const existingIndex = projects.value.findIndex(
                    (p) => p.id === project.id
                );
                if (existingIndex >= 0) {
                    projects.value[existingIndex] = project;
                } else {
                    projects.value.push(project);
                }
            });
        } catch (err) {
            setError("Failed to fetch owned projects");
            console.error("Error fetching owned projects:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectById = async (id) => {
        try {
            setLoading(true);
            clearError();

            console.log('🔄 Store: Fetching project by ID:', id);

            // Fetch project data
            const response = await projectsApi.getById(id);
            console.log('📡 Store: API response:', response.data);

            const projectDetailData = ProjectAssembler.getProjectDetailData(response.data);
            console.log('🔧 Store: Assembled project detail:', projectDetailData);

            const projectEntity = projectDetailData.project;
            console.log('🏗️ Store: Final project entity:', projectEntity);

            // Update projects array
            const existingIndex = projects.value.findIndex((p) => p.id === id);
            if (existingIndex >= 0) {
                projects.value[existingIndex] = projectEntity;
            } else {
                projects.value.push(projectEntity);
            }

            return projectEntity;
        } catch (err) {
            console.error('❌ Store: Error fetching project:', err);
            console.error('Store: Error response:', err.response?.data);
            setError("Failed to fetch project");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addToOwnedProjects = async (projectId, userId) => {
        try {
            await projectsApi.addToOwnedProjects(userId, projectId);
            console.log(
                `Project ${projectId} added to owned projects for user ${userId}`
            );
        } catch (err) {
            console.error("Error adding project to owned list:", err);
            // Don't throw the error to avoid breaking the project creation flow
        }
    };

    const fetchProjectsByUserId = async (userId) => {
        try {
            setLoading(true);
            clearError();

            const response = await projectsApi.getProjectsByUserId(userId);
            const userProjects = ProjectAssembler.fromApiArrayToEntityArray(
                response.data
            );

            // Update projects array with user projects
            userProjects.forEach((project) => {
                const existingIndex = projects.value.findIndex(
                    (p) => p.id === project.id
                );
                if (existingIndex >= 0) {
                    projects.value[existingIndex] = project;
                } else {
                    projects.value.push(project);
                }
            });

            return userProjects;
        } catch (err) {
            setError("Failed to fetch user projects");
            console.error("Error fetching user projects:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };





    const createProject = async (projectData) => {
        try {
            setLoading(true);
            clearError();

            const apiData = ProjectAssembler.fromEntityToApi(projectData);
            const response = await projectsApi.create(apiData);
            const newProject = ProjectAssembler.fromApiToEntity(response.data);

            projects.value.push(newProject);

            // Add the project to the user's owned projects
            if (newProject.id && newProject.userId) {
                await addToOwnedProjects(newProject.id, newProject.userId);
            }

            return newProject;
        } catch (err) {
            setError("Failed to create project");
            console.error("Error creating project:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (id, projectData) => {
        try {
            setLoading(true);
            clearError();

            const apiData = ProjectAssembler.fromEntityToApi(projectData);
            const response = await projectsApi.update(id, apiData);
            const updatedProject = ProjectAssembler.fromApiToEntity(response.data);

            const index = projects.value.findIndex((p) => p.id === id);
            if (index >= 0) {
                projects.value[index] = updatedProject;
            }

            return updatedProject;
        } catch (err) {
            setError("Failed to update project");
            console.error("Error updating project:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id) => {
        try {
            setLoading(true);
            clearError();

            await projectsApi.delete(id);
            projects.value = projects.value.filter((p) => p.id !== id);
        } catch (err) {
            setError("Failed to delete project");
            console.error("Error deleting project:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Reset state
    const reset = () => {
        projects.value = [];
        categories.value = [];
        loading.value = false;
        error.value = null;
    };

    const fetchProject = async (id) => {
        return await fetchProjectById(id);
    };



    return {
        // State
        projects,
        categories,
        loading,
        error,

        // Computed
        participatingProjects,
        ownedProjects,

        favorites,
        favoriteProjects,

        // Actions
        fetchProjects,
        fetchParticipatingProjects,
        fetchProject,
        fetchOwnedProjects,
        fetchProjectsByUserId,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
        addToOwnedProjects,
        setLoading,
        setError,
        clearError,
        reset,

    // Favorites
    fetchFavorites,
    addFavorite,
    removeFavorite,
    };
});