const incidentList = () => import('./presentation/views/incident-list.vue');
const incidentForm = () => import('./presentation/views/incident-form.vue');

const safetyRoutes = [
    { path: '', name: 'incidents', component: incidentList, meta: { title: 'Incidents' } },
    { path: 'new', name: 'incident-new', component: incidentForm, meta: { title: 'New Incident' } },
    { path: ':id/edit', name: 'incident-edit', component: incidentForm, meta: { title: 'Edit Incident' } }
];

export default safetyRoutes;