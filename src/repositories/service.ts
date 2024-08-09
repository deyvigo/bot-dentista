import { dbConnection } from '../services/connection'
import { Service } from '../types/service.interface'

export class ServiceRepository {
  static getServices = async () => {
    try {
      const query = 'SELECT name, cost FROM service;'
      const [result] = await dbConnection.query<Service[]>(query)
      return result
    } catch (error) {
      return []
    }
  }
}