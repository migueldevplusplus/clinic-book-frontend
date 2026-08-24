import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ROLE_HOME } from './lib/constants'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import DoctorSearchPage from './pages/patient/DoctorSearchPage'
import DoctorProfilePage from './pages/patient/DoctorProfilePage'
import BookingPage from './pages/patient/BookingPage'
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage'

import AgendaPage from './pages/doctor/AgendaPage'
import UpcomingPage from './pages/doctor/UpcomingPage'
import SchedulePage from './pages/doctor/SchedulePage'

import AppointmentsPage from './pages/receptionist/AppointmentsPage'
import NewAppointmentPage from './pages/receptionist/NewAppointmentPage'

import AdminPage from './pages/admin/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

/** Sends "/" to wherever the current role belongs. */
function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[role] ?? '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomeRedirect />} />

        {/* Patient */}
        <Route
          path="/doctors"
          element={<ProtectedRoute allow={['PATIENT']}><DoctorSearchPage /></ProtectedRoute>}
        />
        <Route
          path="/doctors/:id"
          element={<ProtectedRoute allow={['PATIENT']}><DoctorProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/doctors/:id/book"
          element={<ProtectedRoute allow={['PATIENT']}><BookingPage /></ProtectedRoute>}
        />
        <Route
          path="/appointments"
          element={<ProtectedRoute allow={['PATIENT']}><MyAppointmentsPage /></ProtectedRoute>}
        />

        {/* Doctor */}
        <Route
          path="/doctor/agenda"
          element={<ProtectedRoute allow={['DOCTOR']}><AgendaPage /></ProtectedRoute>}
        />
        <Route
          path="/doctor/upcoming"
          element={<ProtectedRoute allow={['DOCTOR']}><UpcomingPage /></ProtectedRoute>}
        />
        <Route
          path="/doctor/schedule"
          element={<ProtectedRoute allow={['DOCTOR']}><SchedulePage /></ProtectedRoute>}
        />

        {/* Receptionist */}
        <Route
          path="/receptionist/appointments"
          element={<ProtectedRoute allow={['RECEPTIONIST']}><AppointmentsPage /></ProtectedRoute>}
        />
        <Route
          path="/receptionist/appointments/new"
          element={<ProtectedRoute allow={['RECEPTIONIST']}><NewAppointmentPage /></ProtectedRoute>}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={<ProtectedRoute allow={['SUPER_ADMIN']}><AdminPage /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
