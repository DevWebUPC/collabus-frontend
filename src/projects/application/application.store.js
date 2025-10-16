import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ApplicationsApi } from '../infrastructure/applications-api.js';
import { ApplicationAssembler } from '../infrastructure/application.assembler.js';
import { useUserStore } from '../../iam/application/user-store.js';

/**
 * Application Store
 * Manages application state and business logic
 */
export const useApplicationStore = defineStore('application', () => {
    // State
    const applications = ref([]);
    const currentApplication = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    // API instance
    const applicationsApi = new ApplicationsApi();
    const userStore = useUserStore();

    // Getters
    const userApplications = computed(() => {
        const currentUserId = userStore.currentUser?.id;
        return applications.value.filter(app => app.applicantId === currentUserId);
    });

    const projectApplications = computed(() => (projectId) => {
        return applications.value.filter(app => app.projectId === projectId);
    });

    const pendingApplications = computed(() => {
        return userApplications.value.filter(app => app.status === 'pending');
    });

    const reviewedApplications = computed(() => {
        return userApplications.value.filter(app => app.status === 'reviewed');
    });

    const acceptedApplications = computed(() => {
        return userApplications.value.filter(app => app.status === 'accepted');
    });

    const rejectedApplications = computed(() => {
        return userApplications.value.filter(app => app.status === 'rejected');
    });

    const applicationStats = computed(() => {
        const userApps = userApplications.value;
        return {
            total: userApps.length,
            pending: userApps.filter(app => app.status === 'pending').length,
            reviewed: userApps.filter(app => app.status === 'reviewed').length,
            accepted: userApps.filter(app => app.status === 'accepted').length,
            rejected: userApps.filter(app => app.status === 'rejected').length
        };
    });

    const hasError = computed(() => error.value !== null);

    // Actions
    const clearError = () => {
        error.value = null;
    };

    const setLoading = (loading) => {
        isLoading.value = loading;
    };

    // CORREGIDO: Función para verificar aplicación existente
    const checkExistingApplication = async (applicantId, projectId, roleId) => {
        try {
            const response = await applicationsApi.getAll();
            const existingApp = response.data.find(app =>
                app.applicantId == applicantId &&
                app.projectId == projectId &&
                app.roleId == roleId
            );
            return { exists: !!existingApp };
        } catch (error) {
            console.error('Error checking existing application:', error);
            return { exists: false };
        }
    };

    // Application CRUD Operations - CORREGIDO
    const submitApplication = async (applicationData) => {
        try {
            setLoading(true);
            clearError();

            // CORREGIDO: Usar la nueva función para verificar aplicación existente
            const existingCheck = await checkExistingApplication(
                applicationData.applicantId,
                applicationData.projectId,
                applicationData.roleId
            );

            if (existingCheck.exists) {
                throw new Error('Ya has postulado a este rol en el proyecto');
            }

            // Transform form data to API format
            const apiData = ApplicationAssembler.fromFormToApi(applicationData, applicationData.applicantId);

            // Submit application
            const response = await applicationsApi.submitApplication(apiData);

            // Add to store
            const newApplication = ApplicationAssembler.fromApiToEntity(response.data);
            applications.value.push(newApplication);

            return newApplication;
        } catch (err) {
            error.value = err.message || 'Error al enviar la postulación';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchUserApplications = async (userId = null) => {
        try {
            setLoading(true);
            clearError();

            const targetUserId = userId || userStore.currentUser?.id;
            if (!targetUserId) {
                throw new Error('User ID is required');
            }

            const response = await applicationsApi.getUserApplications(targetUserId);
            applications.value = ApplicationAssembler.fromApiArrayToEntityArray(response.data);

            return applications.value;
        } catch (err) {
            error.value = err.message || 'Error al cargar las postulaciones';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectApplications = async (projectId) => {
        try {
            setLoading(true);
            clearError();

            const response = await applicationsApi.getProjectApplications(projectId);
            const projectApps = ApplicationAssembler.fromApiArrayToEntityArray(response.data);

            // Update applications in store
            applications.value = [
                ...applications.value.filter(app => app.projectId !== projectId),
                ...projectApps
            ];

            return projectApps;
        } catch (err) {
            error.value = err.message || 'Error al cargar las postulaciones del proyecto';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchApplication = async (applicationId) => {
        try {
            setLoading(true);
            clearError();

            const response = await applicationsApi.getApplication(applicationId);
            currentApplication.value = ApplicationAssembler.fromApiToEntity(response.data);

            // Update in applications list
            const index = applications.value.findIndex(app => app.id === applicationId);
            if (index !== -1) {
                applications.value[index] = currentApplication.value;
            } else {
                applications.value.push(currentApplication.value);
            }

            return currentApplication.value;
        } catch (err) {
            error.value = err.message || 'Error al cargar la postulación';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (applicationId, status, reviewNotes = '') => {
        try {
            setLoading(true);
            clearError();

            const reviewerId = userStore.currentUser?.id;

            // CORREGIDO: Usar updateApplication en lugar de updateApplicationStatus
            const updateData = {
                status: status,
                reviewNotes: reviewNotes,
                reviewerId: reviewerId,
                reviewedAt: new Date().toISOString()
            };

            const response = await applicationsApi.updateApplication(applicationId, updateData);

            // Update in store
            const application = applications.value.find(app => app.id === applicationId);
            if (application) {
                application.status = status;
                application.reviewNotes = reviewNotes;
                application.reviewerId = reviewerId;
                application.reviewedAt = new Date().toISOString();
            }

            // Update current application if it's the one being viewed
            if (currentApplication.value?.id === applicationId) {
                currentApplication.value = { ...currentApplication.value, ...updateData };
            }

            return application;
        } catch (err) {
            error.value = err.message || 'Error al actualizar el estado de la postulación';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const withdrawApplication = async (applicationId) => {
        try {
            setLoading(true);
            clearError();

            await applicationsApi.withdrawApplication(applicationId);

            // Remove from store
            applications.value = applications.value.filter(app => app.id !== applicationId);

            if (currentApplication.value?.id === applicationId) {
                currentApplication.value = null;
            }
        } catch (err) {
            error.value = err.message || 'Error al retirar la postulación';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // CORREGIDO: Eliminar métodos no implementados o simplificar
    const bulkUpdateStatus = async (applicationIds, status, reviewNotes = '') => {
        try {
            setLoading(true);
            clearError();

            const reviewerId = userStore.currentUser?.id;

            // Actualizar cada aplicación individualmente
            const promises = applicationIds.map(applicationId =>
                updateApplicationStatus(applicationId, status, reviewNotes)
            );

            await Promise.all(promises);

            return applications.value.filter(app => applicationIds.includes(app.id));
        } catch (err) {
            error.value = err.message || 'Error al actualizar los estados de las postulaciones';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationStats = async (userId = null) => {
        try {
            setLoading(true);
            clearError();

            const targetUserId = userId || userStore.currentUser?.id;
            if (!targetUserId) {
                throw new Error('User ID is required');
            }

            // CORREGIDO: Calcular estadísticas localmente
            await fetchUserApplications(targetUserId);
            return applicationStats.value;
        } catch (err) {
            error.value = err.message || 'Error al cargar las estadísticas';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadCV = async (applicationId, file) => {
        try {
            setLoading(true);
            clearError();

            // CORREGIDO: Simular subida de archivo (en una implementación real, esto subiría el archivo)
            console.log('Subiendo CV:', file.name, 'para aplicación:', applicationId);

            // En una implementación real, aquí subirías el archivo y obtendrías la URL
            const cvUrl = `/uploads/cv/${applicationId}_${file.name}`;

            // Actualizar aplicación
            const updateData = {
                cvFileName: file.name,
                cvUrl: cvUrl
            };

            await applicationsApi.updateApplication(applicationId, updateData);

            // Update application in store
            const application = applications.value.find(app => app.id === applicationId);
            if (application) {
                application.cvFileName = file.name;
                application.cvUrl = cvUrl;
            }

            if (currentApplication.value?.id === applicationId) {
                currentApplication.value.cvFileName = file.name;
                currentApplication.value.cvUrl = cvUrl;
            }

            return { cvUrl };
        } catch (err) {
            error.value = err.message || 'Error al subir el CV';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearCurrentApplication = () => {
        currentApplication.value = null;
    };

    const clearAll = () => {
        applications.value = [];
        currentApplication.value = null;
        error.value = null;
    };

    return {
        // State
        applications,
        currentApplication,
        isLoading,
        error,

        // Getters
        userApplications,
        projectApplications,
        pendingApplications,
        reviewedApplications,
        acceptedApplications,
        rejectedApplications,
        applicationStats,
        hasError,


        // Actions
        clearError,
        submitApplication,
        fetchUserApplications,
        fetchProjectApplications,
        fetchApplication,
        updateApplicationStatus,
        withdrawApplication,
        bulkUpdateStatus,
        fetchApplicationStats,
        uploadCV,
        clearCurrentApplication,
        clearAll
    };
});