export class IncidentId {
    #value;

    constructor(value) {
        this.#value = value;
    }

    get value() {
        return this.#value;
    }

    getStringValue() {
        return this.#value;
    }

    equals(other) {
        if (!other) return false;
        return this.#value === other.value;
    }

    static generate() {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        return new IncidentId(uuid);
    }
}

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

export class IncidentsResponse {
    constructor(data) {
        this.incidents = Array.isArray(data) ? data.map(item => new IncidentResource(item)) : [];
    }
}