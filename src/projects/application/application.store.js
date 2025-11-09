import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ApplicationsApi } from '../infrastructure/applications-api.js';
import { ApplicationAssembler } from '../infrastructure/application.assembler.js';
import { useUserStore } from '../../iam/application/user-store.js';
import { useProjectDetailStore } from './project-detail.store.js';
import { useProjectsStore } from './projects.store.js';

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
    const projectDetailStore = useProjectDetailStore();
    const projectsStore = useProjectsStore();

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
            console.log('🔍 Checking existing application for:', { applicantId, projectId, roleId });

            // Primero buscar en el store local (más rápido)
            const existingInStore = applications.value.find(app =>
                String(app.applicantId) === String(applicantId) &&
                String(app.projectId) === String(projectId) &&
                String(app.roleId) === String(roleId)
            );

            if (existingInStore) {
                console.log('⚠️ Found existing application in store:', existingInStore);
                return { exists: true, application: existingInStore };
            }

            // Si no está en el store, consultar la API
            const response = await applicationsApi.getAll();
            const existingApp = response.data.find(app =>
                String(app.applicantId) === String(applicantId) &&
                String(app.projectId) === String(projectId) &&
                String(app.roleId) === String(roleId)
            );

            if (existingApp) {
                console.log('⚠️ Found existing application in API:', existingApp);
                // Agregar al store para futuras verificaciones
                applications.value.push(ApplicationAssembler.fromApiToEntity(existingApp));
            }

            return { exists: !!existingApp, application: existingApp };
        } catch (error) {
            console.error('Error checking existing application:', error);
            // En caso de error, asumir que no existe para no bloquear al usuario
            return { exists: false };
        }
    };
    // Application CRUD Operations - CORREGIDO

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

            console.log('🔄 Fetching applications for project:', projectId);

            const response = await applicationsApi.getProjectApplications(projectId);
            console.log('📋 Raw API response:', response);

            // Asegurar que los datos tengan applicantName
            const projectApps = ApplicationAssembler.fromApiArrayToEntityArray(response.data);

            // Debug: verificar que applicantName esté presente
            projectApps.forEach(app => {
                console.log(`👤 Application ${app.id}:`, {
                    id: app.id,
                    applicantName: app.applicantName,
                    applicantEmail: app.applicantEmail,
                    roleId: app.roleId
                });
            });

            // Update applications in store
            applications.value = [
                ...applications.value.filter(app => app.projectId != projectId),
                ...projectApps
            ];

            return projectApps;
        } catch (err) {
            // ... manejo de errores sin cambios ...
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

    // application.store.js - MODIFICAR updateApplicationStatus
    const updateApplicationStatus = async (applicationId, status, reviewNotes = '') => {
        try {
            setLoading(true);
            clearError();

            const reviewerId = userStore.currentUser?.id;
            const application = applications.value.find(app => app.id === applicationId);

            if (!application) {
                throw new Error('Application not found');
            }

            console.log('🔄 Updating application status:', { applicationId, status, reviewNotes });


            // Determinar qué endpoint usar según el estado
            let response;
            if (status === 'accepted') {
                response = await applicationsApi.acceptApplication(applicationId, {
                    reviewerId,
                    reviewNotes
                });

                // ✅ NUEVO: Recargar el proyecto para obtener colaboradores actualizados
                if (projectDetailStore.project) {
                    await projectDetailStore.fetchProjectById(projectDetailStore.project.id);
                }

            } else if (status === 'rejected') {
                response = await applicationsApi.rejectApplication(applicationId, {
                    reviewerId,
                    reviewNotes
                });

                if (projectDetailStore.project) {
                    await projectDetailStore.fetchProjectById(projectDetailStore.project.id);
                }

            } else {
                response = await applicationsApi.updateApplicationStatus(applicationId, {
                    status,
                    reviewerId,
                    reviewNotes
                });
            }

            // ✅ ACTUALIZACIÓN: Recargar aplicaciones para reflejar el cambio de estado
            if (projectDetailStore.project?.id) {
                await fetchProjectApplications(projectDetailStore.project.id);
            }

            // Update in store
            if (application) {
                application.status = status;
                application.reviewNotes = reviewNotes;
                application.reviewerId = reviewerId;
                application.reviewedAt = new Date().toISOString();
            }

            // Update current application if it's the one being viewed
            if (currentApplication.value?.id === applicationId) {
                currentApplication.value.status = status;
                currentApplication.value.reviewNotes = reviewNotes;
                currentApplication.value.reviewerId = reviewerId;
                currentApplication.value.reviewedAt = new Date().toISOString();
            }

            console.log('✅ Application status updated successfully');
            return application;
        } catch (err) {
            error.value = err.message || 'Error al actualizar el estado de la postulación';
            console.error('❌ Error updating application status:', err);
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


    // En application.store.js - MODIFICAR la función submitApplication
    const submitApplication = async (applicationData) => {
        try {
            setLoading(true);
            clearError();

            // Verificar aplicación existente
            const existingCheck = await checkExistingApplication(
                applicationData.applicantId,
                applicationData.projectId,
                applicationData.roleId
            );

            if (existingCheck.exists) {
                throw new Error('Ya te has postulado a este rol en el proyecto');
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
            // ✅ MEJORA: Manejar específicamente el error 400 de aplicación duplicada
            if (err.response?.status === 400) {
                // Verificar si el mensaje del backend indica duplicado
                const backendMessage = err.response?.data?.message || err.response?.data;

                if (backendMessage && (
                    backendMessage.includes('duplicate') ||
                    backendMessage.includes('already exists') ||
                    backendMessage.includes('Application already exists')
                )) {
                    error.value = 'Ya te has postulado a este rol en el proyecto';
                } else {
                    error.value = backendMessage || 'No puedes postularte dos veces al mismo rol';
                }
            }
            // ✅ MEJORA: Capturar otros errores de validación del backend
            else if (err.response?.status === 400) {
                const backendMessage = err.response?.data?.message || err.response?.data;
                error.value = backendMessage || 'Error en los datos de la postulación';
            }
            else if (err.message === 'Ya te has postulado a este rol en el proyecto') {
                error.value = err.message;
            }
            else {
                error.value = err.message || 'Error al enviar la postulación';
            }

            console.error('❌ Error submitting application:', err.response?.data || err.message);
            throw new Error(error.value); // Lanzar el error con mensaje amigable
        } finally {
            setLoading(false);
        }
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
        clearAll,
    };
});