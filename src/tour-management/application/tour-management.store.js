import {TourManagementApi} from "../infrastructure/tour-management-api.js";
import {defineStore} from "pinia";
import {ref} from "vue";
import {TourAssembler} from "../infrastructure/tour.assembler.js";
import {TourScheduleAssembler} from "../infrastructure/tour-schedule.assembler.js";
import {CheckpointAssembler} from "../infrastructure/checkpoint.assembler.js";

const tourManagementApi = new TourManagementApi();

/**
 *
 * @returns {Object}
 */

const useTourManagementStore = defineStore('tour-management',() => {

    const tours = ref([])
    const tourSchedules = ref([])
    const checkpoints = ref([])

    const errors = ref([])
    const checkpointErrors = ref([])

    const toursLoaded = ref(false)
    const tourSchedulesLoaded = ref(false)
    const checkpointsLoaded = ref(false)

    async function fetchTours() {
        try {
            const response = await tourManagementApi.getTours()
            tours.value = TourAssembler.toEntitiesFromResponse(response)
            toursLoaded.value = true
        } catch (error) {
            errors.value.push(error)
            return false
        }
    }

    async function fetchTourSchedules() {
        try {
            const response = await tourManagementApi.getTourSchedules()
            tourSchedules.value = TourScheduleAssembler.toEntitiesFromResponse(response)
            tourSchedulesLoaded.value = true
        } catch (error) {
            errors.value.push(error)
            return false
        }
    }

    async function fetchCheckpoints() {
        checkpointErrors.value = []
        try {
            const response = await tourManagementApi.getCheckpoints()
            checkpoints.value = CheckpointAssembler.toEntitiesFromResponse(response)
            checkpointsLoaded.value = true
        } catch (error) {
            checkpoints.value = []
            checkpointsLoaded.value = true
            checkpointErrors.value.push(error)
            return false
        }
    }

    function getTourById(id) {
        return tours.value.find(tour => String(tour.id) === String(id))
    }

    async function addTour(tour) {
        try {
            const response = await tourManagementApi.createTour(tour)
            const resource = response.data
            const newTour = TourAssembler.toEntityFromResource(resource)
            tours.value.push(newTour)
            return true
        } catch (error) {
            errors.value.push(error)
            return false
        }
    }

    async function updateTour(tour) {
        try {
            const response = await tourManagementApi.updateTour(tour)
            const resource = response.data
            const updatedTour = TourAssembler.toEntityFromResource(resource)
            const index = tours.value.findIndex(tour => tour.id === updatedTour.id)
            if(index !== -1) tours.value[index] = updatedTour
            return true
        } catch (error) {
            errors.value.push(error)
            return false
        }
    }

    async function deleteTour(tour) {
        try {
            await tourManagementApi.deleteTour(tour.id)
            const index = tours.value.findIndex(t => t.id === tour.id)
            if (index !== -1) tours.value.splice(index,1)
            return true
        } catch (error) {
            errors.value.push(error)
            return false
        }
    }

    function getTourScheduleById(id) {
        let idNum = parseInt(id)
        return tourSchedules.value.find(ts => ts.id === idNum)
    }

    async function addTourSchedule(tourSchedule) {
        try {
            const response = await tourManagementApi.createTourSchedule(tourSchedule)
            const resource = response.data
            const newTourSchedule = TourScheduleAssembler.toEntityFromResource(resource)
            tourSchedules.value.push(newTourSchedule)
            return true
        } catch (error) {
            errors.value.push(error)
            return false
        }
    }

    async function updateTourSchedule(tourSchedule) {
        try {
            const response = await tourManagementApi.updateTourSchedule(tourSchedule)
            const resource = response.data
            const updatedTourSchedule = TourScheduleAssembler.toEntityFromResource(resource)
            const index = tourSchedules.value.findIndex(ts => ts.id === updatedTourSchedule.id)
            if (index !== -1) tourSchedules.value[index] = updatedTourSchedule
            return true
        } catch (error) {
            errors.value.push(error)
            return false
        }
    }

    async function deleteTourSchedule(tourSchedule) {
        try {
            await tourManagementApi.deleteTourSchedule(tourSchedule.id)
            const index = tourSchedules.value.findIndex(ts => ts.id === tourSchedule.id)
            if (index !== -1) tourSchedules.value.splice(index,1)
            return true
        } catch (error) {
            errors.value.push(error)
            return false
        }
    }

    return {
        tours,
        tourSchedules,
        checkpoints,
        errors,
        checkpointErrors,
        toursLoaded,
        tourSchedulesLoaded,
        checkpointsLoaded,
        fetchTours,
        fetchTourSchedules,
        fetchCheckpoints,
        getTourById,
        getTourScheduleById,
        addTour,
        addTourSchedule,
        updateTour,
        updateTourSchedule,
        deleteTour,
        deleteTourSchedule
    }
})

export default useTourManagementStore;