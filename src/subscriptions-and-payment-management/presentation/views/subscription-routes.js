const planList = () => import('./views/plan-list.vue');

const subscriptionRoutes = [
  {
    path: 'plans',
    name: 'subscriptions-plans',
    component: planList,
    meta: { title: 'Subscription Plans' },
  },
];

export default subscriptionRoutes;
