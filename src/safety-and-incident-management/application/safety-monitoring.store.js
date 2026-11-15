import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { SafetyMonitoringApi } from "../infrastructure/safety-monitoring-api.js";
import useIncidentStore from "./incident.store.js";
import { Incident } from "../domain/model/incident.entity.js";
import { IncidentStatus } from "../domain/value-objects/incident-status.js";

const api = new SafetyMonitoringApi();
const ROUTE_DEVIATION_THRESHOLD_METERS = 500;
const COMMUNICATION_TIMEOUT_MS = 5 * 60 * 1000;

export const useSafetyMonitoringStore = defineStore('safetyMonitoring', () => {
    const incidentStore = useIncidentStore();

    const locations = ref([]);
    const alerts = ref([]);
    const telemetry = ref([]);
    const wearables = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    const allAlerts = computed(() => [
        ...alerts.value,
        ...incidentStore.incidents.map(incident => ({
            id: `incident-${incident.id}`,
            incidentId: incident.id,
            expeditionId: incident.activeTourId,
            touristId: incident.reportedByUserId,
            type: 'INCIDENT',
            severity: incident.severity,
            message: incident.description,
            createdAt: incident.reportedAt,
            status: incident.status === IncidentStatus.IN_REVIEW
                ? 'ACKNOWLEDGED'
                : incident.status === IncidentStatus.RESOLVED || incident.status === IncidentStatus.CLOSED
                    ? 'RESOLVED'
                    : 'ACTIVE',
            sourceRecordId: incident.id
        }))
    ]);

    const activeAlerts = computed(() =>
        allAlerts.value.filter(alert => alert.status === 'ACTIVE')
    );

    async function refresh() {
        loading.value = true;
        errors.value = [];
        try {
            const data = await api.getSafetyData();
            locations.value = data.locations;
            alerts.value = data.alerts;
            telemetry.value = data.telemetry;
            wearables.value = data.wearables;
            loading.value = false;
            evaluateCommunicationAlerts();
        } catch (error) {
            loading.value = false;
            errors.value.push(error);
            console.error('Error loading safety monitoring data', error);
        }
    }

    async function reportLocation(location) {
        try {
            const created = await api.createLocation(location);
            locations.value.unshift(created);
            if (
                location.expectedLatitude !== undefined &&
                location.expectedLongitude !== undefined &&
                distanceInMeters(location.latitude, location.longitude, location.expectedLatitude, location.expectedLongitude) > ROUTE_DEVIATION_THRESHOLD_METERS
            ) {
                await createSafetyAlert({
                    ...(created.incidentId !== undefined ? { incidentId: created.incidentId } : {}),
                    expeditionId: location.expeditionId,
                    touristId: location.touristId,
                    type: 'ROUTE_DEVIATION',
                    severity: 'HIGH',
                    message: 'safety.alert_messages.route_deviation',
                    createdAt: new Date().toISOString(),
                    status: 'ACTIVE',
                    sourceRecordId: created.id
                });
            }
        } catch (error) {
            errors.value.push(error);
            console.error('Error saving location report', error);
        }
    }

    async function updateLocation(location) {
        try {
            const saved = await api.updateLocation(location);
            locations.value = locations.value.map(item => String(item.id) === String(saved.id) ? saved : item);
        } catch (error) {
            errors.value.push(error);
            console.error('Error updating location report', error);
        }
    }

    async function ingestTelemetry(record) {
        const wearable = wearables.value.find(
            item => item.deviceId === record.wearableId &&
                Number(item.touristId) === Number(record.touristId) &&
                (item.activeExpeditionId == null || Number(item.activeExpeditionId) === Number(record.expeditionId))
        );
        if (!wearable) {
            errors.value.push(new Error('Wearable not registered'));
            return;
        }

        try {
            const created = await api.createTelemetry(record);
            telemetry.value.unshift(created);

            if (created.heartRate >= 120 || created.heartRate <= 40 || created.bloodOxygen < 90) {
                await createSafetyAlert({
                    ...(created.incidentId !== undefined ? { incidentId: created.incidentId } : {}),
                    expeditionId: created.expeditionId,
                    touristId: created.touristId,
                    type: 'HEALTH_CRITICAL',
                    severity: 'CRITICAL',
                    message: 'safety.alert_messages.health_critical',
                    createdAt: new Date().toISOString(),
                    status: 'ACTIVE',
                    sourceRecordId: created.id
                });
            }

            if (created.connectivity === 'DISCONNECTED') {
                await createSafetyAlert({
                    ...(created.incidentId !== undefined ? { incidentId: created.incidentId } : {}),
                    expeditionId: created.expeditionId,
                    touristId: created.touristId,
                    type: 'COMMUNICATION_LOST',
                    severity: 'HIGH',
                    message: 'safety.alert_messages.communication_lost',
                    createdAt: new Date().toISOString(),
                    status: 'ACTIVE',
                    sourceRecordId: created.id
                });
            }

            const updatedWearable = {
                ...wearable,
                batteryLevel: created.batteryLevel,
                connectivity: created.connectivity,
                lastSyncAt: created.recordedAt
            };
            const savedWearable = await api.updateWearable(updatedWearable);
            wearables.value = wearables.value.map(item => String(item.id) === String(savedWearable.id) ? savedWearable : item);
        } catch (error) {
            errors.value.push(error);
            console.error('Error ingesting telemetry', error);
        }
    }

    async function updateTelemetry(record) {
        try {
            const saved = await api.updateTelemetry(record);
            telemetry.value = telemetry.value.map(item => String(item.id) === String(saved.id) ? saved : item);
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function linkWearable(wearable) {
        try {
            const payload = {
                ...wearable,
                batteryLevel: wearable.batteryLevel ?? 100,
                connectivity: wearable.connectivity ?? 'CONNECTED',
                lastSyncAt: wearable.lastSyncAt ?? new Date().toISOString()
            };
            const saved = wearable.id ? await api.updateWearable(payload) : await api.createWearable(payload);
            wearables.value = wearable.id
                ? wearables.value.map(item => String(item.id) === String(saved.id) ? saved : item)
                : [saved, ...wearables.value];
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function unlinkWearable(wearable) {
        try {
            await api.deleteWearable(wearable.id);
            wearables.value = wearables.value.filter(item => String(item.id) !== String(wearable.id));
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function acknowledgeAlert(alert) {
        if (alert.type === 'INCIDENT') {
            const incident = incidentStore.incidents.find(item => String(item.id) === String(alert.sourceRecordId));
            if (!incident) return;
            await incidentStore.updateIncident(new Incident({ ...incident, status: IncidentStatus.IN_REVIEW }));
            return;
        }

        try {
            const updated = { ...alert, status: 'ACKNOWLEDGED' };
            const saved = await api.updateAlert(updated);
            alerts.value = alerts.value.map(item => String(item.id) === String(saved.id) ? saved : item);
        } catch (error) {
            errors.value.push(error);
        }
    }

    function exportExpeditionReport(expeditionId) {
        const rows = [
            ['recordType', 'recordId', 'expeditionId', 'touristId', 'recordedAt', 'details'],
            ...locations.value
                .filter(record => record.expeditionId === expeditionId)
                .map(record => ['location', record.id, record.expeditionId, record.touristId, record.recordedAt, `${record.latitude},${record.longitude}`]),
            ...telemetry.value
                .filter(record => record.expeditionId === expeditionId)
                .map(record => ['telemetry', record.id, record.expeditionId, record.touristId, record.recordedAt, `heartRate=${record.heartRate}; bloodOxygen=${record.bloodOxygen}; battery=${record.batteryLevel}; connectivity=${record.connectivity}`]),
            ...alerts.value
                .filter(record => record.expeditionId === expeditionId)
                .map(record => ['alert', record.id, record.expeditionId, record.touristId, record.createdAt, `${record.type}; ${record.severity}; ${record.status}; ${record.message}`]),
            ...incidentStore.incidents
                .filter(record => record.activeTourId === expeditionId)
                .map(record => ['incident', record.id, record.activeTourId, record.reportedByUserId, record.reportedAt, `${record.status}; ${record.severity}; ${record.description}`])
        ];
        return rows.map(row => row.map(field => escapeCsv(field)).join(',')).join('\r\n');
    }

    async function createSafetyAlert(alert) {
        const duplicate = alerts.value.some(
            item => item.status === 'ACTIVE' &&
                String(item.incidentId ?? '') === String(alert.incidentId ?? '') &&
                item.expeditionId === alert.expeditionId &&
                item.touristId === alert.touristId &&
                item.type === alert.type
        );
        if (duplicate) return;

        try {
            const created = await api.createAlert(alert);
            alerts.value.unshift(created);
        } catch (error) {
            console.error('Error creating safety alert', error);
        }
    }

    function evaluateCommunicationAlerts() {
        const now = Date.now();
        for (const wearable of wearables.value) {
            const lastSync = Date.parse(wearable.lastSyncAt);
            const hasLostCommunication = wearable.connectivity === 'DISCONNECTED' || (Number.isFinite(lastSync) && now - lastSync > COMMUNICATION_TIMEOUT_MS);
            if (!hasLostCommunication || wearable.activeExpeditionId == null) continue;
            const relatedIncident = incidentStore.incidents.find(
                incident => incident.activeTourId === wearable.activeExpeditionId && incident.reportedByUserId === wearable.touristId
            );

            createSafetyAlert({
                ...(relatedIncident ? { incidentId: relatedIncident.id } : {}),
                expeditionId: wearable.activeExpeditionId,
                touristId: wearable.touristId,
                type: 'COMMUNICATION_LOST',
                severity: 'HIGH',
                message: 'safety.alert_messages.communication_lost',
                createdAt: new Date().toISOString(),
                status: 'ACTIVE'
            });
        }
    }

    function distanceInMeters(latA, lonA, latB, lonB) {
        const radians = deg => (deg * Math.PI) / 180;
        const dLat = radians(latB - latA);
        const dLon = radians(lonB - lonA);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(latA)) * Math.cos(radians(latB)) * Math.sin(dLon / 2) ** 2;
        return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function escapeCsv(value) {
        const text = String(value ?? '');
        return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }

    return {
        locations,
        alerts,
        telemetry,
        wearables,
        loading,
        errors,
        allAlerts,
        activeAlerts,
        refresh,
        reportLocation,
        updateLocation,
        ingestTelemetry,
        updateTelemetry,
        linkWearable,
        unlinkWearable,
        acknowledgeAlert,
        exportExpeditionReport
    };
});

export default useSafetyMonitoringStore;