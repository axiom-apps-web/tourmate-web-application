export class IncidentResource {
    constructor({ id = null, uuid = '', activeTourId = null, reportedByUserId = null, description = '', latitude = 0, longitude = 0, reportedAt = '', status = 'OPEN' }) {
        this.id = id;
        this.uuid = uuid;
        this.activeTourId = activeTourId;
        this.reportedByUserId = reportedByUserId;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.reportedAt = reportedAt;
        this.status = status;
    }
}