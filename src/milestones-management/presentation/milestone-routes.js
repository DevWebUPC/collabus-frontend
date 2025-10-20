// milestones-management/presentation/milestone-routes.js
const MilestoneCreateForm = () => import('../presentation/views/MilestoneCreateForm.vue')
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
];