// Enum values mirror the backend exactly; only the labels are translated.

export const SPECIALTIES = [
  { value: 'GENERAL_MEDICINE', label: 'Medicina General' },
  { value: 'PEDIATRICS', label: 'Pediatría' },
  { value: 'CARDIOLOGY', label: 'Cardiología' },
  { value: 'DERMATOLOGY', label: 'Dermatología' },
  { value: 'GYNECOLOGY', label: 'Ginecología' },
  { value: 'OPHTHALMOLOGY', label: 'Oftalmología' },
  { value: 'ORTHOPEDICS', label: 'Traumatología' },
  { value: 'PSYCHIATRY', label: 'Psiquiatría' },
  { value: 'NEUROLOGY', label: 'Neurología' },
  { value: 'ENDOCRINOLOGY', label: 'Endocrinología' },
  { value: 'UROLOGY', label: 'Urología' },
  { value: 'OTOLARYNGOLOGY', label: 'Otorrinolaringología' },
  { value: 'ONCOLOGY', label: 'Oncología' },
]

export const specialtyLabel = (value) =>
  SPECIALTIES.find((s) => s.value === value)?.label ?? value

// java.time.DayOfWeek serializes as these names.
export const WEEKDAYS = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
]

export const weekdayLabel = (value) =>
  WEEKDAYS.find((d) => d.value === value)?.label ?? value

export const weekdayIndex = (value) =>
  WEEKDAYS.findIndex((d) => d.value === value)

export const STATUS_LABELS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
}

export const ROLE_LABELS = {
  PATIENT: 'Paciente',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Recepcionista',
  SUPER_ADMIN: 'Administrador',
}

// Where each role lands after logging in.
export const ROLE_HOME = {
  PATIENT: '/doctors',
  DOCTOR: '/doctor/agenda',
  RECEPTIONIST: '/receptionist/appointments',
  SUPER_ADMIN: '/admin',
}
