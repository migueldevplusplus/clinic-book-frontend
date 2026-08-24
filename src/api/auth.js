import { api } from './client'

/** POST /auth/login -> { token, fullName, userId, role } */
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

/** POST /auth/signup, patient self-registration. Returns a session too. */
export const signup = (payload) =>
  api.post('/auth/signup', payload).then((r) => r.data)

/** POST /auth/receptionists (SUPER_ADMIN) */
export const registerReceptionist = (payload) =>
  api.post('/auth/receptionists', payload).then((r) => r.data)

/** GET /auth/users (SUPER_ADMIN) */
export const listUsers = () =>
  api.get('/auth/users').then((r) =>
    r.data.map((u) => ({
      ...u,
      // The record component is `isActive`; depending on the Jackson version it
      // can serialize as either key, so accept both rather than guess.
      active: u.isActive ?? u.active ?? false,
    })),
  )

/** PATCH /auth/users/{id}/disable (SUPER_ADMIN) */
export const disableUser = (userId) =>
  api.patch(`/auth/users/${userId}/disable`).then((r) => r.data)
