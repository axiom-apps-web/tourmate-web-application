import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const fallbackApiBaseUrl = import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;
const profilesApiBaseUrl = import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;
const profilesEndpointPath = import.meta.env.VITE_PROFILES_ENDPOINT_PATH;


/**
 * Infrastructure gateway for Tour Monitoring bounded-context endpoints.
 *
 * @class ProfileApi
 * @extends BaseApi
 */
export class ProfileApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #profilesEndpoint;


    /** Creates endpoint clients for active tours and participants. */
    constructor() {
        super(profilesApiBaseUrl);
        this.#profilesEndpoint = new BaseEndpoint(this, profilesEndpointPath);

    }

    /**
     * Fetches all active tours.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the active tours' response.
     */
    getProfiles() {
        return this.#profilesEndpoint.getAll();
    }

    /**
     * Fetches an active tour by its ID.
     * @param {number|string} id - The ID of the active tour.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the active tour response.
     */
    getProfileById(id) {
        return this.#profilesEndpoint.getById(id);
    }

    /**
     * Creates an active tour resource.
     * @param {Object} resource - Active tour resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created active tour response.
     */
    createProfile(resource) {
        return this.#profilesEndpoint.create(resource);
    }

    /**
     * Updates an active tour resource.
     * @param {Object} resource - Active tour resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated active tour response.
     */
    updateProfile(resource) {
        return this.#profilesEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes an active tour by its ID.
     * @param {number|string} id - The ID of the active tour to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteProfile(id) {
        return this.#profilesEndpoint.delete(id);
    }


}