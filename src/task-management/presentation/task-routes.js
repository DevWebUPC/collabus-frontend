// task-management/presentation/task-routes.js
const ProjectTasksView = () => import('./view/ProjectTasksView.vue');
const TaskCreateView = () => import('./view/TaskCreateForm.vue'); // Si necesitas vista separada

export const taskRoutes = [
    {
        path: '/projects/:projectId/tasks',
        name: 'project-tasks',
        component: ProjectTasksView,
        meta: {
            title: 'Project Tasks',
            requiresAuth: true
        },
        props: true
    },
    {
        path: '/projects/:projectId/tasks/create',
        name: 'task-create',
        component: TaskCreateView,
        meta: {
            title: 'Create Task',
            requiresAuth: true
        },
        props: true
    },
];