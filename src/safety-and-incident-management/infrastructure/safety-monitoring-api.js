import { BaseApi } from "../../shared/infrastructure/base-api.js";

const incidentsApiBaseUrl =  import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;

export class SafetyMonitoringApi extends BaseApi {
    constructor() {
        super(incidentsApiBaseUrl);
    }

    async getSafetyData() {
        try {
            const response = await this.http.get('/locations');
            const rows = response.data || [];
            return {
                locations: rows
                    .map(row => this.#mapLocation(row))
                    .filter(location => location !== null),
                alerts: this.#readStoredRecords(rows, 'alerts'),
                telemetry: this.#readStoredRecords(rows, 'telemetry'),
                wearables: this.#readStoredRecords(rows, 'wearables')
            };
        } catch (error) {
            console.error('Error loading safety monitoring data', error);
            throw error;
        }
    }

    async createLocation(location) {
        const payload = {
            ...location,
            latitude: String(location.latitude),
            longitude: String(location.longitude),
            expectedLatitude: location.expectedLatitude !== undefined ? String(location.expectedLatitude) : '',
            expectedLongitude: location.expectedLongitude !== undefined ? String(location.expectedLongitude) : '',
            alerts: '',
            telemetry: '',
            wearables: ''
        };
        const response = await this.http.post('/locations', payload);
        const created = this.#mapLocation(response.data);
        if (!created) throw new Error('API returned an invalid location record');
        return created;
    }

    async updateLocation(location) {
        const { id, ...locationData } = location;
        const existingRes = await this.http.get(`/locations/${id}`);
        const { id: _rowId, ...existing } = existingRes.data;
        const payload = {
            ...existing,
            ...locationData,
            latitude: String(location.latitude),
            longitude: String(location.longitude),
            expectedLatitude: location.expectedLatitude !== undefined ? String(location.expectedLatitude) : '',
            expectedLongitude: location.expectedLongitude !== undefined ? String(location.expectedLongitude) : ''
        };
        const response = await this.http.put(`/locations/${id}`, payload);
        const saved = this.#mapLocation(response.data);
        if (!saved) throw new Error('API returned an invalid location record');
        return saved;
    }

    async createAlert(alert) {
        return this.#createStoredRecord('alerts', alert);
    }

    async updateAlert(alert) {
        return this.#updateStoredRecord('alerts', alert);
    }

    async createTelemetry(record) {
        return this.#createStoredRecord('telemetry', record);
    }

    async updateTelemetry(record) {
        return this.#updateStoredRecord('telemetry', record);
    }

    async createWearable(wearable) {
        return this.#createStoredRecord('wearables', wearable);
    }

    async updateWearable(wearable) {
        return this.#updateStoredRecord('wearables', wearable);
    }

    async deleteWearable(id) {
        return this.http.delete(`/locations/${id}`);
    }

    async #createStoredRecord(field, record) {
        const storageRow = {
            expeditionId: 0,
            touristId: 0,
            latitude: '',
            longitude: '',
            recordedAt: new Date().toISOString(),
            expectedLatitude: '',
            expectedLongitude: '',
            alerts: field === 'alerts' ? JSON.stringify(record) : '',
            telemetry: field === 'telemetry' ? JSON.stringify(record) : '',
            wearables: field === 'wearables' ? JSON.stringify(record) : ''
        };
        const response = await this.http.post('/locations', storageRow);
        return this.#parseStoredRecord(response.data, field);
    }

    async #updateStoredRecord(field, record) {
        const id = record.id;
        const rowRes = await this.http.get(`/locations/${id}`);
        const row = rowRes.data;
        const payload = {
            ...row,
            [field]: JSON.stringify(record)
        };
        delete payload.id;
        const response = await this.http.put(`/locations/${id}`, payload);
        return this.#parseStoredRecord(response.data, field);
    }

    #readStoredRecords(rows, field) {
        return rows
            .map(row => this.#parseStoredRecord(row, field))
            .filter(record => record !== null);
    }

    #parseStoredRecord(row, field) {
        const serialized = row[field];
        if (!serialized) return null;
        try {
            const record = JSON.parse(serialized);
            if (!record || typeof record !== 'object') return null;
            const message = record.message;
            return {
                ...record,
                ...(field === 'alerts' && typeof message === 'string' && message.startsWith('safety.')
                    ? { message: `incidents.${message}` }
                    : {}),
                id: row.id
            };
        } catch {
            return null;
        }
    }

    #mapLocation(row) {
        if (row.latitude === undefined || row.longitude === undefined || row.expeditionId === undefined || row.touristId === undefined || !row.recordedAt) {
            return null;
        }
        const latitude = this.#parseCoordinate(row.latitude);
        const longitude = this.#parseCoordinate(row.longitude);
        if (latitude === null || longitude === null) return null;
        const expectedLatitude = row.expectedLatitude === undefined || row.expectedLatitude === '' ? undefined : this.#parseCoordinate(row.expectedLatitude);
        const expectedLongitude = row.expectedLongitude === undefined || row.expectedLongitude === '' ? undefined : this.#parseCoordinate(row.expectedLongitude);
        return {
            id: row.id,
            ...(row.incidentId !== undefined ? { incidentId: Number(row.incidentId) } : {}),
            expeditionId: Number(row.expeditionId),
            touristId: Number(row.touristId),
            latitude,
            longitude,
            recordedAt: row.recordedAt,
            ...(expectedLatitude !== undefined ? { expectedLatitude } : {}),
            ...(expectedLongitude !== undefined ? { expectedLongitude } : {})
        };
    }

    #parseCoordinate(value) {
        const coordinate = typeof value === 'string' && value.trim() ? Number(value) : value;
        return typeof coordinate === 'number' && Number.isFinite(coordinate) ? coordinate : null;
    }
}