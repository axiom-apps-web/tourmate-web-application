/**
 *
 * @class TourSchedule
 */

export class TourSchedule {

    /**
     * @param {Object} params
     * @param {?number} [params.id=null]
     * @param {?number} [params.tourId=null]
     * @param {string} [params.departureDateTime='']
     * @param {number} [params.maxCapacity=0]
     * @param {string} [params.status='']
     */

    constructor({
        id = null,
        tourId = null,
        departureDateTime = '',
        maxCapacity = 0,
        status = '',
                }) {
        this.id = id;
        this.tourId = tourId;
        this.departureDateTime = departureDateTime;
        this.maxCapacity = maxCapacity;
        this.status = status;
    }
}