const planList = () => import('./views/plan-list.vue');
const subscriptionList = () =>
import('./views/subscription-list.vue');
const paymentList = () => import('./views/payment-list.vue');

const subscriptionRoutes = [
{ path: 'plans', name: 'subscriptions-plans', component: planList, meta: { title: 'Subscription Plans' },
},
{ path: 'list', name: 'subscriptions-list', component: subscriptionList, meta: { title: 'Subscriptions' },
},
{ path: 'payments', name: 'subscriptions-payments', component: paymentList, meta: { title: 'Payments' },
  },
];

export default subscriptionRoutes;

