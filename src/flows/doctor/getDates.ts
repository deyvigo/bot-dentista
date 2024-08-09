import { proto, WASocket } from '@whiskeysockets/baileys'
import { ClientRepository } from '../../repositories/client'
import { DateRepository } from '../../repositories/date'
import { Session } from '../../types/session.interface'
import { WeekDays } from '../../types/utils.types'

export const getDates = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  // IA para detectar el día
  const day = messageText as WeekDays

  const dates = await DateRepository.getDoctorDates(day)
  const clients = await ClientRepository.getClients()
  if (dates.length === 0) {
    await sock.sendMessage(from!, { text: 'No hay horarios de doctores en el sistema' })
  } else {
    const message = dates.map(({ day, init, end, id_client: idClient }) => {
      const client = clients.find(({ id_client }) => id_client === idClient)
      return `-${day}: ${init} - ${end} - ${client?.fullname}`
    })
    await sock.sendMessage(from!, { text: JSON.stringify(message) })
  }
}
