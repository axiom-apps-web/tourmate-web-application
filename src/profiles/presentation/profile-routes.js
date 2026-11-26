const profileView = () => import('./views/my-profile.vue');

const profileRoutes = [
    { path: 'my-profile', name: 'profiles-my-profile', component: profileView, meta: { title: 'My profile' } },
    { path: '', redirect: 'my-profile' },
];

export default profileRoutes;
