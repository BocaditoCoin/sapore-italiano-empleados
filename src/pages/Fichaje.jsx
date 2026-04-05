import { useState, useEffect } from 'react'
import { Clock, User, CheckCircle, XCircle, Coffee, ArrowRight, Loader } from 'lucide-react'
import { getEmpleados, createFichaje, getFichajesHoy } from '../services/api'
import './Fichaje.css'

function Fichaje() {
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

  const loadData = async () => {
    try {
      const [empleadosData, fichajesData] = await Promise.all([
        getEmpleados(),
        getFichajesHoy()
      ])
      setEmpleados(empleadosData.filter(e => e.Activo))
      setFichajesHoy(fichajesData)
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
    if (!empleadoSeleccionado || guardando) return

    setGuardando(true)
    try {
      const ahora = new Date()
      const fichaje = {
        'Ejemplo': `Fichaje ${tipo} - ${empleadoSeleccionado['Nombre completo']}`,
        'Empleado': [empleadoSeleccionado.id],
        'Fecha': ahora.toISOString().split('T')[0],
        'Hora': formatTime(ahora),
        'Tipo': tipo
      }

      await createFichaje(fichaje)
      
      const nuevoFichaje = {
        id: Date.now(),
        empleadoId: empleadoSeleccionado.id,
        empleado: empleadoSeleccionado['Nombre completo'],
        tipo: tipo,
        hora: formatTime(ahora)
      }
      
      setFichajesHoy([...fichajesHoy, nuevoFichaje])
      setUltimoFichaje(nuevoFichaje)
    } catch (error) {
      console.error('Error guardando fichaje:', error)
      alert('Error al guardar el fichaje')
    } finally {
      setGuardando(false)
    }
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
        {/* Selección de empleado */}
        <div className="empleado-selector">
          <h2><User size={20} /> Seleccionar Empleado</h2>
          <div className="empleados-grid">
            {empleados.map(emp => (
              <button
                key={emp.id}
                className={`empleado-card ${empleadoSeleccionado?.id === emp.id ? 'selected' : ''}`}
                onClick={() => {
                  setEmpleadoSeleccionado(emp)
                  setUltimoFichaje(null)
                }}
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

        {/* Panel de fichaje */}
        {empleadoSeleccionado && (
          <div className="fichaje-panel">
            <h2>
              <Clock size={20} /> 
              Fichar: {empleadoSeleccionado['Nombre completo']}
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
            {fichajesHoy.filter(f => f.empleadoId === empleadoSeleccionado.id).length > 0 && (
              <div className="fichajes-hoy">
                <h3>Registros de hoy</h3>
                <div className="fichajes-list">
                  {fichajesHoy
                    .filter(f => f.empleadoId === empleadoSeleccionado.id)
                    .map(f => (
                      <div key={f.id} className={`fichaje-item ${f.tipo}`}>
                        <span className="fichaje-tipo">
                          {f.tipo === 'entrada' && '🟢 Entrada'}
                          {f.tipo === 'salida' && '🔴 Salida'}
                          {f.tipo === 'pausa_inicio' && '🟠 Inicio Pausa'}
                          {f.tipo === 'pausa_fin' && '🔵 Fin Pausa'}
                        </span>
                        <span className="fichaje-hora">{f.hora}</span>
                      </div>
                    ))}
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
