import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session } from '../../types/session.interface'
import { ServiceRepository } from '../../repositories/service'

export const listServices = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const services = await ServiceRepository.getServices()
  if (services.length === 0) {
    await sock.sendMessage(from!, { text: 'No hay servicios disponibles.' })
    return
  }
  await sock.sendMessage(from!, { text: 'Estos son los servicios disponibles:' })

  // TODO: Crear una imagen de la lista de servicios usando canvas
  const servicesText = services.map(service => `${service.name} - S/${service.cost}`).join('\n')
  await sock.sendMessage(from!, { text: servicesText })
}