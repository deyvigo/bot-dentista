import { WASocket, proto } from '@whiskeysockets/baileys'
import { Session } from '../../types/session.interface'
import { askToAI } from '../../services/ai'

export const queries = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Responde a la pregunta del dentista.
  La pregunta es: ${messageText}
  Tu respuesta debe ser corta y concisa.
  No puedes mandar una respuesta vacía.
  `

  const aiResponse = await askToAI(prompt) as string

  await sock.sendMessage(from!, { text: aiResponse  })
}