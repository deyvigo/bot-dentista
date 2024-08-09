export const formatDate = (date: Date) => {
  const dayOfWeek = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
  const day = date.getDate()
  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date)
  const year = date.getFullYear()
  return `${dayOfWeek}, ${day} de ${month} de ${year}`
}