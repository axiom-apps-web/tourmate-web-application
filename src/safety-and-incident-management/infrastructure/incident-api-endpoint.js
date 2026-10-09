import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";
import {IncidentAssembler} from "./incident-assembler.js";

const incidentsApiBaseUrl = import.meta.env.VITE_INCIDENTS_API_BASE_URL || import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;

export class IncidentApiEndpoint extends BaseEndpoint {
    constructor(baseApi) {
        super(baseApi, `${incidentsApiBaseUrl}/incidents`);
        this.assembler = new IncidentAssembler();
    }
}