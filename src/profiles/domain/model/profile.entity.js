export class Profile {

    /**
     * @param {Object} params Entity attributes.
     * @param {?number} [params.id=null] Profile identifier.
     * @param {string} [params.email=''] Profile email address.
     * @param {string} [params.firstName=''] Profile first name.
     * @param {string} [params.lastName=''] Profile last name.
     */
    constructor({ id = null, email = '', firstName = '', lastName = '' }) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;

    }

}