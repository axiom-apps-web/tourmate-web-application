import {createRouter, createWebHistory} from "vue-router";
import Home from "./shared/presentation/views/home.vue";
import tourMonitoringRoutes from "./tour-monitoring/presentation/tour-monitoring-routes.js";


// Define lazy-loaded components for routes
const about = () => import('./shared/presentation/views/about.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');
const monitoringRoutes = tourMonitoringRoutes.map(route => ({
    ...route,
    path: `/tour-monitoring/${route.path}`
}));

const routes = [
    { path: '/home',            name: 'home',       component: Home,        meta: { title: 'Home' } },
    { path: '/about',           name: 'about',      component: about,       meta: { title: 'About' } },
    ...monitoringRoutes,
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