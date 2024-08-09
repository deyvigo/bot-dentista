import { WASocket, proto } from '@whiskeysockets/baileys'
import { Session, SessionDoctorHorario } from '../../types/session.interface'
import { DateRepository } from '../../repositories/date'
import { validateDatesInSchedule, validateDoctorResponses } from '../../services/validateResponses'
import { formatDate } from '../../services/formateDate'
import { askToAI } from '../../services/ai'
import { ClientRepository } from '../../repositories/client'
import { DoctorRepository } from '../../repositories/doctor'

export const cancelDate = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const doctorPayload = session.payload as SessionDoctorHorario

  switch (session.step) {
    case 0:
      await sock.sendMessage(from!, { text: '¡Claro!, Cancelemos las citas creadas.'})
      await sock.sendMessage(from!, { text: 'Qué día quieres cancelar.' })
      session.step = 1
      break
    case 1:
      if (await validateDoctorResponses(sock, session, messageInfo, `, siendo hoy ${formatDate(new Date())}; es "domingo" o no tiene relación con días y fechas`)) return

      doctorPayload.day = messageText.toLocaleLowerCase()
      session.payload = doctorPayload
      await sock.sendMessage(from!, { text: '¿Desde qué hora?' })
      session.step = 2
      break
    case 2:
      if (await validateDoctorResponses(sock, session, messageInfo, ' no tiene relación con horas')) return

      doctorPayload.start = messageText
      session.payload = doctorPayload
      await sock.sendMessage(from!, { text: '¿Hasta qué hora?' })
      session.step = 3
      break
    case 3:
      if (await validateDoctorResponses(sock, session, messageInfo, ' no tiene relación con horas')) return

      doctorPayload.end = messageText
      session.payload = doctorPayload
      
      // TODO: validar que el día y la hora estén dentro del horario del doctor
      if (await validateDatesInSchedule(doctorPayload, sock, from, session)) return

      await sock.sendMessage(from!, { text: '¡Gracias! Ahora cancelaré las citas.' })

      const prompt = `
      Siendo hoy ${formatDate(new Date())}.
      Tu tarea principal es analizar la información enviada por el dentista.
      Información del dentista: ${JSON.stringify(doctorPayload)}
      Debes generar un objeto JSON con la siguiente estructura teniendo en cuenta la información del dentista.
      Debes considerar intervalos de 1 hora de tiempo en cada objeto del arreglo:
      [
        {
          "day": "Día en formato YYYY-MM-DD. Llevar al día más cercano en el futuro",
          "start": "Hora de inicio en formato HH:MM (24 horas)",
          "end": "Hora final en formato HH:MM (24 horas)",
        },
      ]
      Objeto JSON generado:
      `
      const data = await askToAI(prompt) as string
      const jsonData = await JSON.parse(data) as SessionDoctorHorario[]

      console.log(jsonData)

      const dates = await DateRepository.getDoctorDates(jsonData[0].day)

      const doctor = await DoctorRepository.getDoctors()
      const id_doctor = doctor[0].id_doctor
      const placeholderUser = await ClientRepository.getClientByNumber('placeholder')
      const placeholder_id = placeholderUser[0].id_client
      const result = await DateRepository.cancelDayInterval(jsonData, id_doctor, placeholder_id)

      if (!result) {
        await sock.sendMessage(from!, { text: 'No se pudo cancelar las citas.' })
        session.step = 0
        session.payload = {}
        session.flow = ''
        return
      }

      if (result) {
        for (const date of dates) {
          const client = await ClientRepository.getClientById(date.id_client)
          const clientJid = `${client[0].phone}@s.whatsapp.net`
          await sock.sendMessage(clientJid!, { text: 'Tu cita ha sido cancelada.'})
        }
      }

      await sock.sendMessage(from!, { text: 'Las citas han sido canceladas.' })
      session.step = 0
      session.payload = {}
      session.flow = ''
      break
  }
}
