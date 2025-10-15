// profile-management/presentation/profile-routes.js
import ProfileView from "./views/profile-view.vue";
import PublicProfileView from "./views/public-profile-view.vue"; // Lo crearemos después

export const profileRoutes = [
    {
        path: "/profile",
        name: "my-profile",
        component: ProfileView,
        meta: { title: "Mi Perfil", requiresAuth: true }
    },
    {
        path: "/profile/:id",
        name: "public-profile",
        component: PublicProfileView,
        meta: { title: "Perfil" }
    }
];