import { RowDataPacket } from 'mysql2'
import { WeekDays } from './utils.types'

export interface ScheduleCreate {
  day: WeekDays,
  init: string,
  end: string,
  id_doctor: string
}

export interface Schedule extends RowDataPacket {
  id_schedule: string,
  day: WeekDays,
  init: string,
  end: string,
  id_doctor: string
}

export interface ScheduleToImg {
  day: WeekDays,
  init: string,
  end: string
}