import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionDoctorHorario } from '../../types/session.interface'
import { DoctorRepository } from '../../repositories/doctor'
import { WeekDays } from '../../types/utils.types'
import { ScheduleCreate } from '../../types/schedule.interfaces'
import { ScheduleRepository } from '../../repositories/schedule'

export const updateHorarioDoctor = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const doctor = await DoctorRepository.getDoctors()
  const id_doctor = doctor[0].id_doctor // Solo hay un doctor
  const messageText = messageInfo.message?.conversation || ''

  const doctorPayload = session.payload as SessionDoctorHorario

  switch (session.step) {
    case 0:
      await sock.sendMessage(from!, { text: '¿Cuál es la hora de inicio? Por favor, en formato "HH:MM".' })
      session.step = 1
      break
    case 1:
      doctorPayload.start = messageText
      session.payload = doctorPayload
      await sock.sendMessage(from!, { text: '¿Cuál es la hora de fin? Por favor, en formato "HH:MM".' })
      session.step = 2
      break
    case 2:
      doctorPayload.end = messageText
      session.payload = doctorPayload
      await sock.sendMessage(from!, { text: '¿Cuál es el día de la semana? Por favor, en formato "Lunes", "Martes", etc.' })
      session.step = 3
      break
    case 3:
      doctorPayload.day = messageText.toLocaleLowerCase() as WeekDays
      session.payload = doctorPayload
      await sock.sendMessage(from!, { text: 'Gracias, ahora crearé tu horario.' })
      const createSchedule: ScheduleCreate = { day: doctorPayload.day as WeekDays, init: doctorPayload.start, end: doctorPayload.end, id_doctor: id_doctor }
      await ScheduleRepository.createEntry(createSchedule)
      await sock.sendMessage(from!, { text: `Horario creado. ¡Felicidades!\n- ${doctorPayload.day}: ${doctorPayload.start} - ${doctorPayload.end}` })
      session.step = 0
      break
  }
}
