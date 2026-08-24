import { api } from './client'

/**
 * GET /appointments/{doctorId}?date= -> [{ time, available }]
 * Lombok generates isAvailable(), which Jackson may emit as either key.
 */
export const getAvailability = (doctorId, date) =>
  api
    .get(`/appointments/${doctorId}`, { params: { date } })
    .then((r) =>
      r.data.map((slot) => ({
        time: slot.time,
        available: slot.available ?? slot.isAvailable ?? false,
      })),
    )

/** POST /appointments (PATIENT). The patient id comes from the token. */
export const bookAsPatient = (payload) =>
  api.post('/appointments', payload).then((r) => r.data)

/** POST /appointments/receptionist (RECEPTIONIST), needs an explicit patientId. */
export const bookAsReceptionist = (payload) =>
  api.post('/appointments/receptionist', payload).then((r) => r.data)

/** GET /appointments/my (PATIENT) */
export const myAppointments = () =>
  api.get('/appointments/my').then((r) => r.data)

/** GET /appointments/agenda?date= (DOCTOR) */
export const doctorAgenda = (date) =>
  api.get('/appointments/agenda', { params: { date } }).then((r) => r.data)

/** GET /appointments/upcoming-agenda (DOCTOR) */
export const doctorUpcoming = () =>
  api.get('/appointments/upcoming-agenda').then((r) => r.data)

/** GET /appointments/all?date= (RECEPTIONIST) */
export const allAppointments = (date) =>
  api.get('/appointments/all', { params: { date } }).then((r) => r.data)

/** GET /appointments/{doctorId}/receptionist?date= (RECEPTIONIST) */
export const doctorAgendaForReceptionist = (doctorId, date) =>
  api
    .get(`/appointments/${doctorId}/receptionist`, { params: { date } })
    .then((r) => r.data)

export const confirmAppointment = (id) =>
  api.patch(`/appointments/${id}/confirm`).then((r) => r.data)

/** DOCTOR marks their own appointment as completed. */
export const completeAppointment = (id) =>
  api.patch(`/appointments/${id}/complete`).then((r) => r.data)

export const completeAsReceptionist = (id) =>
  api.patch(`/appointments/${id}/complete/receptionist`).then((r) => r.data)

/** PATIENT cancels their own appointment. */
export const cancelOwnAppointment = (id) =>
  api.patch(`/appointments/${id}/cancel`).then((r) => r.data)

export const cancelAsReceptionist = (id) =>
  api.patch(`/appointments/${id}/cancel/receptionist`).then((r) => r.data)
