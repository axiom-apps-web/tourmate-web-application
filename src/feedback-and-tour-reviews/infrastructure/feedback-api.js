import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const fallbackApiBaseUrl = import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;
const reviewsApiBaseUrl = import.meta.env.VITE_REVIEWS_API_URL || fallbackApiBaseUrl;
const commentsApiBaseUrl = import.meta.env.VITE_COMMENTS_API_URL || fallbackApiBaseUrl;
const toursApiBaseUrl = import.meta.env.VITE_TOURS_API_URL || fallbackApiBaseUrl;
const usersApiBaseUrl = import.meta.env.VITE_USER_API_URL || fallbackApiBaseUrl;
const reviewsEndpointPath  = import.meta.env.VITE_REVIEWS_ENDPOINT_PATH  || '/reviews';
const commentsEndpointPath = import.meta.env.VITE_COMMENTS_ENDPOINT_PATH || '/comments';
const toursEndpointPath    = import.meta.env.VITE_TOURS_ENDPOINT_PATH    || '/tours';
const usersEndpointPath    = import.meta.env.VITE_USERS_ENDPOINT_PATH    || '/users';

/**
 * API client of the Feedback and Tour Reviews bounded context.
 *
 * @class FeedbackApi
 * @extends BaseApi
 */
export class FeedbackApi extends BaseApi {
    #reviewsEndpoint;
    #commentsEndpoint;
    #toursEndpoint;
    #usersEndpoint;

    constructor() {
        super(reviewsApiBaseUrl);
        this.#reviewsEndpoint  = new BaseEndpoint(this, reviewsEndpointPath);
        this.#commentsEndpoint = new BaseEndpoint(
            new BaseApi(commentsApiBaseUrl),
            commentsEndpointPath
        );
        this.#toursEndpoint    = new BaseEndpoint(new BaseApi(toursApiBaseUrl), toursEndpointPath);
        this.#usersEndpoint    = new BaseEndpoint(new BaseApi(usersApiBaseUrl), usersEndpointPath);
    }

    getReviews()                { return this.#reviewsEndpoint.getAll(); }
    createReview(resource)      { return this.#reviewsEndpoint.create(resource); }
    updateReview(id, resource)  { return this.#reviewsEndpoint.update(id, resource); }
    deleteReview(id)            { return this.#reviewsEndpoint.delete(id); }

    getComments()               { return this.#commentsEndpoint.getAll(); }
    createComment(resource)     { return this.#commentsEndpoint.create(resource); }
    updateComment(id, resource) { return this.#commentsEndpoint.update(id, resource); }
    deleteComment(id)           { return this.#commentsEndpoint.delete(id); }

    getTours()                  { return this.#toursEndpoint.getAll(); }
    getUsers()                  { return this.#usersEndpoint.getAll(); }
}