import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionClientDate } from '../../types/session.interface'
import { welcomeClient } from './welcome'
import { createDate } from './createDate'
import { listDates } from './listDates'
import { doctorSchedule } from './doctorSchedule'
import { cancelDate } from './cancelDate'
import { listServices } from './listServices'
import { queries } from './queries'
import { askToAI } from '../../services/ai'

// Estado global para rastrear la conversación del usuario
const userSessions = new Map<string, Session>()

// provisional
const flows = ['saludo', 'servicios', 'horario-doctor', 'consultas', 'solicitar-cita', 'cancelar-cita', 'citas-creadas']

export const clientFlow = async (sock: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation?.toLocaleLowerCase() || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Tus respuestas son cortas y concisas.
  Tienes una lista de acciones disponibles para el usuario:
  - saludo: para saludar al usuario
  - servicios: para listar los servicios disponibles por el consultorio dentista
  - horario-doctor: para solicitar el horario de trabajo de un doctor
  - consultas: para realizar consultas sobre odontología
  - solicitar-cita: para solicitar una cita con un doctor
  - cancelar-cita: para cancelar una cita con un doctor
  - citas-creadas: para ver las citas que el usuario ha realizado
  Este es el mensaje del usuario: ${messageText}
  Debes responder solo la accion que el usuario quiere realizar.
  Si el mensaje del usuario es un saludo, responde con la accion saludo.
  Si el mensaje del usuario no tiene relación con el servicio dental, responde con la accion saludo.
  La accion saludo es la de menor prioridad.
  Respuesta ideal: (saludo|servicios|horario-doctor|consultas|solicitar-cita|cancelar-cita|citas-creadas)
  `

  // Obtener la sesión del usuario, o crear una nueva
  let session = userSessions.get(from) || { step: 0, flow: '', payload: {} as SessionClientDate }

  // Si el flow es solicitar-cita, no hacer el prompt porque debe salir del flujo desde dentro de la función
  if (session.flow !== 'solicitar-cita') {
    session.flow = (await askToAI(prompt) as string).trim()
  }
  // Verificar si el mensaje es del propio bot
  if (messageInfo.key.fromMe) return

  // Detectar si el mensaje no cambia el flujo
  if (flows.includes(session.flow)) {
    session.flow = session.flow.toLocaleLowerCase().trim()
  }

  console.log('session.flow: ', session.flow)

  // TODO: Hacer un mapeo de mensajes a flujos
  switch (session.flow) {
    case 'saludo':
      await welcomeClient(sock, messageInfo)
      break
    case 'servicios':
      await listServices(sock, messageInfo)
      break
    case 'horario-doctor':
      await doctorSchedule(sock, messageInfo, session)
      break
    case 'consultas':
      await queries(sock, messageInfo, session)
      break
    case 'solicitar-cita':
      await createDate(sock, messageInfo, session)
      break
    case 'cancelar-cita':
      await cancelDate(sock, messageInfo)
      break
    case 'citas-creadas':
      await listDates(sock, messageInfo)
      break
  }

  // Guardar la sesión actualizada
  userSessions.set(from, session)
}
