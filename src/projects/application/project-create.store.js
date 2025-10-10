import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import { ProjectAreasApi } from "../infrastructure/project-areas-api.js";
import { AcademicLevelsApi } from "../infrastructure/academic-levels-api.js";
import { DurationTypesApi } from "../infrastructure/duration-types-api.js";
import { ProjectsApi } from "../infrastructure/projects-api.js";
import { ProjectAreaAssembler } from "../infrastructure/project-area.assembler.js";
import { AcademicLevelAssembler } from "../infrastructure/academic-level.assembler.js";
import { DurationTypeAssembler } from "../infrastructure/duration-type.assembler.js";

/**
 * Project Creation Store
 * Manages the state and logic for project creation process
 */
export const useProjectCreateStore = defineStore("project-create", () => {
  // APIs
  const projectAreasApi = new ProjectAreasApi();
  const academicLevelsApi = new AcademicLevelsApi();
  const durationTypesApi = new DurationTypesApi();
  const projectsApi = new ProjectsApi();

  // Loading states
  const loading = ref(false);
  const loadingAreas = ref(false);
  const loadingLevels = ref(false);
  const loadingDurationTypes = ref(false);
  const submitting = ref(false);

  // Error states
  const errors = ref([]);
  const validationErrors = ref({});

  // Form step state
  const currentStep = ref(0);
  const totalSteps = ref(3);

  // Options data
  const projectAreas = ref([]);
  const academicLevels = ref([]);
  const durationTypes = ref([]);

  // Form validation rules
  const validationRules = reactive({
    PROJECT_NAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 100,
      REQUIRED: true,
    },
    SUMMARY: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 500,
      REQUIRED: true,
    },
    AREAS: {
      MIN_COUNT: 1,
      MAX_COUNT: 5,
      REQUIRED: true,
    },
    TAGS: {
      MIN_COUNT: 0,
      MAX_COUNT: 10,
      MAX_TAG_LENGTH: 50,
    },
    BENEFITS: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 1000,
      REQUIRED: true,
    },
    SKILLS: {
      MIN_COUNT: 1,
      MAX_COUNT: 20,
      REQUIRED: true,
    },
    ACADEMIC_LEVEL: {
      REQUIRED: true,
    },
    DURATION: {
      MIN_QUANTITY: 1,
      MAX_QUANTITY: 999,
      REQUIRED: true,
    },
    ROLES: {
      MIN_COUNT: 1,
      MAX_COUNT: 10,
      REQUIRED: true,
    },
  });

  // Form data - Step 1: Basic Info
  const basicInfoData = reactive({
    projectName: "",
    summary: "",
    areas: [],
    tags: [],
  });

  // Form data - Step 2: Details
  const detailsData = reactive({
    academicLevel: "",
    benefits: "",
    skills: [],
    durationQuantity: 1,
    durationType: "meses",
  });

  // Form data - Step 3: Roles
  const rolesData = reactive([
    {
      id: Date.now(),
      name: '',
      cards: [
        {
          id: Date.now() + 1,
          title: '',
          items: ['']
        }
      ]
    }
  ]);

  // Computed properties
  const stepLabels = computed(() => [
    "projects.create.steps.basic-info",
    "projects.create.steps.project-info",
    "projects.create.steps.define-roles",
  ]);

  const isLoading = computed(() => {
    return (
      loading.value ||
      loadingAreas.value ||
      loadingLevels.value ||
      loadingDurationTypes.value
    );
  });

  const hasErrors = computed(() => {
    return errors.value.length > 0;
  });

  const canGoNext = computed(() => {
    return isStepValid.value && !isLoading.value;
  });

  const canGoBack = computed(() => {
    return currentStep.value > 0 && !submitting.value;
  });

  const isLastStep = computed(() => {
    return currentStep.value === totalSteps.value - 1;
  });

  const isStepValid = computed(() => {
    switch (currentStep.value) {
      case 0:
        return validateBasicInfo();
      case 1:
        return validateDetails();
      case 2:
        return validateRoles();
      default:
        return false;
    }
  });

  // Project areas computed
  const availableAreas = computed(() => {
    return ProjectAreaAssembler.fromEntityArrayToOptions(projectAreas.value);
  });

  const areasSuggestions = computed(() => {
    return projectAreas.value
      .filter((area) => area.isActive())
      .map((area) => area.name);
  });

  // Academic levels computed
  const availableAcademicLevels = computed(() => {
    return AcademicLevelAssembler.fromEntityArrayToStringArray(
      academicLevels.value
    );
  });

  // Duration types computed
  const availableDurationTypes = computed(() => {
    return DurationTypeAssembler.fromEntityArrayToOptions(durationTypes.value);
  });

  // Debug computed for roles validation
  const rolesValidationDebug = computed(() => {
    if (!rolesData || rolesData.length === 0) {
      return { isValid: false, reason: 'No roles defined' };
    }

    for (let i = 0; i < rolesData.length; i++) {
      const role = rolesData[i];
      
      if (!role.name || role.name.trim().length < 2) {
        return { isValid: false, reason: `Role ${i + 1} name is empty or too short` };
      }

      if (!role.cards || role.cards.length === 0) {
        return { isValid: false, reason: `Role ${i + 1} has no cards` };
      }

      for (let j = 0; j < role.cards.length; j++) {
        const card = role.cards[j];
        
        if (!card.title || card.title.trim().length < 3) {
          return { isValid: false, reason: `Role ${i + 1}, Card ${j + 1} title is empty or too short` };
        }

        if (!card.items || card.items.length === 0) {
          return { isValid: false, reason: `Role ${i + 1}, Card ${j + 1} has no items` };
        }

        const validItems = card.items.filter(item => 
          item && typeof item === 'string' && item.trim().length > 0
        );

        if (validItems.length === 0) {
          return { isValid: false, reason: `Role ${i + 1}, Card ${j + 1} has no valid items` };
        }
      }
    }

    return { isValid: true, reason: 'All roles are valid' };
  });

  // Form validation methods
  const validateBasicInfo = () => {
    const errors = {};

    // Project name validation
    if (
      !basicInfoData.projectName ||
      basicInfoData.projectName.trim().length <
        validationRules.PROJECT_NAME.MIN_LENGTH
    ) {
      errors.projectName = `Project name must be at least ${validationRules.PROJECT_NAME.MIN_LENGTH} characters`;
    }

    if (
      basicInfoData.projectName &&
      basicInfoData.projectName.length > validationRules.PROJECT_NAME.MAX_LENGTH
    ) {
      errors.projectName = `Project name cannot exceed ${validationRules.PROJECT_NAME.MAX_LENGTH} characters`;
    }

    // Summary validation
    if (
      !basicInfoData.summary ||
      basicInfoData.summary.trim().length < validationRules.SUMMARY.MIN_LENGTH
    ) {
      errors.summary = `Summary must be at least ${validationRules.SUMMARY.MIN_LENGTH} characters`;
    }

    if (
      basicInfoData.summary &&
      basicInfoData.summary.length > validationRules.SUMMARY.MAX_LENGTH
    ) {
      errors.summary = `Summary cannot exceed ${validationRules.SUMMARY.MAX_LENGTH} characters`;
    }

    // Areas validation
    if (
      !basicInfoData.areas ||
      basicInfoData.areas.length < validationRules.AREAS.MIN_COUNT
    ) {
      errors.areas = `At least ${validationRules.AREAS.MIN_COUNT} area is required`;
    }

    if (
      basicInfoData.areas &&
      basicInfoData.areas.length > validationRules.AREAS.MAX_COUNT
    ) {
      errors.areas = `Cannot exceed ${validationRules.AREAS.MAX_COUNT} areas`;
    }

    // Tags validation
    if (
      basicInfoData.tags &&
      basicInfoData.tags.length > validationRules.TAGS.MAX_COUNT
    ) {
      errors.tags = `Cannot exceed ${validationRules.TAGS.MAX_COUNT} tags`;
    }

		validationErrors.value = { ...validationErrors.value, ...errors };
    return Object.keys(errors).length === 0;
  };

  const validateDetails = () => {
    const errors = {};

    // Academic level validation
    if (validationRules.ACADEMIC_LEVEL.REQUIRED && !detailsData.academicLevel) {
      errors.academicLevel = "Academic level is required";
    }

    // Benefits validation
    if (
      !detailsData.benefits ||
      detailsData.benefits.trim().length < validationRules.BENEFITS.MIN_LENGTH
    ) {
      errors.benefits = `Benefits must be at least ${validationRules.BENEFITS.MIN_LENGTH} characters`;
    }

    if (
      detailsData.benefits &&
      detailsData.benefits.length > validationRules.BENEFITS.MAX_LENGTH
    ) {
      errors.benefits = `Benefits cannot exceed ${validationRules.BENEFITS.MAX_LENGTH} characters`;
    }

    // Skills validation
    if (
      !detailsData.skills ||
      detailsData.skills.length < validationRules.SKILLS.MIN_COUNT
    ) {
      errors.skills = `At least ${validationRules.SKILLS.MIN_COUNT} skill is required`;
    }

    if (
      detailsData.skills &&
      detailsData.skills.length > validationRules.SKILLS.MAX_COUNT
    ) {
      errors.skills = `Cannot exceed ${validationRules.SKILLS.MAX_COUNT} skills`;
    }

    // Duration validation
    if (
      !detailsData.durationQuantity ||
      detailsData.durationQuantity < validationRules.DURATION.MIN_QUANTITY
    ) {
      errors.durationQuantity = `Duration must be at least ${validationRules.DURATION.MIN_QUANTITY}`;
    }

    if (
      detailsData.durationQuantity &&
      detailsData.durationQuantity > validationRules.DURATION.MAX_QUANTITY
    ) {
      errors.durationQuantity = `Duration cannot exceed ${validationRules.DURATION.MAX_QUANTITY}`;
    }

		validationErrors.value = { ...validationErrors.value, ...errors };
    return Object.keys(errors).length === 0;
  };

  const validateRoles = () => {
    const errors = {};

    // Roles validation
    if (
      !rolesData ||
      rolesData.length < validationRules.ROLES.MIN_COUNT
    ) {
      errors.roles = `At least ${validationRules.ROLES.MIN_COUNT} role is required`;
    }

    if (
      rolesData &&
      rolesData.length > validationRules.ROLES.MAX_COUNT
    ) {
      errors.roles = `Cannot exceed ${validationRules.ROLES.MAX_COUNT} roles`;
    }

    // Validate each role
    if (rolesData) {
      rolesData.forEach((role, index) => {
        if (!role.name || role.name.trim().length < 2) {
          errors[`role_${index}_name`] = "Role name is required";
        }

        if (!role.cards || role.cards.length === 0) {
          errors[`role_${index}_cards`] =
            "At least one card is required per role";
        }

        // Validate cards
        if (role.cards) {
          role.cards.forEach((card, cardIndex) => {
            if (!card.title || card.title.trim().length < 3) {
              errors[`role_${index}_card_${cardIndex}_title`] =
                "Card title is required";
            }

            // Check if items exist and have valid content
            if (!card.items || card.items.length === 0) {
              errors[`role_${index}_card_${cardIndex}_items`] =
                "At least one item is required per card";
            } else {
              // Validate that at least one item has content
              const validItems = card.items.filter(item => 
                item && typeof item === 'string' && item.trim().length > 0
              );
              
              if (validItems.length === 0) {
                errors[`role_${index}_card_${cardIndex}_items`] =
                  "At least one item must have content";
              }
            }
          });
        }
      });
    }

    validationErrors.value = { ...validationErrors.value, ...errors };
		
    return Object.keys(errors).length === 0;
  };

  // Navigation methods
  const nextStep = () => {
    if (canGoNext.value && currentStep.value < totalSteps.value - 1) {
      currentStep.value++;
      clearStepErrors();
    }
  };

  const prevStep = () => {
    if (canGoBack.value && currentStep.value > 0) {
      currentStep.value--;
      clearStepErrors();
    }
  };

  const goToStep = (step) => {
    if (step >= 0 && step < totalSteps.value) {
      currentStep.value = step;
      clearStepErrors();
    }
  };

  // Error handling
  const clearErrors = () => {
    errors.value = [];
  };

  const clearStepErrors = () => {
    // Clear validation errors for current step only
    const stepKeys = Object.keys(validationErrors.value);
    stepKeys.forEach((key) => {
      delete validationErrors.value[key];
    });
  };

  const addError = (error) => {
    errors.value.push(error);
  };

  // Data loading methods
  const loadProjectAreas = async () => {
    try {
      loadingAreas.value = true;
      const response = await projectAreasApi.getAll();

      projectAreas.value = ProjectAreaAssembler.fromApiArrayToEntityArray(
        response.data
      );
    } catch (error) {
      console.error("Error loading project areas:", error);
      addError("Failed to load project areas");
    } finally {
      loadingAreas.value = false;
    }
  };

  const loadAcademicLevels = async () => {
    try {
      loadingLevels.value = true;
      const response = await academicLevelsApi.getAll();

      academicLevels.value = AcademicLevelAssembler.fromApiArrayToEntityArray(
        response.data
      );
    } catch (error) {
      console.error("Error loading academic levels:", error);
      addError("Failed to load academic levels");
    } finally {
      loadingLevels.value = false;
    }
  };

  const loadDurationTypes = async () => {
    try {
      loadingDurationTypes.value = true;
      const response = await durationTypesApi.getAll();

      durationTypes.value = DurationTypeAssembler.fromApiArrayToEntityArray(
        response.data
      );
    } catch (error) {
      console.error("Error loading duration types:", error);
      addError("Failed to load duration types");
    } finally {
      loadingDurationTypes.value = false;
    }
  };

  const loadAllOptions = async () => {
    loading.value = true;
    try {
      await Promise.all([
        loadProjectAreas(),
        loadAcademicLevels(),
        loadDurationTypes(),
      ]);
    } finally {
      loading.value = false;
    }
  };

  // Project submission
  const submitProject = async () => {
    try {
      submitting.value = true;
      clearErrors();

      // Final validation
      if (!validateBasicInfo() || !validateDetails() || !validateRoles()) {
        throw new Error("Please fix validation errors before submitting");
      }

      // Prepare project data
      const projectData = {
        title: basicInfoData.projectName,
        description: basicInfoData.summary,
        areas: basicInfoData.areas,
        tags: basicInfoData.tags,
        academicLevel: detailsData.academicLevel,
        benefits: detailsData.benefits,
        skills: detailsData.skills,
        durationQuantity: detailsData.durationQuantity,
        durationType: detailsData.durationType,
        roles: rolesData,
        status: "active",
        progress: 0,
				userId: localStorage.getItem("userId") || "1", // TODO: Get from auth store
				authorName: localStorage.getItem("userName") || "Usuario", // TODO: Get from auth store
        collaborators: [],
        tasks: [],
        milestones: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await projectsApi.create(projectData);

      resetForm();
      return response.data;
    } catch (error) {
      console.error("Error submitting project:", error);
      addError(error.message || "Failed to create project");
      return null;
    } finally {
      submitting.value = false;
    }
  };

  // Form reset
  const resetForm = () => {
    currentStep.value = 0;

    // Reset basic info
    basicInfoData.projectName = "";
    basicInfoData.summary = "";
    basicInfoData.areas = [];
    basicInfoData.tags = [];

    // Reset details
    detailsData.academicLevel = "";
    detailsData.benefits = "";
    detailsData.skills = [];
    detailsData.durationQuantity = 1;
    detailsData.durationType = "meses";

    // Reset roles
    rolesData.length = 0; // Clear array
    rolesData.push({
      id: Date.now(),
      name: '',
      cards: [
        {
          id: Date.now() + 1,
          title: '',
          items: ['']
        }
      ]
    });

    // Clear errors
    clearErrors();
    validationErrors.value = {};
  };

  // Search methods
  const searchAreas = (query) => {
    if (!query) return areasSuggestions.value;

    return areasSuggestions.value.filter((area) =>
      area.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    // State
    loading,
    loadingAreas,
    loadingLevels,
    loadingDurationTypes,
    submitting,
    errors,
    validationErrors,
    currentStep,
    totalSteps,
    projectAreas,
    academicLevels,
    durationTypes,
    validationRules,
    basicInfoData,
    detailsData,
    rolesData,

    // Computed
    stepLabels,
    isLoading,
    hasErrors,
    canGoNext,
    canGoBack,
    isLastStep,
    isStepValid,
    availableAreas,
    areasSuggestions,
    availableAcademicLevels,
    availableDurationTypes,
    rolesValidationDebug,

    // Methods
    validateBasicInfo,
    validateDetails,
    validateRoles,
    nextStep,
    prevStep,
    goToStep,
    clearErrors,
    clearStepErrors,
    addError,
    loadProjectAreas,
    loadAcademicLevels,
    loadDurationTypes,
    loadAllOptions,
    submitProject,
    resetForm,
    searchAreas,
  };
});
