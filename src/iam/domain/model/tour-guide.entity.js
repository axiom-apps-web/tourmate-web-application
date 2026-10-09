import { User } from './user.entity.js';

/**
 * TourGuide entity within the domain model.
 *
 * @class TourGuide
 */
export class TourGuide {

    /**
     * @param {Object} params Entity attributes.
     * @param {?number} [params.id=null] TourGuide identifier.
     * @param {?number} [params.userId=null] Foreign key of the related user.
     * @param {?number} [params.agencyId=null] Foreign key of the related agency.
     * @param {string[]} [params.languages=[]] List of languages spoken by the guide.
     * @param {string} [params.phoneNumber=''] TourGuide phone number.
     * @param {?User} [params.user=null] Optional user entity reference.
     */
    constructor({ id = null, userId = null, agencyId = null, languages = [], phoneNumber = '', user = null }) {
        this.id = id;
        this.userId = userId;
        this.agencyId = agencyId;

        this.languages = Array.isArray(languages) ? [...languages] : [];
        this.phoneNumber = phoneNumber;


        this.user = user instanceof User ? user : null;
    }

}