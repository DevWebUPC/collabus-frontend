import { createRouter, createWebHistory } from "vue-router";
import Home from "../shared/presentation/views/home.vue";
import Login from "../iam/presentation/views/login.component.vue";

const pageNotFound = () =>
  import("../shared/presentation/views/page-not-found.vue");
const routes = [
    { path: "/", name: "login", component: Login, meta: { title: "Login" }},
    { path: "/login",  redirect: "/", meta: { title: "Login" }},
    { path: "/home", name: "home", component: Home, meta: { title: "Home" } },
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
