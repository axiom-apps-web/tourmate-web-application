import { UserRole } from './value-object/user-role.js';

/**
 * User entity within the domain model.
 *
 * @class User
 */
export class User {

    /**
     * @param {Object} params Entity attributes.
     * @param {?number} [params.id=null] User identifier.

     * @param {?UserRole} [params.role=null] User role reference.

     */
    constructor({ id = null, userName = '',passwordHash = '', role = null,  }) {
        this.id = id;
        this.userName = userName;
        this.passwordHash = passwordHash;

        this.role = role;
    }

}