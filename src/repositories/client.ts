import { ResultSetHeader } from 'mysql2'
import { dbConnection } from '../services/connection'
import { Client, ClientCreate } from '../types/client.interface'

export class ClientRepository {
  static getClientById = async (id_client: string) => {
    try {
      const query = 'SELECT * FROM client WHERE id_client = ?;'
      const [result] = await dbConnection.query<Client[]>(query, [id_client])
      return result
    } catch (error) {
      return []
    }
  }

  static getClients = async () => {
    try {
      const query = 'SELECT * FROM client;'
      const [result] = await dbConnection.query<Client[]>(query)
      return result
    } catch (error) {
      return []
    }
  }

  static getClientByNumber = async (number: string) => {
    try {
      const query = 'SELECT * FROM client WHERE phone = ?;'
      const [result] = await dbConnection.query<Client[]>(query, [number])
      return result
    } catch (error) {
      return []
    }
  }

  static createClient = async (client: ClientCreate) => {
    try {
      const query = 'INSERT INTO client (id_client, phone, dni, fullname) VALUES (uuid(), ?, ?, ?);'
      const [result] = await dbConnection.query<ResultSetHeader>(query, [client.phone, client.dni, client.fullname])
      if (result.affectedRows === 0) return 'No se pudo crear el cliente.'
      return 'Cliente creado exitosamente.'
    } catch (error) {
      return 'No se pudo crear el cliente.'
    }
  }
}
