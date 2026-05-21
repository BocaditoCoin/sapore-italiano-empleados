import { useState, useEffect, useCallback } from 'react'
import { Clock, User, CheckCircle, XCircle, Coffee, ArrowRight, Loader } from 'lucide-react'
import { getEmpleados, createFichaje, getFichajesHoy, getEmpleado, updateEmpleado } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Fichaje.css'

function Fichaje() {
  const { user, isAdmin } = useAuth()
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [ultimoFichaje, setUltimoFichaje] = useState(null)
  const [fichajesHoy, setFichajesHoy] = useState([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  // Helper: comprobar si un fichaje pertenece a un empleado
  // Baserow devuelve Empleado como array de IDs, los locales usan empleadoId
  const fichajeEsDeEmpleado = useCallback((fichaje, empId) => {
    if (fichaje.empleadoId === empId) return true
    if (Array.isArray(fichaje.Empleado) && fichaje.Empleado.includes(empId)) return true
    if (fichaje.Empleado === empId) return true
    return false
  }, [])

  // Helper: obtener el tipo de fichaje desde un registro (Baserow o local)
  const getTipoFichaje = useCallback((fichaje) => {
    if (fichaje.tipo) return fichaje.tipo
    if (fichaje.Tipo) {
      // Baserow puede devolver el valor directamente o como objeto {value, id}
      return typeof fichaje.Tipo === 'object' ? fichaje.Tipo.value : fichaje.Tipo
    }
    return null
  }, [])

  // Helper: obtener la hora de un fichaje (Baserow o local)
  const getHoraFichaje = useCallback((fichaje) => {
    return fichaje.hora || fichaje.Hora || ''
  }, [])

  // Calcular último fichaje de un empleado a partir de los datos de Baserow
  const calcularUltimoFichaje = useCallback((fichajesData, empId) => {
    const delEmpleado = fichajesData.filter(f => fichajeEsDeEmpleado(f, empId))
    if (delEmpleado.length === 0) return null

    // Ordenar por hora descendente para obtener el último
    // Baserow rows tienen campo 'order' y 'id' que reflejan el orden de creación
    const ordenados = [...delEmpleado].sort((a, b) => {
      // Primero intentar ordenar por ID de fila (Baserow auto-incrementa)
      const idA = a.id || 0
      const idB = b.id || 0
      return idB - idA
    })

    const ultimo = ordenados[0]
    const tipo = getTipoFichaje(ultimo)
    
    return {
      id: ultimo.id,
      tipo: tipo,
      hora: getHoraFichaje(ultimo)
    }
  }, [fichajeEsDeEmpleado, getTipoFichaje, getHoraFichaje])

  const loadData = async () => {
    try {
      const fichajesData = await getFichajesHoy()
      setFichajesHoy(fichajesData)

      if (isAdmin) {
        const empleadosData = await getEmpleados()
        setEmpleados(empleadosData.filter(e => e.Activo))
        // Admin: no preseleccionar empleado, se selecciona manualmente
      } else {
        // Empleado normal: cargar solo sus datos
        const empData = await getEmpleado(user.id)
        setEmpleadoSeleccionado(empData)
        // Calcular último fichaje del empleado desde los datos existentes
        const ultimo = calcularUltimoFichaje(fichajesData, user.id)
        setUltimoFichaje(ultimo)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleFichaje = async (tipo) => {
    const emp = empleadoSeleccionado
    if (!emp || guardando) return

    setGuardando(true)
    try {
      const ahora = new Date()
      const fichaje = {
        'Ejemplo': `Fichaje ${tipo} - ${emp['Nombre completo']}`,
        'Empleado': [emp.id],
        'Fecha': ahora.toISOString().split('T')[0],
        'Hora': formatTime(ahora),
        'Tipo': tipo
      }

      await createFichaje(fichaje)
      
      // Re-cargar datos desde la API para mantener consistencia
      const fichajesData = await getFichajesHoy()
      setFichajesHoy(fichajesData)
      
      // Actualizar último fichaje con datos frescos
      const ultimo = calcularUltimoFichaje(fichajesData, emp.id)
      setUltimoFichaje(ultimo)
    } catch (error) {
      console.error('Error guardando fichaje:', error)
      alert('Error al guardar el fichaje')
    } finally {
      setGuardando(false)
    }
  }

  // Cuando el admin selecciona un empleado, calcular su último fichaje
  const handleSeleccionEmpleado = (emp) => {
    setEmpleadoSeleccionado(emp)
    const ultimo = calcularUltimoFichaje(fichajesHoy, emp.id)
    setUltimoFichaje(ultimo)
  }

  const getTiposFichaje = () => {
    if (!ultimoFichaje) return [
      { tipo: 'entrada', label: 'Entrada', icon: ArrowRight, color: 'green' }
    ]
    
    if (ultimoFichaje.tipo === 'entrada') return [
      { tipo: 'pausa_inicio', label: 'Inicio Pausa', icon: Coffee, color: 'orange' },
      { tipo: 'salida', label: 'Salida', icon: XCircle, color: 'red' }
    ]
    
    if (ultimoFichaje.tipo === 'pausa_inicio') return [
      { tipo: 'pausa_fin', label: 'Fin Pausa', icon: Coffee, color: 'blue' }
    ]
    
    if (ultimoFichaje.tipo === 'pausa_fin') return [
      { tipo: 'pausa_inicio', label: 'Inicio Pausa', icon: Coffee, color: 'orange' },
      { tipo: 'salida', label: 'Salida', icon: XCircle, color: 'red' }
    ]
    
    if (ultimoFichaje.tipo === 'salida') return [
      { tipo: 'entrada', label: 'Entrada', icon: ArrowRight, color: 'green' }
    ]
    
    return [{ tipo: 'entrada', label: 'Entrada', icon: ArrowRight, color: 'green' }]
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={40} />
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="fichaje-page">
      <div className="fichaje-header">
        <h1>Registro de Fichaje</h1>
        <div className="fecha-hora">
          <p className="fecha">{formatDate(currentTime)}</p>
          <p className="hora">{formatTime(currentTime)}</p>
        </div>
      </div>

      <div className="fichaje-container">
        {/* Si es admin, mostrar selector de empleados */}
        {isAdmin && (
          <div className="empleado-selector">
            <h2><User size={20} /> Seleccionar Empleado</h2>
            <div className="empleados-grid">
              {empleados.map(emp => (
                <button
                  key={emp.id}
                  className={`empleado-card ${empleadoSeleccionado?.id === emp.id ? 'selected' : ''}`}
                  onClick={() => handleSeleccionEmpleado(emp)}
                >
                  <div className="empleado-avatar">
                    {emp['Nombre completo']?.split(' ').map(n => n[0]).join('').slice(0,2) || 'NA'}
                  </div>
                  <div className="empleado-info">
                    <span className="empleado-nombre">{emp['Nombre completo']}</span>
                    <span className="empleado-puesto">{emp.Categoria?.value}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Si es empleado normal, mostrar su nombre sin selector */}
        {!isAdmin && empleadoSeleccionado && (
          <div className="empleado-selector">
            <h2><User size={20} /> {empleadoSeleccionado['Nombre completo']}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>
              {empleadoSeleccionado.Categoria?.value || 'Empleado'}
            </p>
          </div>
        )}

        {/* Panel de fichaje */}
        {empleadoSeleccionado && (
          <div className="fichaje-panel">
            <h2>
              <Clock size={20} /> 
              {isAdmin ? `Fichar: ${empleadoSeleccionado['Nombre completo']}` : 'Fichar'}
            </h2>
            
            <div className="fichaje-actions">
              {getTiposFichaje().map(btn => (
                <button
                  key={btn.tipo}
                  className={`fichaje-btn ${btn.color} ${guardando ? 'disabled' : ''}`}
                  onClick={() => handleFichaje(btn.tipo)}
                  disabled={guardando}
                >
                  <btn.icon size={32} />
                  <span className="btn-label">{btn.label}</span>
                  <span className="btn-hora">{formatTime(new Date())}</span>
                </button>
              ))}
            </div>

            {/* Historial del día */}
            {fichajesHoy.filter(f => fichajeEsDeEmpleado(f, empleadoSeleccionado.id)).length > 0 && (
              <div className="fichajes-hoy">
                <h3>Registros de hoy</h3>
                <div className="fichajes-list">
                  {fichajesHoy
                    .filter(f => fichajeEsDeEmpleado(f, empleadoSeleccionado.id))
                    .sort((a, b) => (a.id || 0) - (b.id || 0))
                    .map(f => {
                      const tipo = getTipoFichaje(f)
                      const hora = getHoraFichaje(f)
                      return (
                        <div key={f.id} className={`fichaje-item ${tipo}`}>
                          <span className="fichaje-tipo">
                            {tipo === 'entrada' && '🟢 Entrada'}
                            {tipo === 'salida' && '🔴 Salida'}
                            {tipo === 'pausa_inicio' && '🟠 Inicio Pausa'}
                            {tipo === 'pausa_fin' && '🔵 Fin Pausa'}
                          </span>
                          <span className="fichaje-hora">{hora}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info legal */}
      <div className="legal-notice">
        <p>📋 Registro conforme al RD-Ley 8/2019 - Los datos se conservarán durante 4 años</p>
      </div>
    </div>
  )
}

export default Fichaje
