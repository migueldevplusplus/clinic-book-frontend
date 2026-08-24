import { api } from './client'

/** GET /patients?query= -> [{ patientId, fullName, email, phoneNumber }] */
export const searchPatients = (query) =>
  api.get('/patients', { params: { query } }).then((r) => r.data)

/** POST /patients (RECEPTIONIST, SUPER_ADMIN) -> { fullName, userId } */
export const registerPatient = (payload) =>
  api.post('/patients', payload).then((r) => r.data)
