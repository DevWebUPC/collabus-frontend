// milestones-management/presentation/milestone-routes.js
const MilestoneCreateForm = () => import('../presentation/views/MilestoneCreateForm.vue')
const ProjectMilestonesView = () => import('../presentation/views/ProjectMilestonesView.vue')
const MilestoneDetailView = () => import('../presentation/views/MilestoneDetailView.vue')
const MilestoneTasksView = () => import('../presentation/views/MilestoneTasksView.vue')
// 👇 Asegúrate de que esto sea un export named
export const milestoneRoutes = [
    {
        path: '/projects/:projectId/milestones/create',
        name: 'milestone-create',
        component: MilestoneCreateForm,
        meta: {
            title: 'Create Milestone',
            requiresAuth: true
        }
    },
    {
        path: '/projects/:projectId/milestones',
        name: 'project-milestones',
        component: ProjectMilestonesView,
        meta: {
            title: 'Milestones del Proyecto',
            requiresAuth: true
        }
    },
    {
        path: '/projects/:projectId/milestones/:milestoneId',
        name: 'milestone-detail', // 👈 Este es el nombre que usas
        component: MilestoneDetailView,
        meta: {
            title: 'Detalle del Hito',
            requiresAuth: true
        }
    },
    {
        path: '/projects/:projectId/milestone-tasks',
        name: 'milestone-tasks',
        component: MilestoneTasksView,
        meta: {
            title: 'Mis Tareas del Hito',
            requiresAuth: true
        }
    }
];