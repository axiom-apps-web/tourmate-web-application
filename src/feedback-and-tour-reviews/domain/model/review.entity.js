/**
 * Review entity: the rating and comment a traveler leaves about a tour.
 *
 * @class Review
 */
export class Review {
    /**
     * @param {Object} params
     * @param {?number} params.id - Review identifier.
     * @param {?number} params.userId - Traveler who wrote the review.
     * @param {?number} params.tourId - Tour being reviewed.
     * @param {number} params.rating - Stars from 1 to 5.
     * @param {string} params.createdAt - ISO date of publication.
     * @param {string} params.comment - Written comment (stored in the comments resource).
     * @param {?number} params.commentId - Identifier of the stored comment, if any.
     */
    constructor({ id = null, userId = null, tourId = null, rating = 0, createdAt = '', comment = '', commentId = null } = {}) {
        this.id = id;
        this.userId = userId;
        this.tourId = tourId;
        this.rating = rating;
        this.createdAt = createdAt;
        this.comment = comment;
        this.commentId = commentId;
    }
}