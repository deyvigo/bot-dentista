import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session } from '../../types/session.interface'
import { askToAI } from '../../services/ai'

export const welcolmeDoctor = async (sock: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Solo tienes dos respuestas posibles:
  - saludo: si el mensaje del dentista es un saludo
  - disculpas: si el mensaje del dentista es cualquier otra cosa
  Este es el mensaje del dentista: ${messageText}
  Debes responder solo la acción que el dentista quiere realizar.
  `

  // TODO: Agradecimiento del usuario
  const aiResponse = await askToAI(prompt) as string

  if (aiResponse === 'saludo') {
    await sock.sendMessage(from!, { text: 'Hola! Soy tu asistente inteligente. ¿En qué puedo ayudarte hoy?' })
    return
  }
  await sock.sendMessage(from!, { text: 'Disculpa, no puedo responder a ese mensaje.' })
}
