import { createSchedule, deleteSchedule } from '../../api/doctors'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import ScheduleManager from '../../components/ScheduleManager'

export default function SchedulePage() {
  const { user } = useAuth()
  // A doctor's id equals their user id, so the token identifies whose schedule
  // this is. The write endpoints take it from the token as well.
  const doctorId = user?.userId

  return (
    <>
      <PageHeader
        title="Mis horarios"
        subtitle="Define los bloques en los que atiendes cada semana"
      />

      <ScheduleManager
        doctorId={doctorId}
        onCreate={createSchedule}
        onDelete={deleteSchedule}
        emptyMessage="Sin bloques de atención, los pacientes no pueden agendar contigo."
      />
    </>
  )
}
