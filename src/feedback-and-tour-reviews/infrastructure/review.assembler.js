import { Review } from "../domain/model/review.entity.js";

/**
 * Converts API resources (reviews + comments) into Review entities and back.
 *
 * @class ReviewAssembler
 */
export class ReviewAssembler {
    /**
     * @param {Object} resource - Review resource from the API.
     * @param {Array<Object>} comments - Comment resources from the API.
     * @returns {Review}
     */
    static toEntityFromResource(resource, comments = []) {
        const comment = comments.find(item => item.reviewId === resource.id);
        return new Review({
            ...resource,
            comment: comment ? comment.content : '',
            commentId: comment ? comment.id : null
        });
    }

    /**
     * @param {import('axios').AxiosResponse} reviewsResponse
     * @param {import('axios').AxiosResponse} commentsResponse
     * @returns {Array<Review>}
     */
    static toEntitiesFromResponse(reviewsResponse, commentsResponse) {
        if (reviewsResponse.status !== 200) {
            console.error(`${reviewsResponse.status}, ${reviewsResponse.statusText}`);
            return [];
        }
        const comments = commentsResponse.status === 200 ? commentsResponse.data : [];
        return reviewsResponse.data.map(resource => this.toEntityFromResource(resource, comments));
    }

    /**
     * @param {Review} review
     * @returns {Object} Resource for the reviews endpoint.
     */
    static toReviewResource(review) {
        return {
            userId: review.userId,
            tourId: review.tourId,
            rating: review.rating,
            createdAt: review.createdAt
        };
    }

    /**
     * @param {Review} review
     * @param {number} reviewId - Identifier of the review the comment belongs to.
     * @returns {Object} Resource for the comments endpoint.
     */
    static toCommentResource(review, reviewId) {
        return {
            reviewId: reviewId,
            content: review.comment.trim(),
            createdAt: review.createdAt
        };
    }
}