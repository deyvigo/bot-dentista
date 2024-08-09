import { proto, WASocket } from '@whiskeysockets/baileys'
import { doctorFlow } from './doctor/main'
import { DoctorRepository } from '../repositories/doctor'
import { clientFlow } from './client/main'

export const mainFlow = async (sock: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid
  const receiver = from?.split('@')[0]
  const results = await DoctorRepository.getDoctors()
  const doctor = results.map(d => d.number_phone)

  if (doctor.includes(receiver ?? '')) {
    await doctorFlow(sock, messageInfo)
    return
  }

  if (!messageInfo.key.fromMe) {
    await clientFlow(sock, messageInfo)
  }
}