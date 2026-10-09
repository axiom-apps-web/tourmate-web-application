const tourList = () => import('./views/tour-list.vue')
const tourForm = () => import('./views/tour-form.vue')

const tourManagementRoutes = [
    { path: 'tours', name: 'tour-management-tours', component: tourList, meta: { title: 'tours' } },
    { path: 'tours/new', name: 'tour-management-tours-new', component: tourForm, meta: { title: 'new tour' } },
    { path: 'tours/:id/edit', name: 'tour-management-tours-edit', component: tourForm, meta: { title: 'edit tour' } },
    { path: '', redirect: 'tours' },
]

export default tourManagementRoutes