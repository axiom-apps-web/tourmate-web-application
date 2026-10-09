import { Participant } from "../domain/model/participant.entity.js";

/**
 * Maps learning participant resources into domain entities.
 *
 * @class ParticipantAssembler
 */
export class ParticipantAssembler {
    /**
     * @param {Object} resource - Participant resource payload.
     * @returns {Participant} Participant entity.
     */
    static toEntityFromResource(resource) {
        return new Participant({ ...resource });
    }

    /**
     * Parses participant resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with participant resources.
     * @returns {Participant[]} Participant entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['participants'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * Maps a Participant entity into an API resource payload.
     *
     * @param {Participant} entity - Participant entity.
     * @returns {Object} Resource payload.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            userId: entity.userId,
            joinedAt: entity.joinedAt,
            tourScheduleId: entity.tourScheduleId
        };
    }
}