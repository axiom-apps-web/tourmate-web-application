import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { IncidentApi } from "../infrastructure/incident-api.js";
import { IncidentAssembler } from "../infrastructure/incident-assembler.js";
import { Incident } from "../domain/model/incident.entity.js";
import { IncidentStatus } from "../domain/value-objects/incident-status.js";

const incidentApi = new IncidentApi();
const OFFLINE_STORAGE_KEY = 'tourmate_offline_incidents';

export const useIncidentStore = defineStore('incident', () => {
    const loadFromStorage = () => {
        try {
            const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
            if (!raw) return [];
            return JSON.parse(raw).map(item => new Incident(item));
        } catch (e) {
            console.error('Error loading incidents from localStorage', e);
            return [];
        }
    };

    const saveToStorage = (incidentsList) => {
        try {
            const resources = incidentsList.map(incident => ({
                id: incident.id,
                uuid: incident.uuid,
                activeTourId: incident.activeTourId,
                reportedByUserId: incident.reportedByUserId,
                description: incident.description,
                latitude: incident.latitude,
                longitude: incident.longitude,
                reportedAt: incident.reportedAt,
                status: incident.status,
                severity: incident.severity,
                isSynced: incident.isSynced,
                resolutionNote: incident.resolutionNote,
                reporterRole: incident.reporterRole,
            }));
            localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(resources));
        } catch (e) {
            console.error('Error saving incidents to localStorage', e);
        }
    };

    const incidents = ref(loadFromStorage());
    const loading = ref(false);
    const errors = ref([]);
    const syncing = ref(false);
    const incidentsLoaded = ref(false);

    let syncRetryTimer = null;
    let syncRetryAttempts = 0;

    const incidentsCount = computed(() => incidents.value.length);

    const pendingSyncIncidents = computed(() =>
        incidents.value.filter(inc => !inc.isSynced)
    );

    // Listener de conectividad online
    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            syncRetryAttempts = 0;
            if (syncRetryTimer) clearTimeout(syncRetryTimer);
            syncOfflineIncidents();
        });
    }

    async function fetchIncidents() {
        loading.value = true;
        try {
            const response = await incidentApi.getIncidents();
            const remoteIncidents = IncidentAssembler.toEntitiesFromResponse(response).map(
                inc => new Incident({ ...inc, isSynced: true })
            );

            const pendingLocal = pendingSyncIncidents.value.filter(
                local => !remoteIncidents.some(remote =>
                    (local.uuid && remote.uuid === local.uuid) || (local.id > 0 && remote.id === local.id)
                )
            );

            const merged = [...pendingLocal, ...remoteIncidents];
            incidents.value = merged;
            saveToStorage(merged);
            incidentsLoaded.value = true;
            loading.value = false;

            if (pendingSyncIncidents.value.length > 0 && navigator.onLine) {
                syncOfflineIncidents();
            }
        } catch (error) {
            errors.value.push(error);
            loading.value = false;
        }
    }

    function getIncidentById(id) {
        return computed(() => incidents.value.find(incident => String(incident.id) === String(id)));
    }

    async function addIncident(incident) {
        if (!incident.uuid) {
            incident.uuid = 'off-' + Math.random().toString(36).substring(2, 9);
        }
        incident.isSynced = false;

        const updated = [incident, ...incidents.value];
        incidents.value = updated;
        saveToStorage(updated);

        try {
            const payload = {
                uuid: incident.uuid,
                activeTourId: incident.activeTourId,
                reportedByUserId: incident.reportedByUserId,
                description: incident.description,
                latitude: incident.latitude,
                longitude: incident.longitude,
                reportedAt: incident.reportedAt,
                status: incident.status,
                severity: incident.severity,
                resolutionNote: incident.resolutionNote,
                reporterRole: incident.reporterRole,
            };
            const response = await incidentApi.createIncident(payload);
            const resource = response.data;

            const current = incidents.value;
            const synced = current.map(inc => {
                if (inc.uuid === incident.uuid) {
                    return new Incident({
                        ...inc,
                        id: Number(resource.id),
                        isSynced: true
                    });
                }
                return inc;
            });
            incidents.value = synced;
            saveToStorage(synced);
            return true;
        } catch (error) {
            console.warn('Network unavailable, incident kept offline in queue.', error);
            scheduleSyncRetry();
            return true;
        }
    }

    async function updateIncident(incident) {
        const current = incidents.value;
        const existing = current.find(item =>
            (incident.id > 0 && item.id === incident.id) || (!!incident.uuid && item.uuid === incident.uuid)
        );
        if (!existing) return false;

        if (!existing.isSynced) {
            const updated = current.map(item => item === existing ? new Incident({ ...incident, isSynced: false }) : item);
            incidents.value = updated;
            saveToStorage(updated);
            return true;
        }

        try {
            const response = await incidentApi.updateIncident(incident);
            const resource = response.data;
            const updatedIncident = new Incident({ ...IncidentAssembler.toEntityFromResource(resource), isSynced: true });
            const updated = incidents.value.map(item => String(item.id) === String(updatedIncident.id) ? updatedIncident : item);
            incidents.value = updated;
            saveToStorage(updated);
            return true;
        } catch (error) {
            errors.value.push(error);
            console.error('Error updating incident in API', error);
            return false;
        }
    }

    async function resolveIncident(incident, note = '') {
        const resolvedIncident = new Incident({ ...incident });
        resolvedIncident.resolve(note);
        return updateIncident(resolvedIncident);
    }

    async function deleteIncident(id) {
        const current = incidents.value;
        const incident = current.find(item => Number(item.id) === Number(id) || item.uuid === id);
        if (!incident) return;

        const index = current.indexOf(incident);
        const filtered = current.filter(item => item !== incident);
        incidents.value = filtered;
        saveToStorage(filtered);

        if (!incident.isSynced || Number(incident.id) <= 0) return;

        try {
            await incidentApi.deleteIncident(incident.id);
        } catch (error) {
            const latest = incidents.value;
            if (!latest.some(item => item.id === incident.id)) {
                const restored = [...latest];
                restored.splice(Math.min(index, restored.length), 0, incident);
                incidents.value = restored;
                saveToStorage(restored);
            }
            errors.value.push(error);
            console.error('Error deleting incident from API', error);
        }
    }

    async function syncOfflineIncidents() {
        if (syncing.value) return;
        const pending = pendingSyncIncidents.value;
        if (pending.length === 0) return;

        syncing.value = true;
        try {
            for (const incident of pending) {
                if (!incident.uuid) {
                    incident.uuid = `off-${Math.random().toString(36).substring(2, 9)}`;
                }
                const payload = {
                    uuid: incident.uuid,
                    activeTourId: incident.activeTourId,
                    reportedByUserId: incident.reportedByUserId,
                    description: incident.description,
                    latitude: incident.latitude,
                    longitude: incident.longitude,
                    reportedAt: incident.reportedAt,
                    status: incident.status,
                    severity: incident.severity,
                    resolutionNote: incident.resolutionNote,
                    reporterRole: incident.reporterRole,
                };
                const response = await incidentApi.createIncident(payload);
                const serverId = Number(response.data.id);

                incidents.value = incidents.value.map(inc =>
                    inc.uuid === incident.uuid ? new Incident({ ...inc, id: serverId, isSynced: true }) : inc
                );
            }
            saveToStorage(incidents.value);
            syncing.value = false;
            syncRetryAttempts = 0;
        } catch (error) {
            syncing.value = false;
            console.warn('Sync failed; pending incidents retained locally.', error);
            scheduleSyncRetry();
        }
    }

    function scheduleSyncRetry() {
        if (syncRetryTimer !== null || syncRetryAttempts >= 3) return;
        const delay = Math.min(1000 * 2 ** syncRetryAttempts, 8000);
        syncRetryAttempts += 1;
        syncRetryTimer = setTimeout(() => {
            syncRetryTimer = null;
            if (navigator.onLine) syncOfflineIncidents();
        }, delay);
    }

    return {
        incidents,
        loading,
        errors,
        syncing,
        incidentsLoaded,
        incidentsCount,
        pendingSyncIncidents,
        fetchIncidents,
        getIncidentById,
        addIncident,
        updateIncident,
        resolveIncident,
        deleteIncident,
        syncOfflineIncidents
    };
});

export default useIncidentStore;