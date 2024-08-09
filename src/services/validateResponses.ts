import { askToAI } from './ai'
import { Session, SessionDoctorHorario } from '../types/session.interface'
import { proto, WASocket } from '@whiskeysockets/baileys'
import { ScheduleRepository } from '../repositories/schedule'

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

export const validateDatesInSchedule = async (payLoad: SessionDoctorHorario, sock: WASocket, from: string, session: Session) => {
  const doctorSchedule = await ScheduleRepository.getSchedule()
  const horario = doctorSchedule.map(({ day, init, end }) => (`${day}: ${init}-${end}`))
  const prompt = `
  Eres un asistente chatbot de un dentista.
  Este es su horario actual: ${JSON.stringify(horario)}
  Debes verificar que los datos que ha mandado el usuario estén dentro del horario del dentista.
  Este es el mensaje del usuario: ${`${payLoad.day} ${payLoad.start}-${payLoad.end}`}
  - aceptar: cuando los datos del dentista estén dentro del horario del dentista
  - salir: cuando los datos del dentista no estén dentro del horario del dentista
  Respuesta ideal: (salir|aceptar)
  `

  console.log(prompt)
  const option = await askToAI(prompt) as string
  console.log(option)

  if (option.toLocaleLowerCase() === 'salir') {
    console.log('Saliendo del flujo')
    session.step = 0
    session.flow = ''
    sock.sendMessage(from!, { text: 'Lo siento, no podemos cancelar las citas porque los datos que has ingresado no están dentro tu horario.' })
    return true
  }

  return false
}