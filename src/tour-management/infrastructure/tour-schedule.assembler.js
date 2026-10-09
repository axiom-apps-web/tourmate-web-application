/**
 *
 * @class TourScheduleAssembler
 */
import { TourSchedule} from "../domain/model/tour-schedule.entity.js";

export class TourScheduleAssembler {

    /**
     *
     * @param {Object} resource
     * @returns {TourSchedule}
     */

    static toEntityFromResource(resource) {
        return new TourSchedule({...resource});
    }

    /**
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response
     * @returns {TourSchedule[]}
     */

    static toEntitiesFromResponse(response) {
        if(response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        let resources = response.data instanceof Array ? response.data : response.data['tour-schedules'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}