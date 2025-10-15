import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ProfileApi } from '../infrastructure/profile-api.js';
import { ProfileAssembler } from '../infrastructure/profile.assembler.js';

export const useProfileStore = defineStore('profile', () => {
    // State
    const allProfiles = ref([]);
    const currentProfile = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // API instance
    const profileApi = new ProfileApi();

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

    const fetchAllProfiles = async () => {
        try {
            setLoading(true);
            clearError();

            console.log('🔄 Cargando todos los perfiles desde API');

            const response = await profileApi.getAll(); // Necesitarás implementar este método
            const profiles = response.data;

            if (!profiles || profiles.length === 0) {
                console.log('❌ No se encontraron perfiles');
                allProfiles.value = [];
                return [];
            }

            const profileEntities = profiles.map(profileData =>
                ProfileAssembler.fromApiToEntity(profileData)
            );

            console.log('✅ Perfiles cargados desde API:', profileEntities.length);
            allProfiles.value = profileEntities;

            return profileEntities;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al obtener los perfiles';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const searchProfiles = async (filters, excludeCurrentUser=true) => {
        try {
            setLoading(true);
            clearError();

            console.log('🔍 Buscando perfiles con filtros:', filters);

            // Implementar búsqueda según los filtros
            let filteredProfiles = [...allProfiles.value];

            // 👇 Excluir usuario actual por defecto
            if (excludeCurrentUser && currentProfile.value) {
                filteredProfiles = filteredProfiles.filter(profile =>
                    profile.userId !== currentProfile.value.userId
                );
            }

            if (filters.query) {
                const query = filters.query.toLowerCase();
                filteredProfiles = filteredProfiles.filter(profile =>
                    profile.username.toLowerCase().includes(query) ||
                    profile.abilities.some(skill => skill.toLowerCase().includes(query))
                );
            }

            if (filters.role) {
                filteredProfiles = filteredProfiles.filter(profile =>
                    profile.role.toLowerCase().includes(filters.role.toLowerCase())
                );
            }

            if (filters.minScore) {
                filteredProfiles = filteredProfiles.filter(profile =>
                    profile.points >= parseInt(filters.minScore)
                );
            }

            if (filters.maxScore) {
                filteredProfiles = filteredProfiles.filter(profile =>
                    profile.points <= parseInt(filters.maxScore)
                );
            }

            console.log('✅ Resultados de búsqueda:', filteredProfiles.length);
            return filteredProfiles;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al buscar perfiles';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Complete onboarding - CORREGIDO
    const completeOnboarding = async (onboardingData, userId) => {
        try {
            setLoading(true);
            clearError();

            // Transform data and create profile
            const apiData = ProfileAssembler.fromOnboardingToApi(onboardingData, userId);
            const response = await profileApi.create(apiData);

            // Si la respuesta es exitosa, crear el perfil localmente
            if (response.status >= 200 && response.status < 300) {
                const newProfile = ProfileAssembler.fromApiToEntity(response.data);

                // Store profile in local storage for persistence
                localStorage.setItem('currentProfile', JSON.stringify(newProfile));
                localStorage.setItem('profileId', newProfile.id);

                currentProfile.value = newProfile;
                return newProfile;
            } else {
                throw new Error('Error al completar el onboarding');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al completar el onboarding';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get profile by user ID - ACTUALIZADO
    const getProfileByUserId = async (userId, forceRefresh = false) => {
        try {
            setLoading(true);
            clearError();

            console.log('🔄 Cargando perfil desde API para userId:', userId);

            const response = await profileApi.getByUserId(userId);
            const profiles = response.data;

            if (!profiles || profiles.length === 0) {
                console.log('❌ No se encontró perfil para userId:', userId);
                return null;
            }

            const profile = ProfileAssembler.fromApiToEntity(profiles[0]);
            console.log('✅ Perfil cargado desde API:', profile);

            // Actualizar el perfil actual y localStorage
            currentProfile.value = profile;
            localStorage.setItem('currentProfile', JSON.stringify(profile));
            localStorage.setItem('profileId', profile.id);

            return profile;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al obtener el perfil';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    // Update profile
    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            clearError();

            if (!currentProfile.value) {
                throw new Error('No hay perfil cargado');
            }

            const apiData = ProfileAssembler.fromUpdateToApi(profileData);
            // Cambiar de update a patch
            const response = await profileApi.patch(currentProfile.value.id, apiData);

            if (response.status >= 200 && response.status < 300) {
                const updatedProfile = ProfileAssembler.fromApiToEntity(response.data);

                // Update current profile
                currentProfile.value = updatedProfile;
                localStorage.setItem('currentProfile', JSON.stringify(updatedProfile));

                return updatedProfile;
            } else {
                throw new Error('Error al actualizar el perfil');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar el perfil';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProfileById = async (profileId, profileData) => {
        try {
            setLoading(true);
            clearError();

            const apiData = ProfileAssembler.fromUpdateToApi(profileData);
            const response = await profileApi.patch(profileId, apiData);

            if (response.status >= 200 && response.status < 300) {
                const updatedProfile = ProfileAssembler.fromApiToEntity(response.data);

                // Actualizar en la lista de todos los perfiles
                const index = allProfiles.value.findIndex(p => p.id === profileId);
                if (index !== -1) {
                    allProfiles.value[index] = updatedProfile;
                }

                // Si es el perfil actual, actualizarlo también
                if (currentProfile.value && currentProfile.value.id === profileId) {
                    currentProfile.value = updatedProfile;
                    localStorage.setItem('currentProfile', JSON.stringify(updatedProfile));
                }

                return updatedProfile;
            } else {
                throw new Error('Error al actualizar el perfil');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar el perfil';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const initializeProfile = () => {
        const storedProfile = localStorage.getItem('currentProfile');
        if (storedProfile) {
            try {
                const parsedProfile = JSON.parse(storedProfile);
                console.log('📂 Perfil cargado desde localStorage:', parsedProfile);
                currentProfile.value = parsedProfile;

                // Verificar si el perfil de localStorage está desactualizado
                // Podemos marcar que necesita recarga en el próximo getProfileByUserId
            } catch (e) {
                console.error('Error parsing stored profile:', e);
                clearProfile();
            }
        }
    };

    // Computed properties
    const hasProfile = computed(() => {
        return !!currentProfile.value;
    });

    const isProfileComplete = computed(() => {
        return currentProfile.value?.isComplete() || false;
    });

    const profileCompletion = computed(() => {
        return currentProfile.value?.getCompletionPercentage() || 0;
    });

    const clearProfile = () => {
        currentProfile.value = null;
        localStorage.removeItem('currentProfile');
        localStorage.removeItem('profileId');
    };

    return {
        // State
        currentProfile,
        loading,
        allProfiles,
        error,

        // Computed
        hasProfile,
        isProfileComplete,
        profileCompletion,

        // Actions
        completeOnboarding,
        getProfileByUserId,
        updateProfile,
        initializeProfile,
        setLoading,
        clearProfile,
        setError,
        clearError,
        fetchAllProfiles,
        updateProfileById,
        searchProfiles,
    };
});