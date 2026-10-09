import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const toursEndpointPath = import.meta.env.VITE_TOURS_ENDPOINT_PATH
const tourSchedulesEndpointPath = import.meta.env.VITE_TOUR_SCHEDULES_ENDPOINT_PATH

/**
 *
 * @class TourManagementApi
 * @extends BaseApi
 */

export class TourManagementApi extends BaseApi {

    /**
     * @type {BaseEndpoint}
     * @private
     */
    #toursEndpoint

    /**
     * @type {BaseEndpoint}
     * @private
     */
    #tourSchedulesEndpoint


    constructor() {
        super();
        this.#toursEndpoint = new BaseEndpoint(this, toursEndpointPath);
        this.#tourSchedulesEndpoint = new BaseEndpoint(this, tourSchedulesEndpointPath);
    }

    getTours() {
        return this.#toursEndpoint.getAll()
    }

    getTourById(id) {
        return this.#toursEndpoint.getById(id)
    }

    createTour(resource) {
        return this.#toursEndpoint.create(resource)
    }

    updateTour(resource) {
        return this.#toursEndpoint.update(resource.id, resource)
    }

    deleteTour(id) {
        return this.#toursEndpoint.delete(id)
    }

    getTourSchedules() {
        return this.#tourSchedulesEndpoint.getAll()
    }

    getTourScheduleById(id) {
        return this.#tourSchedulesEndpoint.getById(id)
    }

    createTourSchedule(resource) {
        return this.#tourSchedulesEndpoint.create(resource)
    }

    updateTourSchedule(resource) {
        return this.#tourSchedulesEndpoint.update(resource.id, resource)
    }

    deleteTourSchedule(id) {
        return this.#tourSchedulesEndpoint.delete(id)
    }
}