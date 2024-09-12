import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionDoctorHorario } from '../../types/session.interface'
import { welcolmeDoctor } from './welcome'
import { horarioDoctor } from './getHorario'
import { getDates } from './getDates'
import { cancelDate } from './cancelDate'
import { askToAI } from '../../services/ai'
import { queries } from './queries'
import { DoctorFlows } from '../../types/utils.types'
import { addService } from './addService'

// Estado global para rastrear la conversación del usuario
const userSessions = new Map<string, Session>()

// provisional
const flows = ['saludo', 'horario', 'citas', 'cancelar', 'consultas', 'servicios']

export const doctorFlow = async (sock: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Tus respuestas son cortas y concisas.
  Tienes una lista de acciones disponibles para el dentista:
  - saludo: para saludar al usuario
  - horario: para solicitar el horario de trabajo del doctor
  - citas: para ver las citas que tiene que atender el dentista
  - cancelar: para cancelar citas
  - servicios: para agregar un nuevo servicio
  - consultas: para realizar consultas sobre odontología
  Este es el mensaje del dentista: ${messageText}
  Debes responder solo la accion que el dentista quiere realizar.
  Si el mensaje del dentista es un saludo, responde con la accion saludo.
  Si el mensaje del dentista no tiene relación con el servicio dental, responde con la accion saludo.
  La accion saludo es la de menor prioridad.
  Respuesta ideal: (saludo|horario|citas|cancelar|consultas)
  `

  // Obtener la sesión del usuario, o crear una nueva
  let session = userSessions.get(from) || { step: 0, flow: '', payload: {} }

  if (session.flow !== 'cancelar' && session.flow !== 'servicios') {
    session.flow = (await askToAI(prompt) as string).trim() as DoctorFlows
  }

  // Verificar si el mensaje es del propio bot
  if (messageInfo.key.fromMe) return

  // Detectar si el mensaje no cambia el flujo
  if (flows.includes(session.flow)) {
    session.flow = session.flow.toLocaleLowerCase().trim() as DoctorFlows
  }

  // TODO: Hacer un mapeo de mensajes a flujos
  switch (session.flow) {
    case 'saludo':
      await welcolmeDoctor(sock, messageInfo)
      break
    case 'horario':
      await horarioDoctor(sock, messageInfo, session)
      break
    case 'citas':
      await getDates(sock, messageInfo, session) // TODO: Draw
      break
    case 'cancelar':
      await cancelDate(sock, messageInfo, session)
      break
    case 'consultas':
      await queries(sock, messageInfo, session)
      break
    case 'servicios':
      await addService(sock, messageInfo, session)
      break
  }

  // Guardar la sesión actualizada
  userSessions.set(from, session)
}
