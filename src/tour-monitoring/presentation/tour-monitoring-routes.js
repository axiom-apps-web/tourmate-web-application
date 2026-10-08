// Lazy-loaded components
const activeTourList = () => import('./views/active-tour-list.vue');
const activeTourForm = () => import('./views/active-tour-form.vue');

const tourMonitoringRoutes = [
    {   path: 'activeTours',             name: 'tour-monitoring-activeTours',      component: activeTourList, meta: {title: 'ActiveTours'}},
    {   path: 'activeTours/new',         name: 'tour-monitoring-activeTour-new',    component: activeTourForm, meta: {title: 'New ActiveTour'}},
    {   path: 'activeTours/:id/edit',    name: 'tour-monitoring-activeTour-edit',   component: activeTourForm, meta: {title: 'Edit ActiveTour'}},
   
];

export default tourMonitoringRoutes;