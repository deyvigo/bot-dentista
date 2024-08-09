import { WeekDays } from './utils.types'

export interface Session {
  step: number,
  flow: string,
  payload: SessionDoctorHorario | SessionClientDate | {}
}

export interface SessionDoctorHorario {
  day: string,
  start: string,
  end: string,
}

export interface SessionClientDate {
  day: string,
  hour: string,
  dni: string,
  fullname: string
}
