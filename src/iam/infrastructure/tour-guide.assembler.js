import { TourGuide } from '../domain/model/tour-guide.entity.js';

/**
 * Maps tour guide resources into domain entities.
 *
 * @class TourGuideAssembler
 */
export class TourGuideAssembler {
    /**
     * Maps a resource payload to a TourGuide entity.
     *
     * @param {Object} resource TourGuide resource payload.
     * @returns {TourGuide} TourGuide entity.
     */
    static toEntityFromResource(resource) {
        return new TourGuide({ ...resource });
    }

    /**
     * Maps a TourGuide entity back to a resource payload.
     *
     * @param {TourGuide} entity TourGuide entity.
     * @returns {Object} TourGuide resource payload.
     */


    /**
     * Parses tour guide resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response HTTP response with tour guide resources.
     * @returns {TourGuide[]} TourGuide entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }


        let resources = response.data instanceof Array ? response.data : response.data['tourGuides'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}