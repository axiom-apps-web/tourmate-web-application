/**
 * Agency entity within the domain model.
 *
 * @class Agency
 */
export class Agency {

    /**
     * @param {Object} params Entity attributes.
     * @param {?number} [params.id=null] Agency identifier.
     * @param {?number} [params.ownerId=null] Foreign key of the related owner.
     * @param {string} [params.businessName=''] Agency business name.
     * @param {string} [params.description=''] Agency description.
     * @param {string} [params.phone=''] Agency contact phone number.
     * @param {string} [params.contactEmail=''] Agency contact email address.
     * @param {string} [params.website=''] Agency website URL.
     * @param {string} [params.address=''] Agency physical address.
     */
    constructor({
                    id = null,
                    ownerId = null,
                    businessName = '',
                    description = '',
                    phone = '',
                    contactEmail = '',
                    website = '',
                    address = ''
                }) {
        this.id = id;
        this.ownerId = ownerId;
        this.businessName = businessName;
        this.description = description;
        this.phone = phone;
        this.contactEmail = contactEmail;
        this.website = website;
        this.address = address;
    }

}