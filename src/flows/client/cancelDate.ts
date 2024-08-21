import { proto, WASocket } from '@whiskeysockets/baileys'
import { ClientRepository } from '../../repositories/client'
import { DateRepository } from '../../repositories/date'
import { DoctorRepository } from '../../repositories/doctor'

export const cancelDate = async (sock: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const userNumber = messageInfo.key.remoteJid?.split('@')[0] as string
  const from = messageInfo.key.remoteJid as string

  const user = await ClientRepository.getClientByNumber(userNumber)
  if (user.length === 0) {
    sock.sendMessage(from!, { text: 'Estás interactuando con el bot por primera vez.' })
    return
  }

  const message = await DateRepository.deleteDateClient(user[0].id_client)

  const doctor = await DoctorRepository.getDoctors()
  const doctorNumber = doctor[0].number_phone
  const doctorJid = `${doctorNumber}@s.whatsapp.net`

  if (message === 'Cita eliminada') {
    await sock.sendMessage(doctorJid!, { text: `Cliente ${user[0].fullname} ha cancelado la cita.` })
  }

  await sock.sendMessage(from!, { text: message })
}
