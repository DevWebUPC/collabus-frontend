// milestones-management/presentation/milestone-routes.js
const MilestoneCreateForm = () => import('../presentation/views/MilestoneCreateForm.vue')
const ProjectMilestonesView = () => import('../presentation/views/ProjectMilestonesView.vue')
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
    }
];