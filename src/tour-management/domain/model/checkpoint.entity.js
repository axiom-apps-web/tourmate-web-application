/**
 * Checkpoint defined along a tour route.
 */
export class Checkpoint {
    constructor({
        id = null,
        tourId = null,
        name = '',
        latitude = null,
        longitude = null,
        orderIndex = 0,
        description = ''
    }) {
        this.id = id;
        this.tourId = tourId;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.orderIndex = orderIndex;
        this.description = description;
    }
}
