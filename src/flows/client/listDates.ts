import { proto, WASocket } from '@whiskeysockets/baileys'
import { DateRepository } from '../../repositories/date'
import { createCardDate } from '../../services/createCardDate'

export const listDates = async (sock: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  const clientNumber = messageInfo.key.remoteJid?.split('@')[0] as string

  // TODO: Solo debe haber una cita por cliente
  const listDate = await DateRepository.getClientDates(clientNumber)
  if (listDate.length === 0) {
    await sock.sendMessage(from!, { text: 'No tienes citas creadas todavía.' })
    return
  }

  // Dibujar la card de la cita. Solo se puede tener una cita por atender por cliente
  const image = createCardDate(listDate[0])

  await sock.sendMessage(from!, { image: image })
}
