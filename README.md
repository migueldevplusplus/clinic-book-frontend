# ClinicBook — Frontend

Web interface for **ClinicBook**, a medical appointment management system. It consumes the REST API provided by the [ClinicBook backend](https://github.com/migueldevplusplus/clinic-book-app), built with Spring Boot and JWT authentication, and displays a different interface depending on the authenticated user's role.

## Stack

* **React 18** + **Vite 5**
* **React Router v6** — routing and role-based route protection
* **Axios** — HTTP client with token interceptor
* **Tailwind CSS 3** — styling
* **Context API** — authentication state management

## Getting Started

Requires **Node.js 18+** and the backend running on `localhost:8080`.

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Starts the development server with hot reload    |
| `npm run build`   | Builds the application for production in `dist/` |
| `npm run preview` | Serves the production build locally              |

### Backend

The frontend expects the API to be available at:

```text
http://localhost:8080/api
```

To use a different API URL, copy `.env.example` to `.env` and update:

```env
VITE_API_URL=http://localhost:8080/api
```

The backend already has CORS configured for `http://localhost:5173`, so no proxy or additional configuration is required.

If the frontend runs on a different port, that origin must also be added to the backend's `SecurityConfig`.

## Authentication

The JWT is stored **only in memory** using React state. It is never stored in `localStorage` or cookies.

An Axios interceptor automatically attaches the token to authenticated requests:

```text
Authorization: Bearer <token>
```

Because the token is stored in memory, **the session ends when the page is refreshed**. This is intentional behavior.

If the backend returns `401 Unauthorized` for any request other than login, the current session is discarded and the user is redirected to `/login`.

## Roles and Screens

After logging in, each role is redirected to its corresponding main screen. Users are also prevented from accessing routes that do not belong to their role.

| Role           | Home                         | Screens                                                                           |
| -------------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `PATIENT`      | `/doctors`                   | Search doctors · Doctor profile and schedule · Book appointment · My appointments |
| `DOCTOR`       | `/doctor/agenda`             | Daily agenda · Upcoming appointments · My schedule                                |
| `RECEPTIONIST` | `/receptionist/appointments` | All appointments · Create appointment                                             |
| `SUPER_ADMIN`  | `/admin`                     | User management · Doctor and receptionist registration                            |

### Routes

```text
/login                         Public
/register                      Public — patient registration

/doctors                       PATIENT
/doctors/:id                   PATIENT
/doctors/:id/book?date=        PATIENT
/appointments                  PATIENT

/doctor/agenda                 DOCTOR
/doctor/upcoming               DOCTOR
/doctor/schedule               DOCTOR

/receptionist/appointments     RECEPTIONIST
/receptionist/appointments/new RECEPTIONIST

/admin                         SUPER_ADMIN
```

## Project Structure

```text
src/
├── api/
│   ├── client.js
│   ├── auth.js
│   ├── doctors.js
│   ├── patients.js
│   └── appointments.js
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── AppointmentItem.jsx
│   └── ProtectedRoute.jsx
│
├── context/
│   └── AuthContext
│
├── hooks/
│   ├── useAsync
│   └── useDebounced
│
├── lib/
│   ├── constants.js
│   └── format.js
│
└── pages/
    ├── auth/
    ├── patient/
    ├── doctor/
    ├── receptionist/
    └── admin/
```

### API Layer

The `api/` directory contains the Axios client and a separate module for each backend resource:

* `client.js` — base URL, authentication interceptor, and API error handling
* `auth.js` — login, registration, user management, and deactivation
* `doctors.js` — doctor search, profiles, and schedules
* `patients.js` — patient search and registration
* `appointments.js` — availability, booking, and appointment status changes

## Implementation Details

### `useAsync`

The `useAsync` hook centralizes loading, error, and retry handling for API requests.

Screens that fetch data use this hook to provide consistent loading states and error handling instead of leaving the interface blank when a request fails.

### IDs and Authentication

User-specific IDs are not manually entered into forms.

The authenticated user's `patientId` or `doctorId` is obtained from the JWT. In the receptionist interface, patients are searched by name or email and selected from the results; the corresponding UUID is sent to the backend internally.

### Enums

Backend enum values are centralized in `lib/constants.js`.

The frontend keeps the exact values expected by the API while providing Spanish labels for the user interface.

This includes:

* Roles
* Specialties
* Days of the week
* Appointment statuses

### Date and Time Formatting

The backend uses:

* `LocalDate` → `YYYY-MM-DD`
* `LocalTime` → `HH:mm:ss`

The frontend formats these values for display using `lib/format.js`.

Times are displayed as `HH:mm`, while dates are displayed using Spanish localized formatting.

Appointment end times are calculated using the doctor's consultation duration.

## API Notes

Some relevant details of the backend contract:

* Appointment status changes use **`PATCH`** endpoints (`/confirm`, `/complete`, `/cancel`), not `POST` or `DELETE`.
* Availability is retrieved through `GET /appointments/{doctorId}?date=`, which returns the day's available and unavailable time slots.
* `GET /doctors` without parameters returns all doctors; `?specialty=` can be used to filter by specialty.
* Patient registration uses `POST /patients`, not `/auth/patient`.
* The user management response tolerates both `isActive` and `active` boolean field names depending on how the backend record is serialized by Jackson.

## Current Status

The frontend builds successfully with:

```bash
npm run build
```

The screens have been implemented against the backend's actual API contract by reviewing its controllers and endpoints.

### Integration Testing

The patient flow has been verified end-to-end against the running backend:

| Check | Result |
| ----- | ------ |
| `POST /auth/signup` and `POST /auth/login` | Return `{ token, fullName, userId, role }` |
| `GET /doctors` | `200 OK` with the expected payload |
| `GET /appointments/{doctorId}?date=` | Slots serialize as `{ time, available }` |
| `POST /appointments` | `201 Created`, and the booked slot flips to `available: false` |
| `GET /appointments/my` | Returns the new appointment |
| `PATCH /appointments/{id}/cancel` | `200 OK`, status becomes `CANCELLED` |
| Wrong `endTime` for the doctor's duration | Rejected with `400` |
| Role-guarded endpoint from the wrong role | Rejected with `403` |
| Request without a token | Rejected with `401` |
| CORS preflight from `http://localhost:5173` | Allows the `Authorization` header |

All error responses follow the `{ message, value, now }` shape the client parses.

Still unverified, since both require credentials for those roles:

* The boolean key returned by `GET /auth/users` — the client accepts either
  `isActive` or `active`, so it works regardless.
* `DayOfWeek` serialization on `POST /doctors/schedules`, expected to be
  `"MONDAY"`.
