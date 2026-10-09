const tourList = () => import('./views/tour-list.vue')

const tourManagementRoutes = [
    { path: 'tours', name: 'tour-management-tours', component: tourList, meta: { title: 'tours' } },
    { path: '', redirect: 'tours' },
]

export default tourManagementRoutes