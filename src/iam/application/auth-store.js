// application/auth-store.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref(null);
    const isAuthenticated = computed(() => !!currentUser.value);

    // Simular login (deberías reemplazar esto con tu lógica real de autenticación)
    const login = async (credentials) => {
        try {
            // Aquí iría tu llamada a la API de login
            // Por ahora, simulamos un usuario
            currentUser.value = {
                id: credentials.userId || '1', // Esto debería venir de tu backend
                username: credentials.username,
                email: credentials.email
            };

            // Guardar en localStorage para persistencia
            localStorage.setItem('currentUser', JSON.stringify(currentUser.value));
            return currentUser.value;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        currentUser.value = null;
        localStorage.removeItem('currentUser');
    };

    // Cargar usuario desde localStorage al inicializar
    const loadUserFromStorage = () => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser.value = JSON.parse(storedUser);
        }
    };

    // Inicializar
    loadUserFromStorage();

    return {
        currentUser,
        isAuthenticated,
        login,
        logout,
        loadUserFromStorage
    };
});