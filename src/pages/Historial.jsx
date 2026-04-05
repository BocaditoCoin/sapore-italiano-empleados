import { useState } from 'react'
import { Calendar, Filter, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import './Historial.css'

function Historial() {
  const [filtroEmpleado, setFiltroEmpleado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [vistaActual, setVistaActual] = useState('dia')
  
  // Datos de ejemplo
  const registros = [
    { id: 1, empleado: 'María García', fecha: '2024-01-15', entrada: '08:00', salida: '16:00', pausas: '1h', horas: '7h' },
    { id: 2, empleado: 'Carlos López', fecha: '2024-01-15', entrada: '09:00', salida: '17:30', pausas: '30min', horas: '8h' },
    { id: 3, empleado: 'Ana Martínez', fecha: '2024-01-15', entrada: '10:00', salida: '18:00', pausas: '1h', horas: '7h' },
    { id: 4, empleado: 'Pedro Sánchez', fecha: '2024-01-15', entrada: '12:00', salida: '23:00', pausas: '1h', horas: '10h' },
    { id: 5, empleado: 'Laura Fernández', fecha: '2024-01-14', entrada: '08:30', salida: '16:30', pausas: '45min', horas: '7.25h' },
    { id: 6, empleado: 'Miguel Torres', fecha: '2024-01-14', entrada: '09:00', salida: '17:00', pausas: '1h', horas: '7h' },
    { id: 7, empleado: 'Sofía Ruiz', fecha: '2024-01-14', entrada: '11:00', salida: '23:00', pausas: '1h', horas: '11h' },
    { id: 8, empleado: 'David Moreno', fecha: '2024-01-14', entrada: '08:00', salida: '16:00', pausas: '1h', horas: '7h' },
  ]

  const empleados = [...new Set(registros.map(r => r.empleado))]

  const registrosFiltrados = registros.filter(r => {
    if (filtroEmpleado && r.empleado !== filtroEmpleado) return false
    if (filtroFecha && r.fecha !== filtroFecha) return false
    return true
  })

  const exportarCSV = () => {
    let csv = 'Empleado,Fecha,Entrada,Salida,Pausas,Horas\n'
    registrosFiltrados.forEach(r => {
      csv += `${r.empleado},${r.fecha},${r.entrada},${r.salida},${r.pausas},${r.horas}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registros_sapore_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="historial-page">
      <div className="historial-header">
        <h1><Calendar size={28} /> Historial de Registros</h1>
        <div className="vista-selector">
          <button 
            className={vistaActual === 'dia' ? 'active' : ''} 
            onClick={() => setVistaActual('dia')}
          >
            Por Día
          </button>
          <button 
            className={vistaActual === 'semana' ? 'active' : ''} 
            onClick={() => setVistaActual('semana')}
          >
            Por Semana
          </button>
          <button 
            className={vistaActual === 'mes' ? 'active' : ''} 
            onClick={() => setVistaActual('mes')}
          >
            Por Mes
          </button>
        </div>
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
                <option key={emp} value={emp}>{emp}</option>
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
          
          <div className="filtro-group">
            <label>Rango</label>
            <div className="date-range">
              <input type="date" />
              <span>a</span>
              <input type="date" />
            </div>
          </div>
        </div>
        
        <button className="btn-exportar" onClick={exportarCSV}>
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Tabla de registros */}
      <div className="registros-card">
        <div className="registros-header">
          <h3>Registros encontrados: {registrosFiltrados.length}</h3>
        </div>
        
        <div className="tabla-container">
          <table className="registros-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Fecha</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Pausas</th>
                <th>Horas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map(reg => (
                <tr key={reg.id}>
                  <td>
                    <div className="empleado-cell">
                      <div className="avatar-mini">
                        {reg.empleado.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{reg.empleado}</span>
                    </div>
                  </td>
                  <td>{new Date(reg.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                  <td className="hora-entrada">{reg.entrada}</td>
                  <td className="hora-salida">{reg.salida}</td>
                  <td>{reg.pausas}</td>
                  <td className="horas-total">{reg.horas}</td>
                  <td>
                    <button className="btn-accion" title="Ver detalle">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="paginacion">
          <button><ChevronLeft size={18} /></button>
          <span className="pagina-actual">Página 1 de 1</span>
          <button><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Resumen */}
      <div className="resumen-card">
        <h3>Resumen del Período</h3>
        <div className="resumen-grid">
          <div className="resumen-item">
            <span className="resumen-label">Total Horas</span>
            <span className="resumen-valor">64.25h</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Días Trabajados</span>
            <span className="resumen-valor">8</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Promedio/Día</span>
            <span className="resumen-valor">8.03h</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Pausas Total</span>
            <span className="resumen-valor">7.75h</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Historial
