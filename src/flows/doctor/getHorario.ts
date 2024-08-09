import { proto, WASocket } from "@whiskeysockets/baileys";
import { Session } from "../../types/session.interface";
import { ScheduleRepository } from "../../repositories/schedule";
import { ScheduleToImg } from "../../types/schedule.interfaces";
import { createScheduleImage } from "../../services/createSchedule";

export const horarioDoctor = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const schedule = await ScheduleRepository.getSchedule()
  if (schedule.length === 0) {
    await sock.sendMessage(from!, { text: 'No hay horarios de doctores en el sistema' })
    return
  }

  await sock.sendMessage(from!, { text: 'Este es tu horario de trabajo:' })

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
