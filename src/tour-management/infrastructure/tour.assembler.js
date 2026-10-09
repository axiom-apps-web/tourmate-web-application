/**
 *
 * @class TourAssembler
 */
import {Tour} from "../domain/model/tour.entity.js";

export class TourAssembler {

    /**
     *
     * @param {Object} resource
     * @returns {Tour}
     */

    static toEntityFromResource(resource) {
        return new Tour({...resource});
    }

    /**
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response
     * @returns {Tour[]}
     */

    static toEntitiesFromResponse(response) {
        if(response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        let resources = response.data instanceof Array ? response.data : response.data['tours'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}