// task-management/presentation/task-routes.js
const ProjectTasksView = () => import('./view/ProjectTasksView.vue');
const TaskCreateView = () => import('./view/TaskCreateForm.vue');
const TaskDetail = () => import('./view/TaskDetail.vue');
const TaskExecutionView = () => import('./view/TaskExecutionView.vue');
const TaskSubmissionView = () => import('./view/TaskSubmissionView.vue'); // NUEVO

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
    {
        path: '/projects/:projectId/tasks/:taskId',
        name: 'task-detail',
        component: TaskDetail,
        meta: {
            title: 'Task Detail',
            requiresAuth: true
        },
        props: true
    },
    {
        path: '/projects/:projectId/tasks/:taskId/execute',
        name: 'task-execution',
        component: TaskExecutionView,
        meta: {
            title: 'Execute Task',
            requiresAuth: true
        },
        props: true
    },
    {
        path: '/projects/:projectId/tasks/:taskId/submission',
        name: 'task-submission',
        component: TaskSubmissionView,
        meta: {
            title: 'Task Submission',
            requiresAuth: true
        },
        props: true
    }
];