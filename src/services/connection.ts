import { createPool } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

export const dbConnection = createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
})

export const createDatabase = async () => {

  const queryClient = `
    create table if not exists client
    (
      id_client uuid         not null
          primary key,
      fullname  varchar(200) not null,
      phone     varchar(20)  not null,
      dni       varchar(8)   not null
    );
    `
  const queryDoctor = `
    create table if not exists doctor
    (
      id_doctor    uuid        not null
        primary key,
      number_phone varchar(20) not null,
      name         varchar(50) not null,
      last_name    varchar(50) not null
    );
    `

  const queryDate = `
    create table if not exists date
    (
      id_date   uuid        not null
        primary key,
      day       date        not null,
      hour      time        not null,
      state     varchar(20) not null,
      id_doctor uuid        not null,
      id_client uuid        not null,
      constraint date_client_id_client_fk
        foreign key (id_client) references client (id_client),
      constraint date_doctor_id_doctor_fk
        foreign key (id_doctor) references doctor (id_doctor)
    );
    `

  const querySchedule = `
    create table if not exists schedule
    (
      id_schedule uuid        not null
        primary key,
      day         varchar(20) not null,
      init        time        not null,
      end         time        not null,
      id_doctor   uuid        not null,
      constraint schedule_doctor_id_doctor_fk
        foreign key (id_doctor) references doctor (id_doctor)
    );
    `
  
  const queryService = `
    create table if not exists service
    (
      id_service uuid        not null
        primary key,
      name       varchar(70) not null,
      cost       double      not null,
      id_doctor  uuid        not null,
      constraint service_doctor_id_doctor_fk
        foreign key (id_doctor) references doctor (id_doctor)
    );
  `

  try {
    await dbConnection.query(queryClient)
    console.log('Tabla client creada')
    await dbConnection.query(queryDoctor)
    console.log('Tabla doctor creada')
    await dbConnection.query(queryDate)
    console.log('Tabla date creada')
    await dbConnection.query(querySchedule)
    console.log('Tabla schedule creada')
    await dbConnection.query(queryService)
    console.log('Tabla service creada')
  } catch (err) {
    console.error('Error creando la tabla messages:', err)
  }
}