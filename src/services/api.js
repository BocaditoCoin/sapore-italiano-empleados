const API_URL = 'https://sapore-italiano-backend.vercel.app/api'

// Obtener todos los empleados
export async function getEmpleados() {
  const response = await fetch(`${API_URL}/empleados`)
  return response.json()
}

// Obtener empleado por ID
export async function getEmpleado(id) {
  const response = await fetch(`${API_URL}/empleados/${id}`)
  return response.json()
}

// Crear empleado
export async function createEmpleado(empleado) {
  const response = await fetch(`${API_URL}/empleados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empleado)
  })
  return response.json()
}

// Actualizar empleado
export async function updateEmpleado(id, empleado) {
  const response = await fetch(`${API_URL}/empleados/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empleado)
  })
  return response.json()
}

// Eliminar empleado
export async function deleteEmpleado(id) {
  const response = await fetch(`${API_URL}/empleados/${id}`, {
    method: 'DELETE'
  })
  return response.json()
}

// Obtener nóminas
export async function getNominas() {
  const response = await fetch(`${API_URL}/nominas`)
  return response.json()
}

// Obtener nóminas por período
export async function getNominasPeriodo(mes, ano) {
  const response = await fetch(`${API_URL}/nominas/periodo/${mes}/${ano}`)
  return response.json()
}

// Crear nómina
export async function createNomina(nomina) {
  const response = await fetch(`${API_URL}/nominas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nomina)
  })
  return response.json()
}

// Obtener horarios/fichajes
export async function getHorarios() {
  const response = await fetch(`${API_URL}/horarios`)
  return response.json()
}

// Registrar fichaje
export async function createFichaje(fichaje) {
  const response = await fetch(`${API_URL}/horarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fichaje)
  })
  return response.json()
}

// Obtener fichajes de hoy
export async function getFichajesHoy() {
  const response = await fetch(`${API_URL}/horarios/hoy`)
  return response.json()
}

// Obtener estadísticas
export async function getStats() {
  const response = await fetch(`${API_URL}/stats`)
  return response.json()
}
