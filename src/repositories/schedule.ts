import { dbConnection } from './../services/connection'
import { Schedule, ScheduleCreate } from '../types/schedule.interfaces'

export class ScheduleRepository {
  static createEntry = async (data: ScheduleCreate) => {
    const query = 'INSERT INTO schedule (id_schedule, day, init, end, id_doctor) value (uuid(),?,?,?,?);'
    try {
      const result = await dbConnection.query(query, [data.day, data.init, data.end, data.id_doctor])
      console.log(result)
      return 'Creado exitosamente.'
    } catch (err) {
      return 'No se pudo creo el horario.'
    }
  }

  static getSchedule = async () => {
    const query = 'SELECT * FROM schedule;'
    try {
      const [result] = await dbConnection.query<Schedule[]>(query)
      return result
    } catch (err) {
      return []
    }
  }

  static getByDay = async (day: string) => {
    const query = 'SELECT * FROM schedule WHERE day = ?;'
    try {
      const [result] = await dbConnection.query<Schedule[]>(query, [day])
      return result
    } catch (err) {
      return []
    }
  }
}
