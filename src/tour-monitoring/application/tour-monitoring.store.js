/**
 * Application service store for the TourMonitoring bounded context.
 * It coordinates activeTour and participant use cases and keeps UI-facing state.
 *
 * @module useTourMonitoringStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {TourMonitoringApi} from "../infrastructure/tour-monitoring-api.js";
import {ActiveTourAssembler} from "../infrastructure/active-tour.assembler.js";
import {ParticipantAssembler} from "../infrastructure/participant.assembler.js";
import {ActiveTour} from "../domain/model/active-tour.entity.js";
import {Participant} from "../domain/model/participant.entity.js";

const tourMonitoringApi = new TourMonitoringApi();

/**
 * Reactive store that exposes TourMonitoring commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useTourMonitoringStore = defineStore('tourMonitoring', () => {
    /**
     * List of activeTour entities.
     * @type {import('vue').Ref<ActiveTour[]>}
     */
    const activeTours = ref([]);
    /**
     * List of participant entities.
     * @type {import('vue').Ref<Participant[]>}
     */
    const participants = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether activeTours have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const activeToursLoaded = ref(false);
    /**
     * Whether participants have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const participantsLoaded = ref(false);
    /**
     * Number of loaded activeTours.
     * @type {import('vue').ComputedRef<number>}
     */
    const activeToursCount = computed(() => {
        return activeToursLoaded ? activeTours.value.length : 0;
    });
    /**
     * Number of loaded participants.
     * @type {import('vue').ComputedRef<number>}
     */
    const participantsCount = computed(() => {
        return participantsLoaded ? participants.value.length : 0;
    });

    /**
     * Loads activeTours from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchActiveTours() {
        tourMonitoringApi.getActiveTours().then(response => {
            activeTours.value = ActiveTourAssembler.toEntitiesFromResponse(response);
            activeToursLoaded.value = true;
            console.log(activeToursLoaded.value);
            console.log(activeTours.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Loads participants from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchParticipants() {
        tourMonitoringApi.getParticipants().then(response => {
            participants.value = ParticipantAssembler.toEntitiesFromResponse(response);
            participantsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Finds a activeTour entity by identifier.
     * @param {number|string} id - ActiveTour identifier.
     * @returns {ActiveTour|undefined} Matching activeTour, if available.
     */
    function getActiveTourById(id) {
        let idNum = parseInt(id);
        return activeTours.value.find(activeTour => activeTour["id"] === idNum);
    }

    /**
     * Creates a activeTour through infrastructure and appends it to local state.
     * @param {ActiveTour} activeTour - ActiveTour entity to persist.
     * @returns {void}
     */
    function addActiveTour(activeTour) {
        tourMonitoringApi.createActiveTour(activeTour).then(response => {
            const resource = response.data;
            const newActiveTour = ActiveTourAssembler.toEntityFromResource(resource);
            activeTours.value.push(newActiveTour);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing activeTour and synchronizes local state.
     * @param {ActiveTour} activeTour - ActiveTour entity with updated data.
     * @returns {void}
     */
    function updateActiveTour(activeTour) {
        tourMonitoringApi.updateActiveTour(activeTour).then(response => {
            const resource = response.data;
            const updatedActiveTour = ActiveTourAssembler.toEntityFromResource(resource);
            const index = activeTours.value.findIndex(c => c["id"] === updatedActiveTour.id);
            if (index !== -1) activeTours.value[index] = updatedActiveTour;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a activeTour and removes it from local state.
     * @param {ActiveTour} activeTour - ActiveTour entity to remove.
     * @returns {void}
     */
    function deleteActiveTour(activeTour) {
        tourMonitoringApi.deleteActiveTour(activeTour.id).then(() => {
            const index = activeTours.value.findIndex(c => c["id"] === activeTour.id);
            if (index !== -1) activeTours.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }


    /**
     * Finds a participant entity by identifier.
     * @param {number|string} id - Participant identifier.
     * @returns {Participant|undefined} Matching participant, if available.
     */
    function getParticipantById(id) {
        let idNum = parseInt(id);
        return participants.value.find(participant => participant["id"] === idNum);
    }

    /**
     * Creates a participant through infrastructure and appends it to local state.
     * @param {Participant} participant - Participant entity to persist.
     * @returns {void}
     */
    function addParticipant(participant) {
        tourMonitoringApi.createParticipant(participant).then(response => {
            const resource = response.data;
            const newParticipant = ParticipantAssembler.toEntityFromResource(resource);
            participants.value.push(newParticipant);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing participant and synchronizes local state.
     * @param {Participant} participant - Participant entity with updated data.
     * @returns {void}
     */
    function updateParticipant(participant) {
        tourMonitoringApi.updateParticipant(participant).then(response => {
            const resource = response.data;
            const updatedParticipant = ParticipantAssembler.toEntityFromResource(resource);
            const index = participants.value.findIndex(t => t["id"] === updatedParticipant.id);
            if (index !== -1) participants.value[index] = updatedParticipant;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a participant and removes it from local state.
     * @param {Participant} participant - Participant entity to remove.
     * @returns {void}
     */
    function deleteParticipant(participant) {
        tourMonitoringApi.deleteParticipant(participant.id).then(() => {
            const index = participants.value.findIndex(t => t["id"] === participant.id);
            if (index !== -1) participants.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    return {
        activeTours,
        participants,
        errors,
        activeToursLoaded,
        participantsLoaded,
        activeToursCount,
        participantsCount,
        fetchActiveTours,
        fetchParticipants,
        getActiveTourById,
        addActiveTour,
        updateActiveTour,
        deleteActiveTour,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        getParticipantById
    }
});

export default useTourMonitoringStore;

