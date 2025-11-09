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
    const token = ref(localStorage.getItem('authToken'));

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

    const setToken = (newToken) => {
        token.value = newToken;
        if (newToken) {
            localStorage.setItem('authToken', newToken);
        } else {
            localStorage.removeItem('authToken');
        }
    };

    // User registration - CORREGIDO
    const register = async (registrationData) => {
        try {
            setLoading(true);
            clearError();

            // Transform data and register
            const apiData = UserAssembler.fromRegistrationToApi(registrationData);
            const response = await usersApi.register(apiData);

            // ✅ SOLUCIÓN: Usar el ID que devuelve el backend
            if (response.status >= 200 && response.status < 300) {
                const newUser = {
                    id: response.data.id, // ✅ Usar el ID real del backend
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

    // Login - CONECTADO AL BACKEND C#
    const login = async (email, password) => {
        try {
            setLoading(true);
            clearError();

            console.log('🔐 Attempting login with backend:', email);

            // Usar el endpoint de autenticación del backend C#
            const response = await usersApi.authenticate(email, password);

            if (response.data && response.data.token) {
                const { id, fullName, token: authToken } = response.data;

                // Guardar token
                setToken(authToken);

                // Crear usuario con datos del backend
                const user = {
                    id: id,
                    fullName: fullName,
                    email: email,
                    token: authToken
                };

                // Store user in local storage
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('userId', user.id);

                currentUser.value = user;

                console.log('✅ Login successful for user:', fullName);
                return user;
            } else {
                throw new Error('Respuesta de autenticación inválida');
            }

        } catch (err) {
            console.error('❌ Login error:', err);

            let errorMessage = 'Error al iniciar sesión';
            if (err.response?.status === 401) {
                errorMessage = 'Credenciales incorrectas';
            } else if (err.response?.data) {
                errorMessage = err.response.data;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = computed(() => {
        return !!currentUser.value && !!token.value;
    });

    // Logout
    const logout = () => {
        currentUser.value = null;
        token.value = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentProfile');
        localStorage.removeItem('profileId');
    };

    // Inicializar usuario desde localStorage
    const initializeUser = () => {
        const storedUser = localStorage.getItem('currentUser');
        const storedToken = localStorage.getItem('authToken');

        if (storedUser && storedToken) {
            try {
                currentUser.value = JSON.parse(storedUser);
                token.value = storedToken;
            } catch (e) {
                console.error('Error parsing stored user:', e);
                logout();
            }
        }
    };

    return {
        // State
        currentUser,
        loading,
        error,
        token,

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