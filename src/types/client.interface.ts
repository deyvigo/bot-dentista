import { RowDataPacket } from 'mysql2'

export interface Client extends RowDataPacket {
  id_client: string,
  fullname: string,
  phone: string,
  dni: string,
}

export interface ClientCreate {
  fullname: string,
  phone: string,
  dni: string,
}
