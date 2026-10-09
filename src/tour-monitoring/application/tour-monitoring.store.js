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
import {TourManagementApi} from "../../tour-management/infrastructure/tour-management-api.js";
import {IamApi} from "../../iam/infrastructure/iam-api.js";
import {TourGuideAssembler} from "../../iam/infrastructure/tour-guide.assembler.js";
import {TourScheduleAssembler} from "../../tour-management/infrastructure/tour-schedule.assembler.js";

const tourMonitoringApi = new TourMonitoringApi();
const tourManagementApi = new TourManagementApi();
const iamApi = new IamApi();

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

    const guides = ref([]);

    const tourSchedules = ref([]);
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

    const guidesLoaded = ref(false);
    const tourSchedulesLoaded = ref(false);

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

    const guidesCount = computed(() => {
        return guidesLoaded ? guides.value.length : 0;
    });

    const tourSchedulesCount = computed(() => {
        return tourSchedulesLoaded ? tourSchedules.value.length : 0;
    });

    /**
     * Loads activeTours from infrastructure and updates the application state.
     * @returns {void}
     */
    async function fetchActiveTours() {
        try {
            const response = await tourMonitoringApi.getActiveTours()
            activeTours.value = ActiveTourAssembler.toEntitiesFromResponse(response);
            activeToursLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Loads participants from infrastructure and updates the application state.
     * @returns {void}
     */
    async function fetchParticipants() {
        try {
            const response = await tourMonitoringApi.getParticipants()
            participants.value = ParticipantAssembler.toEntitiesFromResponse(response);
            participantsLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    async function fetchGuides() {
        try {
            const response = await iamApi.getTourGuides()
            guides.value = TourGuideAssembler.toEntitiesFromResponse(response);
            guidesLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    async function fetchTourSchedules() {
        try {
            const response = await tourManagementApi.getTourSchedules()
            tourSchedules.value = TourScheduleAssembler.toEntitiesFromResponse(response);
            tourSchedulesLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
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
    async function addActiveTour(activeTour) {
        try {
            const response = await tourMonitoringApi.createActiveTour(activeTour)
            const resource = response.data;
            const newActiveTour = ActiveTourAssembler.toEntityFromResource(resource);
            activeTours.value.push(newActiveTour);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Updates an existing activeTour and synchronizes local state.
     * @param {ActiveTour} activeTour - ActiveTour entity with updated data.
     * @returns {void}
     */
    async function updateActiveTour(activeTour) {
        try {
            const response = await tourMonitoringApi.updateActiveTour(activeTour)
            const resource = response.data;
            const updatedActiveTour = ActiveTourAssembler.toEntityFromResource(resource);
            const index = activeTours.value.findIndex(c => c["id"] === updatedActiveTour.id);
            if (index !== -1) activeTours.value[index] = updatedActiveTour;
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Deletes a activeTour and removes it from local state.
     * @param {ActiveTour} activeTour - ActiveTour entity to remove.
     * @returns {void}
     */
    async function deleteActiveTour(activeTour) {
        try {
            await tourMonitoringApi.deleteActiveTour(activeTour.id)
            const index = activeTours.value.findIndex(c => c["id"] === activeTour.id);
            if (index !== -1) activeTours.value.splice(index, 1);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
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
    async function addParticipant(participant) {
        try {
            const response = await tourMonitoringApi.createParticipant(participant)
            const resource = response.data;
            const newParticipant = ParticipantAssembler.toEntityFromResource(resource);
            participants.value.push(newParticipant);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Updates an existing participant and synchronizes local state.
     * @param {Participant} participant - Participant entity with updated data.
     * @returns {void}
     */
    async function updateParticipant(participant) {
        try {
            const response = await tourMonitoringApi.updateParticipant(participant)
            const resource = response.data;
            const updatedParticipant = ParticipantAssembler.toEntityFromResource(resource);
            const index = participants.value.findIndex(t => t["id"] === updatedParticipant.id);
            if (index !== -1) participants.value[index] = updatedParticipant;
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Deletes a participant and removes it from local state.
     * @param {Participant} participant - Participant entity to remove.
     * @returns {void}
     */
    async function deleteParticipant(participant) {
        try {
            await tourMonitoringApi.deleteParticipant(participant.id)
            const index = participants.value.findIndex(t => t["id"] === participant.id);
            if (index !== -1) participants.value.splice(index, 1);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    return {
        activeTours,
        participants,
        guides,
        tourSchedules,
        errors,
        activeToursLoaded,
        participantsLoaded,
        guidesLoaded,
        tourSchedulesLoaded,
        activeToursCount,
        participantsCount,
        guidesCount,
        tourSchedulesCount,
        fetchActiveTours,
        fetchGuides,
        fetchParticipants,
        fetchTourSchedules,
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
