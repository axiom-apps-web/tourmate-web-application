/**
 * Application service store for the Safety and Incident Management bounded context.
 * Coordinates incident use cases and keeps UI-facing state using Pinia.
 *
 * @module useIncidentStore
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { IncidentApi } from "../infrastructure/incident-api.js";
import { IncidentAssembler } from "../infrastructure/incident-assembler.js";
import { Incident } from "../domain/model/incident.entity.js";

const incidentApi = new IncidentApi();

export const useIncidentStore = defineStore('incident', () => {
    /**
     * List of incident entities.
     * @type {import('vue').Ref<Incident[]>}
     */
    const incidents = ref([]);

    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /**
     * Whether incidents have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const incidentsLoaded = ref(false);

    /**
     * Number of loaded incidents.
     * @type {import('vue').ComputedRef<number>}
     */
    const incidentsCount = computed(() => {
        return incidentsLoaded.value ? incidents.value.length : 0;
    });

    /**
     * Loads incidents from infrastructure and updates application state.
     * @returns {void}
     */
    async function fetchIncidents() {
        try {
            const response = await incidentApi.getIncidents()
            incidents.value = IncidentAssembler.toEntitiesFromResponse(response);
            incidentsLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Finds an incident entity by identifier.
     * @param {number|string} id - Incident identifier.
     * @returns {Incident|undefined} Matching incident, if available.
     */
    function getIncidentById(id) {
        let idNum = parseInt(id);
        return incidents.value.find(incident => incident.id === idNum);
    }

    /**
     * Creates an incident through infrastructure and appends it to local state.
     * @param {Incident} incident - Incident entity to persist.
     * @returns {void}
     */
    async function addIncident(incident) {
        try {
            const response = await incidentApi.createIncident(incident)
            const resource = response.data;
            const newIncident = IncidentAssembler.toEntityFromResource(resource);
            incidents.value.push(newIncident);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Updates an existing incident and synchronizes local state.
     * @param {Incident} incident - Incident entity with updated data.
     * @returns {void}
     */
    async function updateIncident(incident) {
        try {
            const response = await incidentApi.updateIncident(incident)
            const resource = response.data;
            const updatedIncident = IncidentAssembler.toEntityFromResource(resource);
            const index = incidents.value.findIndex(i => i.id === updatedIncident.id);
            if (index !== -1) incidents.value[index] = updatedIncident;
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Resolves an incident using domain logic and updates it.
     * @param {Incident} incident - Incident entity to resolve.
     * @returns {void}
     */
    async function resolveIncident(incident) {
        const resolvedIncident = new Incident({...incident});
        resolvedIncident.resolve();
        return updateIncident(resolvedIncident);
    }

    /**
     * Deletes an incident and removes it from local state.
     * @param {Incident} incident - Incident entity to remove.
     * @returns {void}
     */
    async function deleteIncident(incident) {
        try {
            await incidentApi.deleteIncident(incident.id)
            const index = incidents.value.findIndex(i => i.id === incident.id);
            if (index !== -1) incidents.value.splice(index, 1);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    return {
        incidents,
        errors,
        incidentsLoaded,
        incidentsCount,
        fetchIncidents,
        getIncidentById,
        addIncident,
        updateIncident,
        resolveIncident,
        deleteIncident
    };
});

export default useIncidentStore;