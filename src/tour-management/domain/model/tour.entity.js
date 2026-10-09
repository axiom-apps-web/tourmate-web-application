/**
 *
 * @class Tour
 */

export class Tour {
    /**
     *
     * @param {Object} params
     * @param {?number} [params.id=null]
     * @param {?number} [params.agencyId=null]
     * @param {string} [params.title='']
     * @param {string} [params.description='']
     * @param {string} [params.duration='']
     * @param {string} [params.difficulty='']
     * @param {number} [params.priceAmount=0.0]
     * @param {string} [params.priceCurrency='']
     * @param {string} [params.status='']
     */


    constructor(
        {
            id = null,
            agencyId = null,
            title = '',
            description = '',
            duration = '',
            difficulty = '',
            priceAmount = 0.0,
            priceCurrency= '',
            status= ''}) {

        this.id = id;
        this.agencyId = agencyId;
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.difficulty = difficulty;
        this.priceAmount = priceAmount;
        this.priceCurrency = priceCurrency;
        this.status = status;
    }
}