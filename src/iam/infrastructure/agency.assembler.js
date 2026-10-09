import { Agency } from '../domain/model/agency.entity.js';

/**
 * Maps agency resources into domain entities.
 *
 * @class AgencyAssembler
 */
export class AgencyAssembler {
    /**
     * Maps a resource payload to an Agency entity.
     *
     * @param {Object} resource Agency resource payload.
     * @returns {Agency} Agency entity.
     */
    static toEntityFromResource(resource) {
        return new Agency({ ...resource });
    }

    /**
     * Maps an Agency entity back to a resource payload.
     *
     * @param {Agency} entity Agency entity.
     * @returns {Object} Agency resource payload.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            ownerId: entity.ownerId,
            businessName: entity.businessName,
            description: entity.description,
            phone: entity.phone,
            contactEmail: entity.contactEmail,
            website: entity.website,
            address: entity.address,
        };
    }

    /**
     * Parses agency resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response HTTP response with agency resources.
     * @returns {Agency[]} Agency entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }


        let resources = response.data instanceof Array ? response.data : response.data['agencies'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}