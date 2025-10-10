import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ProjectsApi } from "../infrastructure/projects-api.js";
import { TasksApi } from "../infrastructure/tasks-api.js";
import { MilestonesApi } from "../infrastructure/milestones-api.js";
import { NotificationsApi } from "../infrastructure/notifications-api.js";
import { CollaboratorsApi } from "../infrastructure/collaborators-api.js";
import { ProjectAssembler } from "../infrastructure/project.assembler.js";
import { TaskAssembler } from "../infrastructure/task.assembler.js";
import { MilestoneAssembler } from "../infrastructure/milestone.assembler.js";
import { NotificationAssembler } from "../infrastructure/notification.assembler.js";
import { CollaboratorAssembler } from "../infrastructure/collaborator.assembler.js";

export const useProjectDetailStore = defineStore("project-detail", () => {
  // State
  const project = ref(null);
  const tasks = ref([]);
  const milestones = ref([]);
  const notifications = ref([]);
  const collaborators = ref([]);
  const feedbacks = ref([]);
  const contributors = ref([]);
  const applicants = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // API instances
  const projectsApi = new ProjectsApi();
  const tasksApi = new TasksApi();
  const milestonesApi = new MilestonesApi();
  const notificationsApi = new NotificationsApi();
  const collaboratorsApi = new CollaboratorsApi();

  // Reactive user ID
  const currentUserId = ref(localStorage.getItem("userId") || "1");

  // Helper to get current user ID
  const getCurrentUserId = () => {
    return currentUserId.value;
  };

  // Update current user ID
  const setCurrentUserId = (userId) => {
    currentUserId.value = userId;
    localStorage.setItem("userId", userId);
  };

  // Computed properties for project detail data
  const projectNotifications = computed(() => {
    if (!project.value) return [];
    return notifications.value.filter((notification) =>
      notification.belongsToProject(project.value.id)
    );
  });

  const urgentTasks = computed(() => {
    if (!project.value) return [];
    return tasks.value.filter(
      (task) => task.projectId === project.value.id && task.isUrgent()
    );
  });

  const myTasks = computed(() => {
    if (!project.value) return [];
    return tasks.value.filter(
      (task) =>
        task.projectId === project.value.id &&
        task.assignedTo === currentUserId.value
    );
  });

  const completedTasks = computed(() => {
    if (!project.value) return [];
    return tasks.value.filter(
      (task) => task.projectId === project.value.id && task.isCompleted()
    );
  });

  const totalTasks = computed(() => {
    if (!project.value) return 0;
    return tasks.value.filter((task) => task.projectId === project.value.id)
      .length;
  });

  const upcomingMilestones = computed(() => {
    if (!project.value) return [];

    const filtered = milestones.value.filter((milestone) => {
      return (
        milestone.projectId === project.value.id && !milestone.isCompleted()
      );
    });

    return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  });

  const completedMilestones = computed(() => {
    if (!project.value) return [];
    return milestones.value.filter(
      (milestone) =>
        milestone.projectId === project.value.id && milestone.isCompleted()
    );
  });

  const totalMilestones = computed(() => {
    if (!project.value) return 0;
    return milestones.value.filter(
      (milestone) => milestone.projectId === project.value.id
    ).length;
  });

  // Computed statistics - replaces stored stats in project data
  const projectStats = computed(() => {
    if (!project.value) return {};

    const projectTasks = tasks.value.filter(
      (task) => task.projectId === project.value.id
    );
    const projectMilestones = milestones.value.filter(
      (milestone) => milestone.projectId === project.value.id
    );
    const completedProjectTasks = projectTasks.filter((task) =>
      task.isCompleted()
    );
    const completedProjectMilestones = projectMilestones.filter((milestone) =>
      milestone.isCompleted()
    );

    // Calculate next delivery days based on upcoming milestones
    const upcomingProjectMilestones = projectMilestones
      .filter((milestone) => !milestone.isCompleted())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    let nextDeliveryDays = null;
    if (upcomingProjectMilestones.length > 0) {
      const nextMilestone = upcomingProjectMilestones[0];
      const today = new Date();
      const dueDate = new Date(nextMilestone.dueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nextDeliveryDays = Math.max(0, diffDays); // Don't show negative days
    }

    return {
      completedTasks: completedProjectTasks.length,
      totalTasks: projectTasks.length,
      completedMilestones: completedProjectMilestones.length,
      totalMilestones: projectMilestones.length,
      nextDeliveryDays,
    };
  });

  const isParticipating = computed(() => {
    if (!project.value) return false;
    return project.value.userId !== currentUserId.value;
  });

  const isOwned = computed(() => {
    if (!project.value) return false;
    return project.value.userId === currentUserId.value;
  });

  const hasProgressData = computed(() => {
    return (
      project.value &&
      (projectStats.value.completedTasks > 0 ||
        projectStats.value.totalTasks > 0 ||
        projectStats.value.completedMilestones > 0 ||
        projectStats.value.totalMilestones > 0)
    );
  });

  const hasTasksData = computed(() => {
    return myTasks.value.length > 0 || urgentTasks.value.length > 0;
  });

  const hasMilestonesData = computed(() => {
    return upcomingMilestones.value.length > 0;
  });

  const hasNotificationsData = computed(() => {
    return projectNotifications.value.length > 0;
  });

  const hasCollaboratorsData = computed(() => {
    return collaborators.value.length > 0;
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

      // Fetch project data
      const response = await projectsApi.getById(id);
      const projectDetailData = ProjectAssembler.getProjectDetailData(
        response.data
      );
      const projectEntity = projectDetailData.project;

      project.value = projectEntity;

      return projectEntity;
    } catch (err) {
      setError("Failed to fetch project");
      console.error("Error fetching project:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Task Actions
  const fetchTasksByProject = async (projectId) => {
    try {
      clearError();

      // Find the project to get its task IDs
      if (project.value && project.value.tasks) {
        const tasksResponse = await tasksApi
          .getByProject(projectId)
          .catch((err) => {
            console.warn(`Failed to fetch task ${taskId}:`, err);
            return null;
          });

        const validTasks = tasksResponse.data

        const projectTasks =
          TaskAssembler.fromApiArrayToEntityArray(validTasks);
        tasks.value = projectTasks;
      }
    } catch (err) {
      console.error("Error fetching tasks by project:", err);
      // Don't set error here since this is a background operation
    }
  };

  // Milestone Actions
  const fetchMilestonesByProject = async (projectId) => {
    try {
      clearError();

      // Find the project to get its milestone IDs
      if (project.value && project.value.milestones) {
        const milestonesPromise = await milestonesApi
          .getByProject(projectId)
          .catch((err) => {
            console.warn(`Failed to fetch milestone ${milestoneId}:`, err);
            return null;
          });


        const validMilestones = milestonesPromise.data;

        const projectMilestones =
          MilestoneAssembler.fromApiArrayToEntityArray(validMilestones);
        milestones.value = projectMilestones;
      }
    } catch (err) {
      console.error("Error fetching milestones by project:", err);
      // Don't set error here since this is a background operation
    }
  };

  // Notification Actions
  const fetchNotificationsByProject = async (projectId) => {
    try {
      clearError();

      // Fetch notifications for the project
      const response = await notificationsApi.getByProjectId(projectId);
      const projectNotificationsData =
        NotificationAssembler.fromApiArrayToEntityArray(response.data);
      notifications.value = projectNotificationsData;
    } catch (err) {
      console.error("Error fetching notifications by project:", err);
      // Don't set error here since this is a background operation
    }
  };

  // Collaborator Actions
  const loadCollaborators = async (projectId) => {
    try {
      clearError();

      // Fetch collaborators using the new API structure
      const response = await collaboratorsApi.getByProjectId(projectId);
      if (response.data && response.data.length > 0) {
        const projectCollaborators =
          CollaboratorAssembler.fromApiArrayToEntityArray(response.data);
        collaborators.value = projectCollaborators;
      } else {
        collaborators.value = [];
      }
    } catch (err) {
      console.error("Error loading collaborators:", err);
      collaborators.value = [];
      // Don't set error here since this is a background operation
    }
  };

  // Load all project detail data
  const loadProjectDetail = async (projectId) => {
    try {
      // First fetch the project
      await fetchProjectById(projectId);

      // Then fetch related data in parallel
      await Promise.all([
        fetchTasksByProject(projectId),
        fetchMilestonesByProject(projectId),
        fetchNotificationsByProject(projectId),
        loadCollaborators(projectId),
      ]);

      return project.value;
    } catch (err) {
      console.error("Error loading project detail:", err);
      throw err;
    }
  };

  // Reset state
  const reset = () => {
    project.value = null;
    tasks.value = [];
    milestones.value = [];
    notifications.value = [];
    collaborators.value = [];
    loading.value = false;
    error.value = null;
  };

  return {
    // State
    project,
    tasks,
    milestones,
    notifications,
    collaborators,
    loading,
    error,

    // Computed
    projectStats,
    projectNotifications,
    urgentTasks,
    myTasks,
    completedTasks,
    totalTasks,
    upcomingMilestones,
    completedMilestones,
    totalMilestones,
    isParticipating,
    isOwned,
    hasProgressData,
    hasTasksData,
    hasMilestonesData,
    hasNotificationsData,
    hasCollaboratorsData,

    // Actions
    fetchProjectById,
    fetchTasksByProject,
    fetchMilestonesByProject,
    fetchNotificationsByProject,
    loadCollaborators,
    loadProjectDetail,
    setLoading,
    setError,
    clearError,
    reset,
    getCurrentUserId,
    setCurrentUserId,
  };
});
