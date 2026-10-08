//import { TourSchedule } from "./tour-schedule.entity.js";


import {TourGuide} from "../../../iam/domain/model/tour-guide.entity.js";
import {TourSchedule} from "../../../tour-management/domain/model/tour-schedule.entity.js";

/**
 * ActiveTour entity within the Monitoring bounded context.
 *
 * @class ActiveTour
 */
export class ActiveTour {

    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Active tour identifier.
     * @param {?number} [params.tourScheduleId=null] - Foreign key of the related tour schedule.
     * @param {?number} [params.guideId=null] - Foreign key of the assigned guide.
     * @param {string} [params.status=''] - Current status of the active tour.
     * @param {?number} [params.currentLatitude=null] - Latest reported latitude.
     * @param {?number} [params.currentLongitude=null] - Latest reported longitude.
     * @param {string} [params.startedAt=''] - Start date/time of the tour.
     * @param {?string} [params.finishedAt=null] - End date/time of the tour, null while in progress.
     * @param {?TourSchedule} [params.tourSchedule=null] - Optional tour schedule entity reference.
     * @param {?TourGuide} [params.guide=null] - Optional guide entity reference.
     */
    constructor({
                    id = null,
                    tourScheduleId = null,
                    guideId = null,
                    status = '',
                    currentLatitude = null,
                    currentLongitude = null,
                    startedAt = '',
                    finishedAt = null,
                    tourSchedule = null,
                    guide = null
                }) {
        this.id = id;
        this.tourScheduleId = tourScheduleId;
        this.guideId = guideId;
        this.status = status;
        this.currentLatitude = currentLatitude;
        this.currentLongitude = currentLongitude;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
        this.tourSchedule = tourSchedule instanceof TourSchedule ? tourSchedule : null;
        this.guide = guide instanceof TourGuide ? guide : null;
    }

}