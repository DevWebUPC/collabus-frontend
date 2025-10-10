// Project routes configuration
const ProjectList = () => import('./views/project-list.vue');
const ProjectDetail = () => import('./views/project-detail.vue');
const ProjectCreate = () => import('./views/project-create.vue');
const ShowProject = () => import('./views/show-project.component.vue');

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
        path: '/projects/show/:id',
        name: 'projects-show',
        component: ShowProject,
        meta: {
            title: 'Projects show',
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