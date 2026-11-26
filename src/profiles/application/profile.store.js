/**
 * Application service store for the Profile bounded context.
 * It coordinates profile and participant use cases and keeps UI-facing state.
 *
 * @module useProfileStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ProfileApi} from "../infrastructure/profile-api.js";
import {ProfileAssembler} from "../infrastructure/profile.assembler.js";

import {Profile} from "../domain/model/profile.entity.js";
const profileApi = new ProfileApi();
const deletingProfileIds = new Set();

/**
 * Reactive store that exposes Profile commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useProfileStore = defineStore('profile', () => {
    /**
     * List of profile entities.
     * @type {import('vue').Ref<Profile[]>}
     */
    const profiles = ref([]);

    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether profiles have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const profilesLoaded = ref(false);



    const profilesCount = computed(() => {
        return profilesLoaded ? profiles.value.length : 0;
    });



    /**
     * Loads profiles from infrastructure and updates the application state.
     * @returns {void}
     */
    async function fetchProfiles() {
        try {
            const response = await profileApi.getProfiles()
            profiles.value = ProfileAssembler.toEntitiesFromResponse(response);
            profilesLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }



    /**
     * Finds a profile entity by identifier.
     * @param {number|string} id - Profile identifier.
     * @returns {Profile|undefined} Matching profile, if available.
     */
    function getProfileById(id) {
        return profiles.value.find(profile => String(profile.id) === String(id));
    }

    /**
     * Creates a profile through infrastructure and appends it to local state.
     * @param {Profile} profile - Profile entity to persist.
     * @returns {void}
     */
    async function addProfile(profile) {
        try {
            const response = await profileApi.createProfile(profile)
            const resource = response.data;
            const newProfile = ProfileAssembler.toEntityFromResource(resource);
            profiles.value.push(newProfile);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Updates an existing profile and synchronizes local state.
     * @param {Profile} profile - Profile entity with updated data.
     * @returns {void}
     */
    async function updateProfile(profile) {
        try {
            const response = await profileApi.updateProfile(profile)
            const resource = response.data;
            const updatedProfile = ProfileAssembler.toEntityFromResource(resource);
            const index = profiles.value.findIndex(c => c["id"] === updatedProfile.id);
            if (index !== -1) profiles.value[index] = updatedProfile;
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Deletes a profile and removes it from local state.
     * @param {Profile} profile - Profile entity to remove.
     * @returns {void}
     */
    async function deleteProfile(profile) {
        const id = String(profile.id);
        if (deletingProfileIds.has(id)) return false;

        deletingProfileIds.add(id);
        try {
            await profileApi.deleteProfile(profile.id)
            const index = profiles.value.findIndex(c => String(c.id) === id);
            if (index !== -1) profiles.value.splice(index, 1);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        } finally {
            deletingProfileIds.delete(id);
        }
    }



    return {
        profiles,
        errors,
        profilesLoaded,
        profilesCount,
        fetchProfiles,
        getProfileById,
        addProfile,
        updateProfile,
        deleteProfile
    }
});

export default useProfileStore;
