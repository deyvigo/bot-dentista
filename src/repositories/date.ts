import { ResultSetHeader } from 'mysql2'
import { dbConnection } from '../services/connection'
import { Date, DateClient, DateCreate } from '../types/date.interface'
import { SessionDoctorHorario } from '../types/session.interface'

export class DateRepository {
  static getDoctorDates = async (day: string) => {
    try {
      const query = 'SELECT * FROM date WHERE day = ? AND state = "libre"'
      const [result] = await dbConnection.query<Date[]>(query, [day])
      return result
    } catch (error) {
      return []
    }
  }

  static cancelDayInterval = async (day: SessionDoctorHorario[], doctor_id: string, placeholder_id: string) => {
    const connection = await dbConnection.getConnection()
    try {
      await connection.beginTransaction()
      for (const interval of day) {
        const { day, start } = interval
        const querySelect = 'SELECT * FROM date WHERE day = ? AND hour = ?;'
        const [rows] = await connection.query<Date[]>(querySelect, [day, start])
        if (rows.length > 0) {
          const queryUpdate = 'UPDATE date SET state = "ocupado" WHERE day = ? AND hour = ? AND state = "libre";'
          await connection.query(queryUpdate, [day, start])
        } else {
          const queryInsert = 'INSERT INTO date (id_date, day, hour, state, id_doctor, id_client) VALUES (uuid(), ?, ?, "ocupado", ?, ?);'
          await connection.query(queryInsert, [day, start, doctor_id, placeholder_id])
        }
      }
      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      console.error(error)
      return false
    } finally {
      connection.release()
    }
  }

  static createDate = async (date: DateCreate) => {
    try {
      const query = 'INSERT INTO date (id_date, day, hour, state, id_doctor, id_client) VALUES (uuid(), ?, ?, ?, ?, ?)'
      const [result] = await dbConnection.query<ResultSetHeader>(query, [date.day, date.hour, date.state, date.id_doctor, date.id_client])
      if (result.affectedRows === 0) return 'No se pudo crear la cita'
      return 'Cita creada'
    } catch (error) {
      return 'No se pudo crear la cita'
    }
  }

  // state = por atender para que cuando pase la hora de la cita, pueda crear una nueva cita
  static getClientDates = async (number_client: string) => {
    try {
      const query = `
      SELECT d.id_date, d.day, d.hour, c.dni, c.fullname, CONCAT(dc.name, ', ', dc.last_name) as doctor
      FROM date d
      JOIN client c ON d.id_client = c.id_client
      JOIN doctor dc ON d.id_doctor = dc.id_doctor
      WHERE c.phone = ? AND d.state = 'por atender';
      `
      const [result] = await dbConnection.query<DateClient[]>(query, [number_client])
      return result
    } catch (error) {
      return []
    }
  }

  static deleteDateClient = async (id_client: string) => {
    try {
      const query = 'DELETE FROM date WHERE id_client = ? AND state = "por atender";'
      const [result] = await dbConnection.query<ResultSetHeader>(query, [id_client])
      if (result.affectedRows === 0) return 'No se pudo eliminar la cita'
      return 'Cita eliminada'
    } catch (error) {
      return 'No se pudo eliminar la cita'
    }
  }

  static getByDayAndHour = async (day: string, hour: string) => {
    try {
      const query = 'SELECT * FROM date WHERE day = ? AND hour = ?;'
      const [result] = await dbConnection.query<Date[]>(query, [day, hour])
      return result
    } catch (error) {
      return []
    }
  }
}
