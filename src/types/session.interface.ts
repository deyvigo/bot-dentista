import { ClientFlows, DoctorFlows } from "./utils.types"

export interface Session {
  step: number,
  flow: DoctorFlows | ClientFlows | '',
  payload: SessionDoctorHorario | SessionClientDate | SessionDoctorServices | {}
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

export interface SessionDoctorServices {
  name: string,
  price: number,
}
