import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const fallbackApiBaseUrl = import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;
const usersApiBaseUrl = import.meta.env.VITE_USER_API_URL || fallbackApiBaseUrl;
const agenciesApiBaseUrl = import.meta.env.VITE_AGENCIES_API_URL || fallbackApiBaseUrl;
const tourGuidesApiBaseUrl = import.meta.env.VITE_TOUR_GUIDES_API_URL || fallbackApiBaseUrl;
const usersEndpointPath      = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const agenciesEndpointPath   = import.meta.env.VITE_AGENCIES_ENDPOINT_PATH;
const tourGuidesEndpointPath = import.meta.env.VITE_TOUR_GUIDES_ENDPOINT_PATH;

/**
 * Infrastructure gateway for IAM bounded-context endpoints.
 *
 * @class IamApi
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #usersEndpoint;

    /**
     * @type {BaseEndpoint}
     * @private
     */
    #agenciesEndpoint;

    /**
     * @type {BaseEndpoint}
     * @private
     */
    #tourGuidesEndpoint;

    /** Creates endpoint clients for users, agencies, and tour guides. */
    constructor() {
        super(usersApiBaseUrl);
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
        this.#agenciesEndpoint = new BaseEndpoint(
            new BaseApi(agenciesApiBaseUrl),
            agenciesEndpointPath
        );
        this.#tourGuidesEndpoint = new BaseEndpoint(
            new BaseApi(tourGuidesApiBaseUrl),
            tourGuidesEndpointPath
        );
    }

    // --- Users ---

    /**
     * Fetches all users.
     *
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the users' response.
     */
    getUsers() {
        return this.#usersEndpoint.getAll();
    }

    /**
     * Fetches a user by its ID.
     *
     * @param {number|string} id The ID of the user.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the user response.
     */
    getUserById(id) {
        return this.#usersEndpoint.getById(id);
    }

    /**
     * Creates a user resource.
     *
     * @param {Object} resource User resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created user response.
     */
    createUser(resource) {
        return this.#usersEndpoint.create(resource);
    }

    /**
     * Updates a user resource.
     *
     * @param {Object} resource User resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated user response.
     */
    updateUser(resource) {
        return this.#usersEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a user by its ID.
     *
     * @param {number|string} id The ID of the user to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteUser(id) {
        return this.#usersEndpoint.delete(id);
    }

    // --- Agencies ---

    /**
     * Fetches all agencies.
     *
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the agencies' response.
     */
    getAgencies() {
        return this.#agenciesEndpoint.getAll();
    }

    /**
     * Fetches an agency by its ID.
     *
     * @param {number|string} id The ID of the agency.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the agency response.
     */
    getAgencyById(id) {
        return this.#agenciesEndpoint.getById(id);
    }

    /**
     * Creates an agency resource.
     *
     * @param {Object} resource Agency resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created agency response.
     */
    createAgency(resource) {
        return this.#agenciesEndpoint.create(resource);
    }

    /**
     * Updates an agency resource.
     *
     * @param {Object} resource Agency resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated agency response.
     */
    updateAgency(resource) {
        return this.#agenciesEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes an agency by its ID.
     *
     * @param {number|string} id The ID of the agency to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteAgency(id) {
        return this.#agenciesEndpoint.delete(id);
    }

    // --- Tour Guides ---

    /**
     * Fetches all tour guides.
     *
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the tour guides' response.
     */
    getTourGuides() {
        return this.#tourGuidesEndpoint.getAll();
    }

    /**
     * Fetches a tour guide by its ID.
     *
     * @param {number|string} id The ID of the tour guide.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the tour guide response.
     */
    getTourGuideById(id) {
        return this.#tourGuidesEndpoint.getById(id);
    }

    /**
     * Creates a tour guide resource.
     *
     * @param {Object} resource TourGuide resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created tour guide response.
     */
    createTourGuide(resource) {
        return this.#tourGuidesEndpoint.create(resource);
    }

    /**
     * Updates a tour guide resource.
     *
     * @param {Object} resource TourGuide resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated tour guide response.
     */
    updateTourGuide(resource) {
        return this.#tourGuidesEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a tour guide by its ID.
     *
     * @param {number|string} id The ID of the tour guide to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteTourGuide(id) {
        return this.#tourGuidesEndpoint.delete(id);
    }
}