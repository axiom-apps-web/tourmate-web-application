import { IncidentStatus } from "../value-objects/incident-status.js";

export class Incident {
    constructor({
                    id = null,
                    uuid = '',
                    activeTourId = null,
                    reportedByUserId = null,
                    description = '',
                    latitude = 0,
                    longitude = 0,
                    reportedAt = '',
                    status = IncidentStatus.OPEN,
                    severity = 'MEDIUM',
                    isSynced = true,
                    resolutionNote = '',
                    reporterRole = 'TOURIST'
                }) {
        this.id = id;
        this.uuid = uuid || '';
        this.activeTourId = activeTourId;
        this.reportedByUserId = reportedByUserId;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.reportedAt = reportedAt || new Date().toISOString();
        this.status = typeof status === 'string'
            ? (IncidentStatus[status] ?? IncidentStatus.OPEN)
            : status;
        this.severity = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity) ? severity : 'MEDIUM';
        this.isSynced = isSynced;
        this.resolutionNote = resolutionNote || '';
        this.reporterRole = reporterRole;
    }

    resolve(note = '') {
        if (note.trim().length > 0 && note.trim().length < 5) {
            throw new Error('An incident resolution note must contain at least five characters.');
        }
        if (note.trim().length >= 5) {
            this.resolutionNote = note.trim();
        }
        this.status = IncidentStatus.RESOLVED;
    }

    getGuidedProtocols() {
        switch (this.severity) {
            case 'CRITICAL':
                return [
                    'incidents.protocols.critical.evacuate',
                    'incidents.protocols.critical.contact_base',
                    'incidents.protocols.critical.provide_oxygen'
                ];
            case 'HIGH':
                return [
                    'incidents.protocols.high.stop_expedition',
                    'incidents.protocols.high.provide_first_aid',
                    'incidents.protocols.high.prepare_rescue'
                ];
            default:
                return [
                    'incidents.protocols.standard.log_observation',
                    'incidents.protocols.standard.monitor_participant'
                ];
        }
    }
}