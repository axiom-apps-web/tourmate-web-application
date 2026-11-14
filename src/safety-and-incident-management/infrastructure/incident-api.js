import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const incidentsEndpointPath = import.meta.env.VITE_INCIDENTS_ENDPOINT_PATH || '/incidents';
const incidentsApiBaseUrl =
    import.meta.env.VITE_INCIDENTS_API_URL ||
    import.meta.env.VITE_INCIDENTS_API_BASE_URL ||
    import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;

export class IncidentApi extends BaseApi {
    #incidentsEndpoint;

    constructor() {
        super(incidentsApiBaseUrl);
        this.#incidentsEndpoint = new BaseEndpoint(this, incidentsEndpointPath);
    }

    getIncidents() {
        return this.#incidentsEndpoint.getAll();
    }

    getIncidentById(id) {
        return this.#incidentsEndpoint.getById(id);
    }

    createIncident(resource) {
        return this.#incidentsEndpoint.create(resource);
    }

    updateIncident(resource) {
        return this.#incidentsEndpoint.update(resource.id, resource);
    }

    deleteIncident(id) {
        return this.#incidentsEndpoint.delete(id);
    }
}