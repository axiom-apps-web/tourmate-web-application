import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const activeToursEndpointPath = import.meta.env.VITE_ACTIVE_TOURS_ENDPOINT_PATH;
const participantsEndpointPath = import.meta.env.VITE_PARTICIPANTS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Tour Monitoring bounded-context endpoints.
 *
 * @class TourMonitoringApi
 * @extends BaseApi
 */
export class TourMonitoringApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #activeToursEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #participantsEndpoint;

    /** Creates endpoint clients for active tours and participants. */
    constructor() {
        super();
        this.#activeToursEndpoint = new BaseEndpoint(this, activeToursEndpointPath);
        this.#participantsEndpoint = new BaseEndpoint(this, participantsEndpointPath);
    }

    /**
     * Fetches all active tours.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the active tours' response.
     */
    getActiveTours() {
        return this.#activeToursEndpoint.getAll();
    }

    /**
     * Fetches an active tour by its ID.
     * @param {number|string} id - The ID of the active tour.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the active tour response.
     */
    getActiveTourById(id) {
        return this.#activeToursEndpoint.getById(id);
    }

    /**
     * Creates an active tour resource.
     * @param {Object} resource - Active tour resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created active tour response.
     */
    createActiveTour(resource) {
        return this.#activeToursEndpoint.create(resource);
    }

    /**
     * Updates an active tour resource.
     * @param {Object} resource - Active tour resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated active tour response.
     */
    updateActiveTour(resource) {
        return this.#activeToursEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes an active tour by its ID.
     * @param {number|string} id - The ID of the active tour to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteActiveTour(id) {
        return this.#activeToursEndpoint.delete(id);
    }

    /**
     * Fetches all participants.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the participants' response.
     */
    getParticipants() {
        return this.#participantsEndpoint.getAll();
    }

    /**
     * Fetches a participant by its ID.
     * @param {number|string} id - The ID of the participant.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the participant response.
     */
    getParticipantById(id) {
        return this.#participantsEndpoint.getById(id);
    }

    /**
     * Creates a participant resource.
     * @param {Object} resource - Participant resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created participant response.
     */
    createParticipant(resource) {
        return this.#participantsEndpoint.create(resource);
    }

    /**
     * Updates a participant resource.
     * @param {Object} resource - Participant resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated participant response.
     */
    updateParticipant(resource) {
        return this.#participantsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a participant by its ID.
     * @param {number|string} id - The ID of the participant to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteParticipant(id) {
        return this.#participantsEndpoint.delete(id);
    }
}