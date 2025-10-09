import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ProjectsApi } from '../infrastructure/projects-api.js';
import { TasksApi } from '../infrastructure/tasks-api.js';
import { CategoriesApi } from '../infrastructure/categories-api.js';
import { MilestonesApi } from '../infrastructure/milestones-api.js';
import { ProjectAssembler } from '../infrastructure/project.assembler.js';
import { TaskAssembler } from '../infrastructure/task.assembler.js';
import { CategoryAssembler } from '../infrastructure/category.assembler.js';
import { MilestoneAssembler } from '../infrastructure/milestone.assembler.js';

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref([]);
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // API instances
  const projectsApi = new ProjectsApi();

  // Use ref instead of computed for participatingProjects and ownedProjects
  const participatingProjects = ref([]);
  const ownedProjects = ref([]);

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
    participatingProjects.value = projects.value.filter(
      (p) => p.userId !== userId
    );
    ownedProjects.value = projects.value.filter((p) => p.userId === userId);
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

      // Fetch project data
      const response = await projectsApi.getById(id);
      const projectDetailData = ProjectAssembler.getProjectDetailData(
        response.data
      );
      const projectEntity = projectDetailData.project;

      // Store additional detail data for UI components (non-derived data)
      projectEntity._detailData = {
        stats: projectDetailData.stats,
        notifications: projectDetailData.notifications,
      };

      // Update projects array
      const existingIndex = projects.value.findIndex((p) => p.id === id);
      if (existingIndex >= 0) {
        projects.value[existingIndex] = projectEntity;
      } else {
        projects.value.push(projectEntity);
      }

      return projectEntity;
    } catch (err) {
      setError("Failed to fetch project");
      console.error("Error fetching project:", err);
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

  // Category Actions
  const fetchCategories = async () => {
    try {
      setLoading(true);
      clearError();

      const response = await categoriesApi.getAll();
      categories.value = CategoryAssembler.fromApiArrayToEntityArray(
        response.data
      );
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
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

  return {
    // State
    projects,
    categories,
    loading,
    error,

    // Computed
    participatingProjects,
    ownedProjects,

    // Actions
    fetchProjects,
    fetchParticipatingProjects,
    fetchOwnedProjects,
    fetchProjectsByUserId,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addToOwnedProjects,
    fetchCategories,
    setLoading,
    setError,
    clearError,
    reset,
  };
});