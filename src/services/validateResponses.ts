import { askToAI } from './ai'
import { Session, SessionClientDate, SessionDoctorHorario } from '../types/session.interface'
import { proto, WASocket } from '@whiskeysockets/baileys'
import { ScheduleRepository } from '../repositories/schedule'
import { DateRepository } from '../repositories/date'

export const validateClientResponses = async (sock: WASocket, session: Session, messageInfo: proto.IWebMessageInfo, dataType: string) => {
  const from = messageInfo.key.remoteJid as string
  const messageClient = messageInfo.message?.conversation || ''
  const promptClient = `
  Eres un bot de apoyo para un dentista y estás creado una cita.
  Si el mensaje del cliente${dataType}, responde con la acción salir.
  Caso contrario, responde con la acción aceptar.
  Este es el mensaje del usuario: ${messageClient}
  Respuesta ideal: (salir|aceptar)
  `

  const option = await askToAI(promptClient) as string

  if (option.toLocaleLowerCase() === 'salir') {
    console.log('Saliendo del flujo')
    session.flow = ''
    session.step = 0
    sock.sendMessage(from!, { text: 'Lo siento, no podemos agendar la cita porque has ingresado un dato incorrecto.' })
    return true
  }
  return false
}

export const validateDoctorResponses = async (sock: WASocket, session: Session, messageInfo: proto.IWebMessageInfo, dataType: string) => {
  const from = messageInfo.key.remoteJid as string
  const messageClient = messageInfo.message?.conversation || ''
  const promptClient = `
  Eres un bot de apoyo para un dentista y estás solicitando datos al usuario.
  Si el mensaje del usuario${dataType}, responde con la acción salir.
  Caso contrario, responde con la acción aceptar.
  Este es el mensaje del usuario: ${messageClient}
  Respuesta ideal: (salir|aceptar)
  `

  const option = await askToAI(promptClient) as string

  if (option.toLocaleLowerCase() === 'salir') {
    console.log('Saliendo del flujo')
    session.flow = ''
    session.step = 0
    sock.sendMessage(from!, { text: 'Lo siento, no podemos cancelar la cita porque has ingresado un dato incorrecto.' })
    return true
  }

  return false
}

export const intervalCancelDateInSchedule = async (payLoad: SessionDoctorHorario, sock: WASocket, from: string, session: Session) => {
  const date = new Date(`${payLoad.day}T05:00:00.000Z`)
  const day = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)

  const doctorSchedule = await ScheduleRepository.getByDay(day)

  if (doctorSchedule.length <= 0) {
    session.step = 0
    session.flow = ''
    sock.sendMessage(from!, { text: 'Lo siento, no podemos cancelar las citas porque ese día usted no trabaja.' })
    return false
  }

  const infLimit = doctorSchedule.shift()?.init as string
  const supLimit = doctorSchedule.pop()?.end as string

  if (`${payLoad.start}:00` >= infLimit && `${payLoad.end}:00` <= supLimit) {
    return true
  }

  session.step = 0
  session.flow = ''
  sock.sendMessage(from!, { text: 'Lo siento, no podemos cancelar las citas porque no está dentro del horario.' })
  return false
}

export const dateIsFree = async (session: Session, dataClient: SessionClientDate, from: string, sock: WASocket) => {
  const dates = await DateRepository.getByDayAndHour(dataClient.day, dataClient.hour)
  console.log(dates)
  if (dates.length > 0) {
    session.step = 0
    session.flow = ''
    sock.sendMessage(from!, { text: 'Lo siento, no podemos agendar la cita porque la hora elegida ya está ocupada.' })
    return false
  }

  return true
}

export const dateInWorkHours = async (session: Session, dataClient: SessionClientDate, from: string, sock: WASocket) => {
  const date = new Date(`${dataClient.day}T05:00:00.000Z`)
  const day = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
  const hours = await ScheduleRepository.getByDay(day)
  const hour = `${dataClient.hour}:00`

  for (const { init, end } of hours) {
    if (init <= hour && hour < end) {
      return true
    }
  }

  session.step = 0
  session.flow = ''
  sock.sendMessage(from!, { text: 'Lo siento, no podemos agendar la cita porque la hora elegida no está dentro del horario del doctor.' })
  return false
}

export const dateIsPast = async (session: Session, dataClient: SessionClientDate, from: string, sock: WASocket) => {
  const date = new Date(`${dataClient.day}T05:00:00.000Z`)
  const day = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
  const hour = dataClient.hour

  const actualDay = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date())
  const actualHour = new Intl.DateTimeFormat('es-ES', { hour: 'numeric', minute: 'numeric' }).format(new Date())

  if (day === actualDay) {
    if (actualHour > hour) {
      session.step = 0
      session.flow = ''
      sock.sendMessage(from!, { text: 'Lo siento, no podemos agendar la cita porque la fecha y hora elegida ya ha pasado.' })
      return true
    }
  }

  return false
}
