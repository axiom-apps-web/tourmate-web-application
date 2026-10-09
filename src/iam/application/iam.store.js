/**
 * Application service store for the IAM bounded context.
 * It coordinates user, agency, and tour guide use cases and keeps UI-facing state.
 *
 * @module useIamStore
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { IamApi } from "../infrastructure/iam-api.js";
import { UserAssembler } from "../infrastructure/user.assembler.js";
import { AgencyAssembler } from "../infrastructure/agency.assembler.js";
import { TourGuideAssembler } from "../infrastructure/tour-guide.assembler.js";

const iamApi = new IamApi();

/**
 * Reactive store that exposes IAM commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useIamStore = defineStore('iam', () => {

    /**
     * List of user entities.
     * @type {import('vue').Ref<import('../domain/model/user.entity.js').User[]>}
     */
    const users = ref([]);

    /**
     * List of agency entities.
     * @type {import('vue').Ref<import('../domain/model/agency.entity.js').Agency[]>}
     */
    const agencies = ref([]);

    /**
     * List of tour guide entities.
     * @type {import('vue').Ref<import('../domain/model/tour-guide.entity.js').TourGuide[]>}
     */
    const tourGuides = ref([]);

    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /** @type {import('vue').Ref<boolean>} */
    const usersLoaded = ref(false);

    /** @type {import('vue').Ref<boolean>} */
    const agenciesLoaded = ref(false);

    /** @type {import('vue').Ref<boolean>} */
    const tourGuidesLoaded = ref(false);

    /**
     * Global loading state (derived from pending requests in the original Angular code).
     * @type {import('vue').Ref<boolean>}
     */
    const loading = ref(false);

    const userCount = computed(() => usersLoaded.value ? users.value.length : 0);
    const agencyCount = computed(() => agenciesLoaded.value ? agencies.value.length : 0);
    const tourGuideCount = computed(() => tourGuidesLoaded.value ? tourGuides.value.length : 0);


    /**
     * Assigns the corresponding User entity to each TourGuide.
     */
    function assignUsersToTourGuides() {
        tourGuides.value = tourGuides.value.map(guide => assignUserToTourGuide(guide));
    }

    /**
     * Helper to link a single user to a tour guide.
     * @param {import('../domain/model/tour-guide.entity.js').TourGuide} tourGuide
     */
    function assignUserToTourGuide(tourGuide) {
        const userId = tourGuide.userId ?? 0;
        tourGuide.user = userId ? (getUserById(userId) ?? null) : null;
        return tourGuide;
    }


    /** Loads all data: users, agencies, and tour guides. */
    function loadAll() {
        fetchUsers();
        fetchAgencies();
        fetchTourGuides();
    }


    function fetchUsers() {
        loading.value = true;
        iamApi.getUsers().then(response => {
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
            assignUsersToTourGuides();
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            loading.value = false;
        });
    }

    function getUserById(id) {
        let idNum = parseInt(id);
        return users.value.find(user => user.id === idNum);
    }

    function addUser(user) {
        loading.value = true;
        iamApi.createUser(user).then(response => {
            const resource = response.data;
            const newUser = UserAssembler.toEntityFromResource(resource);
            users.value.push(newUser);
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    function updateUser(user) {
        loading.value = true;
        iamApi.updateUser(user).then(response => {
            const resource = response.data;
            const updatedUser = UserAssembler.toEntityFromResource(resource);
            const index = users.value.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) users.value[index] = updatedUser;
            assignUsersToTourGuides(); // Refresca las referencias
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }


    function deleteUser(userOrId) {
        const id = typeof userOrId === 'object' ? userOrId.id : userOrId;
        loading.value = true;
        iamApi.deleteUser(id).then(() => {
            const index = users.value.findIndex(u => u.id === id);
            if (index !== -1) users.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    // --- Agencies Actions ---

    function fetchAgencies() {
        loading.value = true;
        iamApi.getAgencies().then(response => {
            agencies.value = AgencyAssembler.toEntitiesFromResponse(response);
            agenciesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    function getAgencyById(id) {
        let idNum = parseInt(id);
        return agencies.value.find(agency => agency.id === idNum);
    }

    function addAgency(agency) {
        loading.value = true;
        iamApi.createAgency(agency).then(response => {
            const resource = response.data;
            const newAgency = AgencyAssembler.toEntityFromResource(resource);
            agencies.value.push(newAgency);
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    function updateAgency(agency) {
        loading.value = true;
        iamApi.updateAgency(agency).then(response => {
            const resource = response.data;
            const updatedAgency = AgencyAssembler.toEntityFromResource(resource);
            const index = agencies.value.findIndex(a => a.id === updatedAgency.id);
            if (index !== -1) agencies.value[index] = updatedAgency;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    function deleteAgency(agencyOrId) {
        const id = typeof agencyOrId === 'object' ? agencyOrId.id : agencyOrId;
        loading.value = true;
        iamApi.deleteAgency(id).then(() => {
            const index = agencies.value.findIndex(a => a.id === id);
            if (index !== -1) agencies.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    // --- Tour Guides Actions ---

    function fetchTourGuides() {
        loading.value = true;
        iamApi.getTourGuides().then(response => {
            tourGuides.value = TourGuideAssembler.toEntitiesFromResponse(response);
            tourGuidesLoaded.value = true;
            assignUsersToTourGuides();
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    function getTourGuideById(id) {
        let idNum = parseInt(id);
        return tourGuides.value.find(guide => guide.id === idNum);
    }

    function addTourGuide(tourGuide) {
        loading.value = true;
        iamApi.createTourGuide(tourGuide).then(response => {
            const resource = response.data;
            const newGuide = TourGuideAssembler.toEntityFromResource(resource);
            tourGuides.value.push(newGuide);
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    function updateTourGuide(tourGuide) {
        loading.value = true;
        iamApi.updateTourGuide(tourGuide).then(response => {
            const resource = response.data;
            const updatedGuide = TourGuideAssembler.toEntityFromResource(resource);
            const index = tourGuides.value.findIndex(g => g.id === updatedGuide.id);
            if (index !== -1) tourGuides.value[index] = updatedGuide;
            assignUsersToTourGuides();
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }

    function deleteTourGuide(tourGuideOrId) {
        const id = typeof tourGuideOrId === 'object' ? tourGuideOrId.id : tourGuideOrId;
        loading.value = true;
        iamApi.deleteTourGuide(id).then(() => {
            const index = tourGuides.value.findIndex(g => g.id === id);
            if (index !== -1) tourGuides.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => loading.value = false);
    }


    return {

        users, agencies, tourGuides, errors, loading,
        usersLoaded, agenciesLoaded, tourGuidesLoaded,

        userCount, agencyCount, tourGuideCount,


        loadAll,

        fetchUsers, getUserById, addUser, updateUser, deleteUser,

        fetchAgencies, getAgencyById, addAgency, updateAgency, deleteAgency,

        fetchTourGuides, getTourGuideById, addTourGuide, updateTourGuide, deleteTourGuide
    }
});

export default useIamStore;