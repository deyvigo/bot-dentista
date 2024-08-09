import { RowDataPacket } from 'mysql2'
import { dbConnection } from './../services/connection'

interface Doctor extends RowDataPacket {
  id_doctor: string,
  number_phone: string,
  name: string,
  last_name: string
}

export class DoctorRepository {
  // To see doctors in system
  static getDoctors = async () => {
    const query = 'SELECT * FROM doctor;'
    const [results] = await dbConnection.query<Doctor[]>(query)
    return results
  }
}
