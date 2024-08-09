import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session } from '../../types/session.interface'
import { ScheduleRepository } from '../../repositories/schedule'
import { createScheduleImage } from '../../services/createSchedule'
import { ScheduleToImg } from '../../types/schedule.interfaces'

export const doctorSchedule = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageInfoText = messageInfo.message?.conversation || ''

  const schedule = await ScheduleRepository.getSchedule()
  if (schedule.length === 0) {
    await sock.sendMessage(from!, { text: 'No hay horarios definidos.' })
    return
  }

  await sock.sendMessage(from!, { text: 'Este es el horario de trabajo del dentista:' })

  // TODO: Crear una imagen con el horario de trabajo del dentista usando canvas
  const scheduleFormat: ScheduleToImg[] = schedule.map(({ day, init, end }) => {
    return {
      day,
      init,
      end
    }
  })

  const imgBuffer = createScheduleImage(scheduleFormat)

  await sock.sendMessage(from!, { image: imgBuffer })
}