import { api } from './client'

/** GET /doctors, optionally filtered by specialty. */
export const listDoctors = (specialty) =>
  api
    .get('/doctors', { params: specialty ? { specialty } : undefined })
    .then((r) => r.data)

/** GET /doctors/{id} */
export const getDoctor = (id) => api.get(`/doctors/${id}`).then((r) => r.data)

/** GET /doctors/{doctorId}/schedules -> [{ id, dayOfWeek, startTime, endTime }] */
export const getSchedules = (doctorId) =>
  api.get(`/doctors/${doctorId}/schedules`).then((r) => r.data)

/** POST /doctors/schedules (DOCTOR). The doctor id comes from the token. */
export const createSchedule = (payload) =>
  api.post('/doctors/schedules', payload).then((r) => r.data)

/** DELETE /doctors/schedules/{id} (DOCTOR), limited to their own blocks. */
export const deleteSchedule = (scheduleId) =>
  api.delete(`/doctors/schedules/${scheduleId}`).then((r) => r.data)

/** POST /doctors/{doctorId}/schedules (SUPER_ADMIN, RECEPTIONIST) */
export const createScheduleForDoctor = (doctorId, payload) =>
  api.post(`/doctors/${doctorId}/schedules`, payload).then((r) => r.data)

/** DELETE /doctors/{doctorId}/schedules/{id} (SUPER_ADMIN, RECEPTIONIST) */
export const deleteScheduleForDoctor = (doctorId, scheduleId) =>
  api.delete(`/doctors/${doctorId}/schedules/${scheduleId}`).then((r) => r.data)

/** POST /doctors (SUPER_ADMIN) */
export const registerDoctor = (payload) =>
  api.post('/doctors', payload).then((r) => r.data)
