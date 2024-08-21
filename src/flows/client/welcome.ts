import { proto, WASocket } from "@whiskeysockets/baileys"
import { askToAI } from "../../services/ai"

export const welcomeClient = async (sock: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Solo tienes dos respuestas posibles:
  - saludo: si el mensaje del usuario es un saludo
  - disculpas: si el mensaje del usuario es cualquier otra cosa
  Este es el mensaje del usuario: ${messageText}
  Debes responder solo la acción que el usuario quiere realizar.
  `

  const aiResponse = await askToAI(prompt) as string

  if (aiResponse === 'saludo') {
    await sock.sendMessage(from!, { text: 'Hola! Soy un asistente de la consultora dentista Sonrisa Colgate. ¿En qué puedo ayudarte hoy?' })
    return
  }
  await sock.sendMessage(from!, { text: 'Disculpa, no puedo responder a ese mensaje.' })
}
