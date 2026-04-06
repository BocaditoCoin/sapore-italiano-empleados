import { useState, useEffect } from 'react'
import { Calendar, Filter, Download, Eye, Loader } from 'lucide-react'
import { getEmpleados, getHorarios } from '../services/api'
import './Historial.css'

function Historial() {
  const [filtroEmpleado, setFiltroEmpleado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [empleados, setEmpleados] = useState([])
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [empleadosData, horariosData] = await Promise.all([
        getEmpleados(),
        getHorarios()
      ])
      setEmpleados(empleadosData)
      setRegistros(horariosData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar registros
  const registrosFiltrados = registros.filter(r => {
    const nombreEmpleado = r.Empleado?.[0]?.value || ''
    const matchEmpleado = !filtroEmpleado || nombreEmpleado === filtroEmpleado
    const matchFecha = !filtroFecha || r.Fecha === filtroFecha
    return matchEmpleado && matchFecha
  }).sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))

  // Exportar CSV
  const exportarCSV = () => {
    let csv = 'Empleado,Fecha,Tipo,Hora,Observaciones\n'
    registrosFiltrados.forEach(r => {
      csv += `${r.Empleado?.[0]?.value || ''},${r.Fecha},${r.Tipo?.value || r.Tipo || ''},${r.Hora},${r.Observaciones || ''}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registros_jornada_sapore_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Calcular horas del día por empleado
  const calcularHorasDia = (empleadoId, fecha) => {
    const regsDia = registros.filter(r => 
      r.Empleado?.[0]?.id === empleadoId && r.Fecha === fecha
    )
    
    let entrada = null
    let salida = null
    let horas = 0
    
    regsDia.forEach(r => {
      const tipo = r.Tipo?.value || r.Tipo
      if (tipo === 'entrada') entrada = r.Hora
      if (tipo === 'salida') salida = r.Hora
    })
    
    if (entrada && salida) {
      const h1 = parseInt(entrada.split(':')[0])
      const m1 = parseInt(entrada.split(':')[1])
      const h2 = parseInt(salida.split(':')[0])
      const m2 = parseInt(salida.split(':')[1])
      horas = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60
      if (horas < 0) horas += 24
    }
    
    return horas.toFixed(2)
  }

  // Agrupar por fecha
  const fechasUnicas = [...new Set(registrosFiltrados.map(r => r.Fecha))].sort((a, b) => new Date(b) - new Date(a))

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={40} />
        <p>Cargando historial...</p>
      </div>
    )
  }

  return (
    <div className="historial-page">
      <div className="historial-header">
        <h1><Calendar size={28} /> Historial de Registros</h1>
      </div>

      {/* Filtros */}
      <div className="filtros-card">
        <h3><Filter size={18} /> Filtros</h3>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Empleado</label>
            <select 
              value={filtroEmpleado} 
              onChange={(e) => setFiltroEmpleado(e.target.value)}
            >
              <option value="">Todos los empleados</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp['Nombre completo']}>
                  {emp['Nombre completo']}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Fecha</label>
            <input 
              type="date" 
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>
        </div>
        
        <button className="btn-exportar" onClick={exportarCSV}>
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Resumen */}
      <div className="resumen-card">
        <h3>Resumen</h3>
        <div className="resumen-grid">
          <div className="resumen-item">
            <span className="resumen-label">Total Registros</span>
            <span className="resumen-valor">{registrosFiltrados.length}</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Días con actividad</span>
            <span className="resumen-valor">{fechasUnicas.length}</span>
          </div>
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="registros-card">
        <div className="registros-header">
          <h3>Registros encontrados: {registrosFiltrados.length}</h3>
        </div>
        
        {registrosFiltrados.length === 0 ? (
          <p className="no-data">No hay registros en el historial</p>
        ) : (
          <div className="tabla-container">
            <table className="registros-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Hora</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map(reg => {
                  const tipo = reg.Tipo?.value || reg.Tipo || ''
                  return (
                    <tr key={reg.id}>
                      <td>
                        <div className="empleado-cell">
                          <div className="avatar-mini">
                            {(reg.Empleado?.[0]?.value || 'NA').split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <span>{reg.Empleado?.[0]?.value || '-'}</span>
                        </div>
                      </td>
                      <td>{new Date(reg.Fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td>
                        <span className={`tipo-badge ${tipo}`}>
                          {tipo === 'entrada' && '🟢 Entrada'}
                          {tipo === 'salida' && '🔴 Salida'}
                          {tipo === 'pausa_inicio' && '🟠 Inicio Pausa'}
                          {tipo === 'pausa_fin' && '🔵 Fin Pausa'}
                          {!['entrada', 'salida', 'pausa_inicio', 'pausa_fin'].includes(tipo) && tipo}
                        </span>
                      </td>
                      <td className="hora">{reg.Hora}</td>
                      <td>{reg.Observaciones || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legal notice */}
      <div className="legal-notice">
        <p>📋 Registros conforme al RD-Ley 8/2019 - Conservación mínima: 4 años</p>
        <p>✓ Datos accesibles para la Inspección de Trabajo y Seguridad Social</p>
      </div>
    </div>
  )
}

export default Historial
