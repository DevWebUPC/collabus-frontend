import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ProjectsApi } from '../../projects/infrastructure/projects-api.js';
import { CollaboratorsApi } from '../../projects/infrastructure/collaborators-api.js';
import { ProjectAssembler } from '../../projects/infrastructure/project.assembler.js';
import { CollaboratorAssembler } from '../../projects/infrastructure/collaborator.assembler.js';

export const useHomeStore = defineStore('home', () => {
  // State - Featured collaborators data
  const featuredCollaborators = ref([]);
  
  // State - Projects data
  const allProjects = ref([]);
  const featuredProjects = ref([]);
  
  // State - Filters data
  const searchFilter = ref('');
  const jobTypeFilter = ref('');
  const areaFilter = ref('');
  
  // State - Loading states
  const isLoadingCollaborators = ref(false);
  const isLoadingProjects = ref(false);
  const isLoadingFeaturedProjects = ref(false);
  
  // State - Error states
  const error = ref(null);
  
  // State - Pagination
  const currentPage = ref(1);
  const totalPages = ref(1);
  const itemsPerPage = ref(10);

  // API instances
  const projectsApi = new ProjectsApi();
  const collaboratorsApi = new CollaboratorsApi();

  // Computed - Filtered projects based on current filters
  const filteredProjects = computed(() => {
    return allProjects.value.filter(project => {
      const matchesSearch = !searchFilter.value || 
        project.title.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
        project.description.toLowerCase().includes(searchFilter.value.toLowerCase());

      const matchesJobType = !jobTypeFilter.value ||
        project.roles.some(role => role.name.toLowerCase().includes(jobTypeFilter.value.toLowerCase()));

      const matchesArea = !areaFilter.value ||
        project.areas.some(area => area.toLowerCase() === areaFilter.value.toLowerCase());

      return matchesSearch && matchesJobType && matchesArea;
    });
  });

  // Computed - Paginated filtered projects
  const paginatedProjects = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredProjects.value.slice(start, end);
  });

  // Computed - Check if there are any errors
  const hasError = computed(() => error.value !== null);

  // Computed - Check if any data is loading
  const isLoading = computed(() => 
    isLoadingCollaborators.value || 
    isLoadingProjects.value || 
    isLoadingFeaturedProjects.value
  );

  // Actions
  const setLoading = (value) => {
    isLoadingCollaborators.value = value;
    isLoadingProjects.value = value;
    isLoadingFeaturedProjects.value = value;
  };

  const setError = (errorMessage) => {
    error.value = errorMessage;
  };

  const clearError = () => {
    error.value = null;
  };

  const initializeHome = async () => {
    try {
      clearError();
      await Promise.all([
        loadFeaturedCollaborators(),
        loadAllProjects(),
        loadFeaturedProjects()
      ]);
    } catch (err) {
      console.error('Error initializing home:', err);
      setError('Error loading home data');
    }
  };

  const loadFeaturedCollaborators = async () => {
    try {
      isLoadingCollaborators.value = true;
      clearError();

      const response = await collaboratorsApi.getAll();
      
      if (response.data && Array.isArray(response.data)) {
        // Transform API data to entities and get top 3
        featuredCollaborators.value = response.data
          .map(collaboratorData => CollaboratorAssembler.fromApiToEntity(collaboratorData))
          .slice(0, 3);
      }
    } catch (err) {
      console.error('Error loading featured collaborators:', err);
      setError('Error loading featured collaborators');
      featuredCollaborators.value = [];
    } finally {
      isLoadingCollaborators.value = false;
    }
  };

  const loadAllProjects = async () => {
    try {
      isLoadingProjects.value = true;
      clearError();

      const response = await projectsApi.getAll();
      
      if (response.data && Array.isArray(response.data)) {
        // Transform API data to entities
        allProjects.value = response.data.map(projectData => 
          ProjectAssembler.fromApiToEntity(projectData)
        );

        // Update pagination
        updatePagination();
      }
    } catch (err) {
      console.error('Error loading all projects:', err);
      setError('Error loading projects');
      allProjects.value = [];
    } finally {
      isLoadingProjects.value = false;
    }
  };

  const loadFeaturedProjects = async () => {
    try {
      isLoadingFeaturedProjects.value = true;
      clearError();

      const response = await projectsApi.getAll();
      
      if (response.data && Array.isArray(response.data)) {
        // Transform API data to entities and filter by best progress
        const projects = response.data.map(projectData => 
          ProjectAssembler.fromApiToEntity(projectData)
        );

        // Sort by progress (highest first) and get top projects
        featuredProjects.value = projects
          .filter(project => project.progress && project.progress > 0)
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 4); // Show top 4 featured projects
      }
    } catch (err) {
      console.error('Error loading featured projects:', err);
      setError('Error loading featured projects');
      featuredProjects.value = [];
    } finally {
      isLoadingFeaturedProjects.value = false;
    }
  };

  const updateSearchFilter = (searchTerm) => {
    searchFilter.value = searchTerm;
    currentPage.value = 1; // Reset to first page
    updatePagination();
  };

  const updateJobTypeFilter = (jobType) => {
    jobTypeFilter.value = jobType;
    currentPage.value = 1; // Reset to first page
    updatePagination();
  };

  const updateAreaFilter = (area) => {
    areaFilter.value = area;
    currentPage.value = 1; // Reset to first page
    updatePagination();
  };

  const clearFilters = () => {
    searchFilter.value = '';
    jobTypeFilter.value = '';
    areaFilter.value = '';
    currentPage.value = 1;
    updatePagination();
  };

  const updatePagination = () => {
    const totalItems = filteredProjects.value.length;
    totalPages.value = Math.ceil(totalItems / itemsPerPage.value);
    
    // Ensure current page is not beyond total pages
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value);
    }
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const refreshData = async () => {
    await initializeHome();
  };

  // Reset state
  const reset = () => {
    featuredCollaborators.value = [];
    allProjects.value = [];
    featuredProjects.value = [];
    searchFilter.value = '';
    jobTypeFilter.value = '';
    areaFilter.value = '';
    isLoadingCollaborators.value = false;
    isLoadingProjects.value = false;
    isLoadingFeaturedProjects.value = false;
    error.value = null;
    currentPage.value = 1;
    totalPages.value = 1;
  };

  return {
    // State
    featuredCollaborators,
    allProjects,
    featuredProjects,
    searchFilter,
    jobTypeFilter,
    areaFilter,
    isLoadingCollaborators,
    isLoadingProjects,
    isLoadingFeaturedProjects,
    error,
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Computed
    filteredProjects,
    paginatedProjects,
    hasError,
    isLoading,
    
    // Actions
    initializeHome,
    loadFeaturedCollaborators,
    loadAllProjects,
    loadFeaturedProjects,
    updateSearchFilter,
    updateJobTypeFilter,
    updateAreaFilter,
    clearFilters,
    changePage,
    refreshData,
    setLoading,
    setError,
    clearError,
    reset
  };
});