import { Profile } from "../domain/model/profile.entity.js";

/**
 * Maps monitoring active tour resources into domain entities.
 *
 * @class ProfileAssembler
 */
export class ProfileAssembler {
    /**
     * @param {Object} resource - Active tour resource payload.
     * @returns {Profile} Profile entity.
     */
    static toEntityFromResource(resource) {
        return new Profile({ ...resource });
    }

    /**
     * Parses active tour resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with active tour resources.
     * @returns {Profile[]} Profile entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['profiles'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * Maps a Profile entity into an API resource payload.
     *
     * @param {Profile} entity - Profile entity.
     * @returns {Object} Resource payload.
     */

}