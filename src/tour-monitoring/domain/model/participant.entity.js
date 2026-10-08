import {User} from "../../../iam/domain/model/user.entity.js";


/**
 * Participant entity within the Learning bounded context.
 *
 * @class Participant
 */
export class Participant {

    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Participant identifier.
     * @param {?number} [params.userId=null] - Foreign key of the related user.
     * @param {string} [params.joinedAt=''] - Date/time when the participant joined the tour.
     * @param {?number} [params.tourScheduleId=null] - Foreign key of the related tour schedule.
     * @param {?TourSchedule} [params.tourSchedule=null] - Optional tour schedule entity reference.
     * @param {?User} [params.user=null] - Optional user entity reference.
     */
    constructor({
                    id = null,
                    userId = null,
                    joinedAt = '',
                    tourScheduleId = null,
                    tourSchedule = null,
                    user = null
                }) {
        this.id = id;
        this.userId = userId;
        this.joinedAt = joinedAt;
        this.tourScheduleId = tourScheduleId;
        this.tourSchedule = tourSchedule instanceof TourSchedule ? tourSchedule : null;
        this.user = user instanceof User ? user : null;
    }

}