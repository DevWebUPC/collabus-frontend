// stores/user.store.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UsersApi } from '../infrastructure/user-api.js';
import { UserAssembler } from '../infrastructure/user.assembler.js';

export const useUserStore = defineStore('user', () => {
    // State
    const currentUser = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // API instance
    const usersApi = new UsersApi();

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

    // User registration - CORREGIDO
    const register = async (registrationData) => {
        try {
            setLoading(true);
            clearError();

            // Transform data and register
            const apiData = UserAssembler.fromRegistrationToApi(registrationData);
            const response = await usersApi.register(apiData);

            // Si la respuesta es exitosa, crear el usuario localmente
            if (response.status >= 200 && response.status < 300) {
                const newUser = {
                    id: Date.now().toString(), // ID temporal
                    ...apiData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // Store user in local storage for persistence
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                localStorage.setItem('userId', newUser.id);

                currentUser.value = newUser;
                return newUser;
            } else {
                throw new Error('Error en el registro');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error en el registro';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Complete onboarding - CORREGIDO
    const completeOnboarding = async (onboardingData) => {
        try {
            setLoading(true);
            clearError();

            if (!currentUser.value) {
                throw new Error('No hay usuario logueado');
            }

            const apiData = UserAssembler.fromOnboardingToApi(onboardingData);

            // Actualizar usuario localmente
            const updatedUser = {
                ...currentUser.value,
                ...apiData,
                updatedAt: new Date().toISOString()
            };

            // Update current user
            currentUser.value = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            return updatedUser;
        } catch (err) {
            setError('Error al completar el onboarding');
            console.error('Error completing onboarding:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Login - CORREGIDO
    const login = async (email, password) => {
        try {
            setLoading(true);
            clearError();

            const response = await usersApi.getByEmail(email);
            const users = response.data;

            if (!users || users.length === 0) {
                throw new Error('Usuario no encontrado');
            }

            // Buscar usuario que coincida con email Y contraseña
            const userData = users.find(user =>
                user.email === email && user.password === password
            );

            if (!userData) {
                throw new Error('Credenciales incorrectas');
            }

            const user = UserAssembler.fromApiToEntity(userData);

            // Store user in local storage
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('userId', user.id);

            currentUser.value = user;

            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Resto del código permanece igual...
    const logout = () => {
        currentUser.value = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
    };

    const isAuthenticated = computed(() => {
        return !!currentUser.value;
    });

    const initializeUser = () => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                currentUser.value = JSON.parse(storedUser);
            } catch (e) {
                console.error('Error parsing stored user:', e);
                localStorage.removeItem('currentUser');
                localStorage.removeItem('userId');
            }
        }
    };

    return {
        // State
        currentUser,
        loading,
        error,

        // Computed
        isAuthenticated,

        // Actions
        register,
        login,
        logout,
        completeOnboarding,
        initializeUser,
        setLoading,
        setError,
        clearError
    };
});