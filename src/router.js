import {createRouter, createWebHistory} from "vue-router";
import Home from "./shared/presentation/views/home.vue";
import tourMonitoringRoutes from "./tour-monitoring/presentation/tour-monitoring-routes.js";
import tourManagementRoutes from "./tour-management/presentation/tour-management-routes.js";
import feedbackAndTourReviewsRoutes from "./feedback-and-tour-reviews/presentation/feedback-and-tour-reviews-routes.js";

import safetyRoutes from "./safety-and-incident-management/safety-incident.routes.js";


// Define lazy-loaded components for routes
const about = () => import('./shared/presentation/views/about.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    { path: '/home',            name: 'home',       component: Home,        meta: { title: 'Home' } },
    { path: '/about',           name: 'about',      component: about,       meta: { title: 'About' } },
    { path: '/tour-monitoring', name: 'tour-monitoring', children: tourMonitoringRoutes },
    { path: '/tour-management', name: 'tour-management', children: tourManagementRoutes},
    { path: '/feedback-and-tour-reviews', name: 'feedback-and-tour-reviews', children: feedbackAndTourReviewsRoutes },

    { path: '/incidents',     name: 'incidents-root', children: safetyRoutes },

    { path: '/',                redirect: '/home' },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { title: 'Page Not Found' } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,

});

/**
 * Global navigation guard that updates the document title and delegates auth when enabled.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @param {import('vue-router').RouteLocationNormalized} from - Previous route.
 * @returns {{name: string}|boolean|undefined} - Returns true to allow navigation or an object to redirect.
 */
router.beforeEach((to, from) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    // Set the page title
    let baseTitle = 'TOUR MATE';
    document.title = `${baseTitle} - ${to.meta['title']}`;

    return true;
});

export default router;