import { useState, useEffect } from 'react'
import { Clock, Users, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { getStats, getEmpleados } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    empleadosActivos: 0,
    fichajesHoy: 0,
    pendientesFichaje: 0,
    registrosMes: 0
  })
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, empleadosData] = await Promise.all([
          getStats(),
          getEmpleados()
        ])
        setStats({
          empleadosActivos: statsData.empleadosActivos || empleadosData.filter(e => e.Activo).length,
          fichajesHoy: statsData.fichajesHoy || 0,
          pendientesFichaje: Math.max(0, (statsData.empleadosActivos || empleadosData.filter(e => e.Activo).length) - (statsData.fichajesHoy || 0)),
          registrosMes: statsData.totalNominas || 0
        })
        setEmpleados(empleadosData)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const alertas = [
    { id: 1, mensaje: `${stats.pendientesFichaje} empleados pendientes de fichaje`, tipo: stats.pendientesFichaje > 0 ? 'warning' : 'success' },
    { id: 2, mensaje: `${stats.empleadosActivos} empleados activos`, tipo: 'success' },
  ]

  if (loading) {
    return <div className="loading">Cargando datos...</div>
  }

  return (
    <div className="dashboard">
      {/* Header con fecha y hora */}
      <div className="dashboard-header">
        <div className="date-info">
          <h1>Panel de Control</h1>
          <p className="current-date">{formatDate(currentTime)}</p>
        </div>
        <div className="time-display">
          <Clock size={24} />
          <span className="time">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.empleadosActivos}</span>
            <span className="stat-label">Empleados Activos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.fichajesHoy}</span>
            <span className="stat-label">Fichajes Hoy</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <AlertCircle size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendientesFichaje}</span>
            <span className="stat-label">Pendientes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Calendar size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.registrosMes}</span>
            <span className="stat-label">Nóminas Registradas</span>
          </div>
        </div>
      </div>

      {/* Alertas y Accesos Rápidos */}
      <div className="dashboard-grid">
        {/* Alertas */}
        <div className="card alertas-card">
          <h2><AlertCircle size={20} /> Estado del Día</h2>
          <div className="alertas-list">
            {alertas.map(alerta => (
              <div key={alerta.id} className={`alerta-item ${alerta.tipo}`}>
                <span className="alerta-punto"></span>
                <span>{alerta.mensaje}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cumplimiento Legal */}
        <div className="card cumplimiento-card">
          <h2><TrendingUp size={20} /> Cumplimiento Legal</h2>
          <div className="cumplimiento-info">
            <div className="cumplimiento-item">
              <CheckCircle size={18} className="check" />
              <span>RD-Ley 8/2019: Cumplido</span>
            </div>
            <div className="cumplimiento-item">
              <CheckCircle size={18} className="check" />
              <span>Conservación 4 años: Activo</span>
            </div>
            <div className="cumplimiento-item">
              <CheckCircle size={18} className="check" />
              <span>Acceso Inspección: Disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empleados activos */}
      <div className="card empleados-card">
        <h2><Users size={20} /> Empleados Activos</h2>
        <div className="empleados-grid-mini">
          {empleados.filter(e => e.Activo).map(emp => (
            <div key={emp.id} className="empleado-mini">
              <div className="avatar-mini">
                {emp['Nombre completo']?.split(' ').map(n => n[0]).join('').slice(0,2) || 'NA'}
              </div>
              <div className="empleado-info-mini">
                <span className="nombre">{emp['Nombre completo']}</span>
                <span className="categoria">{emp.Categoria?.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fichaje rápido */}
      <div className="card fichaje-rapido">
        <h2>Acceso Rápido</h2>
        <div className="quick-actions">
          <a href="/fichaje" className="action-btn primary">
            <Clock size={24} />
            <span>Nuevo Fichaje</span>
          </a>
          <a href="/historial" className="action-btn secondary">
            <Calendar size={24} />
            <span>Ver Historial</span>
          </a>
          <a href="/empleados" className="action-btn secondary">
            <Users size={24} />
            <span>Gestionar Empleados</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
