import { User } from '../domain/model/user.entity.js';
import { UserRole } from '../domain/model/value-object/user-role.js';

/**
 * Maps user resources into domain entities.
 *
 * @class UserAssembler
 */
export class UserAssembler {
    /**
     * Maps a resource payload to a User entity.
     *
     * @param {Object} resource User resource payload.
     * @returns {User} User entity.
     */
    static toEntityFromResource(resource) {

        if (!Object.values(UserRole).includes(resource.role)) {
            throw new Error(`Unsupported user role: ${resource.role}`);
        }


        return new User({ ...resource });
    }

    /**
     * Maps a user entity back to a resource payload.
     *
     * @param {User} entity User entity.
     * @returns {Object} User resource payload.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            email: entity.email,
            role: entity.role,
            firstName: entity.firstName,
            lastName: entity.lastName,
        };
    }

    /**
     * Parses user resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response HTTP response with user resources.
     * @returns {User[]} User entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        
        let resources = response.data instanceof Array ? response.data : response.data['users'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}