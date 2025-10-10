// Project routes configuration
const ProjectList = () => import('./views/project-list.vue');
const ProjectDetail = () => import('./views/project-detail.vue');
const ProjectCreate = () => import('./views/project-create.vue');

export const projectRoutes = [
  {
    path: '/projects',
    name: 'projects',
    component: ProjectList,
    meta: { 
      title: 'Projects',
      requiresAuth: true 
    }
  },
  {
    path: '/projects/create',
    name: 'project-create',
    component: ProjectCreate,
    meta: { 
      title: 'Create Project',
      requiresAuth: true 
    }
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: ProjectDetail,
    meta: { 
      title: 'Project Detail',
      requiresAuth: true 
    },
    props: true
  }
];