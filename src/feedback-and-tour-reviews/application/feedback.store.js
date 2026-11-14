import { defineStore } from "pinia";
import { ref } from "vue";
import { FeedbackApi } from "../infrastructure/feedback-api.js";
import { ReviewAssembler } from "../infrastructure/review.assembler.js";

const feedbackApi = new FeedbackApi();

/**
 * Application store of the Feedback and Tour Reviews bounded context.
 */
const useFeedbackStore = defineStore('feedback', () => {
    const reviews = ref([]);
    const tours = ref([]);
    const users = ref([]);
    const errors = ref([]);
    const loaded = ref(false);

    /** Loads reviews (with their comments) plus the tours and users needed to show names. */
    async function fetchReviews() {
        try {
            const [reviewsResponse, commentsResponse, toursResponse, usersResponse] = await Promise.all([
                feedbackApi.getReviews(),
                feedbackApi.getComments(),
                feedbackApi.getTours(),
                feedbackApi.getUsers()
            ]);
            reviews.value = ReviewAssembler.toEntitiesFromResponse(reviewsResponse, commentsResponse);
            tours.value = toursResponse.data;
            users.value = usersResponse.data;
            loaded.value = true;
        } catch (error) {
            errors.value.push(error);
        }
    }

    function getReviewById(id) {
        return reviews.value.find(review => String(review.id) === String(id));
    }

    function getTourTitle(tourId) {
        const tour = tours.value.find(item => item.id === tourId);
        return tour ? tour.title : null;
    }

    function getUserName(userId) {
        const user = users.value.find(item => item.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : null;
    }

    /** Creates the review and, if there is text, its comment. */
    async function addReview(review) {
        let createdReviewId = null;
        try {
            review.createdAt = new Date().toISOString();
            const response = await feedbackApi.createReview(ReviewAssembler.toReviewResource(review));
            review.id = response.data.id;
            createdReviewId = review.id;
            if (review.comment.trim()) {
                const commentResponse = await feedbackApi.createComment(ReviewAssembler.toCommentResource(review, review.id));
                review.commentId = commentResponse.data.id;
            }
            reviews.value.push(review);
            return true;
        } catch (error) {
            if (createdReviewId !== null) {
                try {
                    await feedbackApi.deleteReview(createdReviewId);
                } catch (cleanupError) {
                    errors.value.push(cleanupError);
                }
            }
            errors.value.push(error);
            return false;
        }
    }

    /** Updates the review and creates, updates or removes its comment as needed. */
    async function updateReview(review) {
        try {
            await feedbackApi.updateReview(review.id, ReviewAssembler.toReviewResource(review));
            const hasText = review.comment.trim().length > 0;
            if (hasText && review.commentId) {
                await feedbackApi.updateComment(review.commentId, ReviewAssembler.toCommentResource(review, review.id));
            } else if (hasText) {
                const commentResponse = await feedbackApi.createComment(ReviewAssembler.toCommentResource(review, review.id));
                review.commentId = commentResponse.data.id;
            } else if (review.commentId) {
                await feedbackApi.deleteComment(review.commentId);
                review.commentId = null;
            }
            const index = reviews.value.findIndex(item => String(item.id) === String(review.id));
            if (index !== -1) reviews.value[index] = review;
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /** Deletes the review together with its comment. */
    async function deleteReview(review) {
        try {
            if (review.commentId) await feedbackApi.deleteComment(review.commentId);
            await feedbackApi.deleteReview(review.id);
            reviews.value = reviews.value.filter(item => String(item.id) !== String(review.id));
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    return {
        reviews, tours, users, errors, loaded,
        fetchReviews, getReviewById, getTourTitle, getUserName,
        addReview, updateReview, deleteReview
    };
});

export default useFeedbackStore;