import { RowDataPacket } from 'mysql2'

export interface Service extends RowDataPacket{
  name: string
  cost: number
}