import { api } from './client'

/** GET /doctors, optionally filtered by specialty. */
export const listDoctors = (specialty) =>
  api
    .get('/doctors', { params: specialty ? { specialty } : undefined })
    .then((r) => r.data)

/** GET /doctors/{id} */
export const getDoctor = (id) => api.get(`/doctors/${id}`).then((r) => r.data)

/** GET /doctors/{id}/schedules -> [{ id, dayOfWeek, startTime, endTime }] */
export const getSchedules = (doctorId) =>
  api.get(`/doctors/${doctorId}/schedules`).then((r) => r.data)

/** POST /doctors/schedules (DOCTOR). The doctor id comes from the token. */
export const createSchedule = (payload) =>
  api.post('/doctors/schedules', payload).then((r) => r.data)

/** DELETE /doctors/{scheduleId}/schedules (DOCTOR) */
export const deleteSchedule = (scheduleId) =>
  api.delete(`/doctors/${scheduleId}/schedules`).then((r) => r.data)

/** POST /doctors (SUPER_ADMIN) */
export const registerDoctor = (payload) =>
  api.post('/doctors', payload).then((r) => r.data)
