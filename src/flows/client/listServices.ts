import { proto, WASocket } from '@whiskeysockets/baileys'
import { ServiceRepository } from '../../repositories/service'
import { drawCardServices } from '../../services/createCardServices'

export const listServices = async (sock: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const services = await ServiceRepository.getServices()
  if (services.length === 0) {
    await sock.sendMessage(from!, { text: 'No hay servicios disponibles.' })
    return
  }

  const imgBuffer = drawCardServices(services)

  await sock.sendMessage(from!, { text: 'Estos son los servicios disponibles:' })
  await sock.sendMessage(from!, { image: imgBuffer })
}
