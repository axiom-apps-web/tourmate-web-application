export class Profile {

    /**
     * @param {Object} params Entity attributes.
     * @param {?number} [params.id=null] Profile identifier.
     * @param {string} [params.email=''] Profile email address.
     * @param {string} [params.firstName=''] Profile first name.
     * @param {string} [params.lastName=''] Profile last name.
     * @param {string} [params.fullName=''] Profile full name.
     * @param {string} [params.streetAddress=''] Profile street address.
     */
    constructor({ id = null, userId = null, email = '', firstName = '', lastName = '', fullName = '', streetAddress = '' }) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.streetAddress = streetAddress;

    }

}