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
     * @param {string} [params.email=''] User email address.
     * @param {?UserRole} [params.role=null] User role reference.
     * @param {string} [params.firstName=''] User first name.
     * @param {string} [params.lastName=''] User last name.
     */
    constructor({ id = null, email = '', role = null, firstName = '', lastName = '' }) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;


        this.role = role;
    }

}