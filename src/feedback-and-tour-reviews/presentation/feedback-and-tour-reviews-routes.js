// Lazy-loaded components
const reviewList = () => import('./views/review-list.vue');

const feedbackAndTourReviewsRoutes = [
    {   path: 'reviews',    name: 'feedback-reviews',   component: reviewList, meta: {title: 'Comments'}},
];

export default feedbackAndTourReviewsRoutes;