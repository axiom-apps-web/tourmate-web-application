import {TourManagementApi} from "../infrastructure/tour-management-api.js";
import {defineStore} from "pinia";
import {ref} from "vue";
import {TourAssembler} from "../infrastructure/tour.assembler.js";
import {TourScheduleAssembler} from "../infrastructure/tour-schedule.assembler.js";

const tourManagementApi = new TourManagementApi();

/**
 *
 * @returns {Object}
 */

const useTourManagementStore = defineStore('tour-management',() => {

    const tours = ref([])
    const tourSchedules = ref([])

    const errors = ref([])

    const toursLoaded = ref(false)
    const tourSchedulesLoaded = ref(false)

    function fetchTours() {
        tourManagementApi.getTours().then((response) => {
            tours.value = TourAssembler.toEntitiesFromResponse(response)
            toursLoaded.value = true
        }).catch((error) => {
            errors.value.push(error)
        })
    }

    function fetchTourSchedules() {
        tourManagementApi.getTourSchedules().then((response) => {
            tourSchedules.value = TourScheduleAssembler.toEntitiesFromResponse(response)
            tourSchedulesLoaded.value = true
        }).catch((error) => {
            errors.value.push(error)
        })
    }

    function getTourById(id) {
        let idNum = parseInt(id)
        return tours.value.find(tour => tour.id === idNum)
    }

    function addTour(tour) {
        tourManagementApi.createTour(tour).then((response) => {
            const resource = response.data
            const newTour = TourAssembler.toEntityFromResource(resource)
            tours.value.push(newTour)
        }).catch((error) => {
            errors.value.push(error)
        })
    }

    function updateTour(tour) {
        tourManagementApi.updateTour(tour).then((response) => {
            const resource = response.data
            const updatedTour = TourAssembler.toEntityFromResource(resource)
            const index = tours.value.findIndex(tour => tour.id === updatedTour.id)
            if(index !== -1) tours.value[index] = updatedTour
        }).catch((error) => {
            errors.value.push(error)
        })
    }

    function deleteTour(tour) {
        tourManagementApi.deleteTour(tour.id).then(() => {
            const index = tours.value.findIndex(t => t.id === tour.id)
            if (index !== -1) tours.value.splice(index,1)
        }).catch((error) => {
            errors.value.push(error)
        })
    }

    function getTourScheduleById(id) {
        let idNum = parseInt(id)
        return tourSchedules.value.find(ts => ts.id === idNum)
    }

    function addTourSchedule(tourSchedule) {
        tourManagementApi.createTourSchedule(tourSchedule).then((response) => {
            const resource = response.data
            const newTourSchedule = TourScheduleAssembler.toEntityFromResource(resource)
            tourSchedules.value.push(newTourSchedule)
        }).catch((error) => {
            errors.value.push(error)
        })
    }

    function updateTourSchedule(tourSchedule) {
        tourManagementApi.updateTourSchedule(tourSchedule).then((response) => {
            const resource = response.data
            const updatedTourSchedule = TourScheduleAssembler.toEntityFromResource(resource)
            const index = tourSchedules.value.findIndex(ts => ts.id === updatedTourSchedule.id)
            if (index !== -1) tourSchedules.value[index] = updatedTourSchedule
        }).catch((error) => {
            errors.value.push(error)
        })
    }

    function deleteTourSchedule(tourSchedule) {
        tourManagementApi.deleteTourSchedule(tourSchedule.id).then(() => {
            const index = tourSchedules.value.findIndex(ts => ts.id === tourSchedule.id)
            if (index !== -1) tourSchedules.value.splice(index,1)
        }).catch((error) => {
            errors.value.push(error)
        })
    }

    return {
        tours,
        tourSchedules,
        errors,
        toursLoaded,
        tourSchedulesLoaded,
        fetchTours,
        fetchTourSchedules,
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