import { proto, WASocket } from '@whiskeysockets/baileys'
import { DateRepository } from '../../repositories/date'
import { Session } from '../../types/session.interface'
import { formatDate } from '../../services/formateDate'

export const listDates = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageInfoText = messageInfo.message?.conversation || ''

  const clientNumber = messageInfo.key.remoteJid?.split('@')[0] as string

  // TODO: Solo debe haber una cita por cliente
  const listDate = await DateRepository.getClientDates(clientNumber)
  if (listDate.length === 0) {
    await sock.sendMessage(from!, { text: 'No tienes citas creadas todavía.' })
    return
  }

  const message = listDate.map(({ day, hour, doctor }) => {
    const date = new Date(day)
    return `${formatDate(date)}: ${hour} - ${doctor}`
  })
  await sock.sendMessage(from!, { text: message.join('\n') })
}