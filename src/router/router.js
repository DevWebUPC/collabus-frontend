import { createRouter, createWebHistory } from "vue-router";
import Home from "../shared/presentation/views/home.vue";
import Login from "../iam/presentation/views/login.component.vue";
import RecoveryPassword from "../iam/presentation/views/recovery-password.component.vue"
import Register from "../iam/presentation/views/register.component.vue";
import Onboarding from "../iam/presentation/views/onboarding.component.vue";
import ProfileView from "../profile-management/presentation/views/profile-view.vue";

const pageNotFound = () =>
  import("../shared/presentation/views/page-not-found.vue");
const routes = [
    { path: "/", name: "login", component: Login, meta: { title: "Login" }},
    { path: "/register", name: "register", component: Register, meta: { title: "Register" }},
    { path: "/login",  redirect: "/", meta: { title: "Login" }},
    { path: "/create-account", name: "create-account", component: Onboarding, meta: { title: "Create Account" }},
    { path: "/home", name: "home", component: Home, meta: { title: "Home" } },
    { path: "/recovery-password", name: "recovery-password", component: RecoveryPassword, meta: { title: "Recovery Password" }},
    { path: "/profile", name: 'profile-view', component: ProfileView, meta: { title: "Profile View" }},
    { path: "/:pathMatch(.*)*", name: "not-found", component: pageNotFound, meta: { title: "Page Not Found" },},

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeEach((to, from, next) => {
  console.log(`Navigating from ${from.name} to ${to.name}`);
  // Set the page title
  let baseTitle = "CollabUs";
  document.title = `${baseTitle} - ${to.meta["title"]}`;
  next();
});

export default router;
