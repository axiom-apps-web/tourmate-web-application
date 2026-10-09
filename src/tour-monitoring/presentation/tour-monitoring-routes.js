// Lazy-loaded components
const activeTourList = () => import('./views/active-tour-list.vue');
const activeTourForm = () => import('./views/active-tour-form.vue');
const liveTourView = () => import('./views/live-tour-view.vue');

const tourMonitoringRoutes = [
    {   path: 'active-tours',             name: 'tour-monitoring-active-tours',      component: activeTourList, meta: {title: 'ActiveTours'}},
    {   path: 'active-tours/new',         name: 'tour-monitoring-active-tour-new',    component: activeTourForm, meta: {title: 'New ActiveTour'}},
    {   path: 'active-tours/:id/edit',    name: 'tour-monitoring-active-tour-edit',   component: activeTourForm, meta: {title: 'Edit ActiveTour'}},
    {   path: 'active-tours/:activeTourId/live', name: 'tour-monitoring-live-tour', component: liveTourView, meta: {title: 'LiveTour'}},
   
];

export default tourMonitoringRoutes;