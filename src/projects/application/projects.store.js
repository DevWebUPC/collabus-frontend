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
        // 🔥 CORREGIDO: Eliminar duplicados por ID de proyecto
        const seenProjectIds = new Set();
        const uniqueProjects = [];

        projects.value.forEach(project => {
            const isFavorite = favorites.value.some(fav => fav.projectId === project.id);
            if (isFavorite && !seenProjectIds.has(project.id)) {
                seenProjectIds.add(project.id);
                uniqueProjects.push(project);
            }
        });

        console.log('🔄 Computed favoriteProjects - Unique:', uniqueProjects.length, 'All projects:', projects.value.length);
        return uniqueProjects;
    });
    // FAVORITES actions
    const fetchFavorites = async (profileId) => {
        try {
            setLoading(true);
            clearError();
            console.log('🔄 Fetching favorites for profile:', profileId);

            // 🔥 CORREGIDO: Obtener solo los favoritos (relaciones)
            const favoritesResponse = await favoritesApi.getFavoritesByProfile(profileId);
            console.log('⭐ Favorites raw response:', favoritesResponse.data);

            // Actualizar la lista de favoritos
            favorites.value = FavoriteAssembler.fromApiArrayToEntityArray(favoritesResponse.data);
            console.log('📋 Favorites entities:', favorites.value);

            // 🔥 CORREGIDO: Obtener proyectos favoritos por separado
            const projectsResponse = await favoritesApi.getFavoriteProjectsByProfile(profileId);
            console.log('🏗️ Favorite projects raw response:', projectsResponse.data);

            // Convertir a entidades de proyecto
            const favoriteProjectsData = ProjectAssembler.fromApiArrayToEntityArray(projectsResponse.data);
            console.log('✅ Favorite projects entities:', favoriteProjectsData);

            console.log('🎯 Final state - Favorites:', favorites.value.length, 'Favorite Projects:', favoriteProjectsData.length);

        } catch (err) {
            console.error('❌ Error fetching favorites:', err);
            console.error('Error response:', err.response?.data);
            setError('Failed to fetch favorites');
            favorites.value = [];
        } finally {
            setLoading(false);
        }
    };

    const addFavorite = async (profileId, projectId) => {
        try {
            setLoading(true);
            clearError();
            console.log('➕ Adding favorite:', { profileId, projectId });

            // 🔥 MEJORADO: Verificación más robusta de duplicados
            const existingFavorite = favorites.value.find(fav =>
                Number(fav.profileId) === Number(profileId) &&
                Number(fav.projectId) === Number(projectId)
            );

            if (existingFavorite) {
                console.log('⚠️ Project is already in favorites, skipping add. Favorite ID:', existingFavorite.id);
                // 🔥 IMPORTANTE: Aún así actualizar el estado visual
                await fetchFavorites(profileId);
                return existingFavorite;
            }

            console.log('🔄 Calling API to add favorite...');
            const response = await favoritesApi.addFavorite(profileId, projectId);
            console.log('✅ Favorite API response:', response.data);

            // Actualizar la lista de favoritos
            await fetchFavorites(profileId);
            console.log('✅ Favorite added and list refreshed');

            return response.data;

        } catch (err) {
            console.error('❌ Error adding favorite:', err);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);

            // Si es error 400, probablemente es duplicado
            if (err.response?.status === 400) {
                console.log('🔄 Duplicate detected, refreshing favorites list...');
                await fetchFavorites(profileId);
            } else {
                setError('Failed to add favorite');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (profileId, projectId) => {
        try {
            setLoading(true);
            clearError();
            console.log('➖ Removing favorite:', { profileId, projectId });

            await favoritesApi.removeFavorite(profileId, projectId);

            // Refetch favorites after removing
            await fetchFavorites(profileId);

            console.log('✅ Favorite removed successfully');

        } catch (err) {
            console.error('❌ Error removing favorite:', err);
            setError('Failed to remove favorite');
            throw err;
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

    const getFavoriteProjectsByProfile = async (profileId) => {
        try {
            setLoading(true);
            clearError();

            console.log('⭐ Buscando proyectos favoritos para profile:', profileId);

            // Cargar favoritos primero
            await fetchFavorites(profileId);

            console.log('📋 Favoritos encontrados:', favorites.value);
            console.log('📦 Todos los proyectos:', projects.value);

            // Filtrar proyectos que están en favoritos
            const favProjectIds = favorites.value.map(fav => fav.projectId);
            const favProjects = projects.value.filter(project =>
                favProjectIds.includes(project.id)
            );

            console.log('✅ Proyectos favoritos filtrados:', favProjects);

            return favProjects;
        } catch (error) {
            console.error('❌ Error obteniendo proyectos favoritos:', error);
            setError('Error al cargar proyectos favoritos');
            return [];
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
        getFavoriteProjectsByProfile,
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