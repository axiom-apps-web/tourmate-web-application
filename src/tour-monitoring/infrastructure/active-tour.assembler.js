import { ActiveTour } from "../domain/model/active-tour.entity.js";

/**
 * Maps monitoring active tour resources into domain entities.
 *
 * @class ActiveTourAssembler
 */
export class ActiveTourAssembler {
    /**
     * @param {Object} resource - Active tour resource payload.
     * @returns {ActiveTour} ActiveTour entity.
     */
    static toEntityFromResource(resource) {
        return new ActiveTour({ ...resource });
    }

    /**
     * Parses active tour resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with active tour resources.
     * @returns {ActiveTour[]} ActiveTour entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['activeTours'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * Maps an ActiveTour entity into an API resource payload.
     *
     * @param {ActiveTour} entity - ActiveTour entity.
     * @returns {Object} Resource payload.
     */

}