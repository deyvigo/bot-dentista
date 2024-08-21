import { RowDataPacket } from 'mysql2'
import { DateState } from './utils.types'

export interface Date extends RowDataPacket {
  id_date: string,
  day: string,
  hour: string,
  state: DateState,
  id_doctor: string,
  id_client: string,
}

export interface DateClient extends RowDataPacket {
  id_date: string,
  day: string,
  hour: string,
  dni: string,
  fullname: string,
  doctor: string,
}

export interface DateCreate {
  day: string,
  hour: string,
  state: DateState,
  id_doctor: string,
  id_client: string,
}
