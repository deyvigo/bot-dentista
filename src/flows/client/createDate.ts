import { proto, WASocket } from '@whiskeysockets/baileys'
import { ClientRepository } from '../../repositories/client'
import { Session, SessionClientDate } from '../../types/session.interface'
import { DateRepository } from '../../repositories/date'
import { DoctorRepository } from '../../repositories/doctor'
import { askToAI } from '../../services/ai'
import { formatDate } from '../../services/formateDate'
import { validateClientResponses } from '../../services/validateResponses'

export const createDate = async (sock: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageInfoText = messageInfo.message?.conversation || ''
  const number_client = messageInfo.key.remoteJid?.split('@')[0] as string

  const clientPayload = session.payload as SessionClientDate

  // TODO: Comprobar si el cliente ya tiene una cita
  // NOTA: Si se quiere que el cliente pueda tener más de una cita, se debe usar el dni para la consulta en lugar del número de teléfono
  const clientDate = await DateRepository.getClientDates(number_client)

  if (clientDate.length > 0) {
    await sock.sendMessage(from!, { text: 'Ya tienes una cita. Por favor, cancelala antes de crear una nueva.' })
    session.flow = ''
    session.step = 0
    return
  }

  switch (session.step) {
    case 0:
      await sock.sendMessage(from!, { text: '¡Claro!, Creemos una cita con el dentista.' })
      await sock.sendMessage(from!, { text: 'Recuerda que no se puede sacar una cita para el mismo día.' })
      await sock.sendMessage(from!, { text: '¿Cuál es el día?' })
      session.step = 1
      break
    case 1:
      if (await validateClientResponses(sock, session, messageInfo, `, siendo hoy ${formatDate(new Date())}, no tiene relación con días o fechas o si es el mismo día que hoy`)) return

      clientPayload.day = messageInfoText.toLocaleLowerCase()
      session.payload = clientPayload
      await sock.sendMessage(from!, { text: '¿Cuál es la hora?' })
      session.step = 2
      break
    case 2:
      if (await validateClientResponses(sock, session, messageInfo, ' no tiene relación con horas')) return

      clientPayload.hour = messageInfoText
      session.payload = clientPayload
      await sock.sendMessage(from!, { text: '¿Cuál es su dni?' })
      session.step = 3
      break
    case 3:
      if (await validateClientResponses(sock, session, messageInfo, ' no tiene relación con dni (una cadena de 8 dígitos)')) return

      clientPayload.dni = messageInfoText
      session.payload = clientPayload
      await sock.sendMessage(from!, { text: '¿Cuál es su nombre completo?' })
      session.step = 4
      break
    case 4:
      if (await validateClientResponses(sock, session, messageInfo, ' no contiene un nombre')) return

      clientPayload.fullname = messageInfoText
      session.payload = clientPayload
      await sock.sendMessage(from!, { text: 'Gracias! Ahora crearé la cita' })

      const prompt = `
      Siendo hoy ${formatDate(new Date())}.
      Tu tarea principal es analizar la información enviada por el cliente.
      Información del cliente: ${JSON.stringify(clientPayload)}
      Debes generar un objeto JSON con la siguiente estructura teniendo en cuenta la información del cliente:
      {
        "fullname": "Nombre completo del cliente",
        "dni": "DNI del cliente (cadena de 8 dígitos)",
        "day": "Día de la cita en formato YYYY-MM-DD. Llevar al día más cercano en el futuro",
        "hour": "Hora de la cita en formato HH:MM (24 horas)",
      }
      Objeto JSON generado:
      `
      const data = await askToAI(prompt) as string
      const jsonData = await JSON.parse(data) as SessionClientDate

      const cliente = await ClientRepository.getClientByNumber(number_client)
      if (cliente.length === 0) {
        await ClientRepository.createClient({ fullname: jsonData.fullname, phone: number_client, dni: jsonData.dni })
      }

      const client = await ClientRepository.getClientByNumber(number_client)
      const id_client = client[0].id_client
      const doctor = await DoctorRepository.getDoctors()
      const id_doctor = doctor[0].id_doctor // Hay un solo doctor

      // state = libre para cuando la cita la crea un cliente. ocupado cuando el doctor la va a cancelar
      const result = await DateRepository.createDate({ day: jsonData.day, hour: jsonData.hour, state: 'libre', id_doctor, id_client })

      await sock.sendMessage(from!, { text: result })

      if (result === 'Cita creada') {
        const number_doctor = doctor[0].phone
        // TODO: construir el jid del doctor
        const doctorJid = `${number_doctor}@s.whatsapp.net`
        // TODO: para cuando consiga un número de doctor
        // await sock.sendMessage(doctorJid, { text: 'Doctor, un cliente ha agendado una cita. Por favor, revisa la cita.' })
      }

      // Resetear el flujo
      session.flow = ''
      session.step = 0
      session.payload = {}
      break
  }
}
