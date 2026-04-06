import { useState, useEffect } from 'react'
import { DollarSign, Calendar, Download, Eye, AlertCircle, Loader } from 'lucide-react'
import { getEmpleados, getNominas } from '../services/api'
import './Nominas.css'

function Nominas() {
  const [mesSeleccionado, setMesSeleccionado] = useState('2026-03')
  const [empleadoFiltro, setEmpleadoFiltro] = useState('')
  const [empleados, setEmpleados] = useState([])
  const [nominas, setNominas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [empleadosData, nominasData] = await Promise.all([
        getEmpleados(),
        getNominas()
      ])
      setEmpleados(empleadosData)
      setNominas(nominasData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar nóminas
  const [mes, ano] = mesSeleccionado.split('-').map(Number)
  const nominasFiltradas = nominas.filter(n => {
    const matchMes = parseInt(n.Periodo_mes) === mes
    const matchAno = parseInt(n.Periodo_ano) === ano
    const matchEmpleado = !empleadoFiltro || 
      (n.Empleado && n.Empleado[0] && n.Empleado[0].value === empleadoFiltro)
    return matchMes && matchAno && matchEmpleado
  })

  // Total
  const totalNominas = nominasFiltradas.reduce((acc, n) => acc + parseFloat(n.Liquido || 0), 0)

  // Exportar CSV
  const exportarCSV = () => {
    let csv = 'Empleado,NIF,Categoría,Mes,Año,Horas,Devengado,IRPF,Deducciones,Líquido,Coste Empresa\n'
    nominasFiltradas.forEach(n => {
      const emp = n.Empleado?.[0]?.value || ''
      csv += `${emp},${n.NIF || ''},${n.Categoria || ''},${n.Periodo_mes},${n.Periodo_ano},${n.Horas_trabajadas},${n.Total_devengado},${n.IRPF},${n.Total_deducciones},${n.Liquido},${n.Coste_empresa}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nominas_sapore_${mesSeleccionado}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={40} />
        <p>Cargando nóminas...</p>
      </div>
    )
  }

  return (
    <div className="nominas-page">
      <div className="nominas-header">
        <h1><DollarSign size={28} /> Gestión de Nóminas</h1>
        <button className="btn-exportar-todas" onClick={exportarCSV}>
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-card">
        <div className="filtros-row">
          <div className="filtro-group">
            <label><Calendar size={16} /> Mes</label>
            <input 
              type="month" 
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Empleado</label>
            <select 
              value={empleadoFiltro}
              onChange={(e) => setEmpleadoFiltro(e.target.value)}
            >
              <option value="">Todos los empleados</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp['Nombre completo']}>
                  {emp['Nombre completo']}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="resumen-grid">
        <div className="resumen-card total">
          <span className="resumen-label">Total Nóminas</span>
          <span className="resumen-valor">{totalNominas.toFixed(2)}€</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Empleados</span>
          <span className="resumen-valor">{nominasFiltradas.length}</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Promedio</span>
          <span className="resumen-valor">
            {nominasFiltradas.length > 0 
              ? (totalNominas / nominasFiltradas.length).toFixed(2) + '€'
              : '0€'}
          </span>
        </div>
      </div>

      {/* Convenio info */}
      <div className="convenio-card">
        <div className="convenio-header">
          <span>📋 Convenio Colectivo Hostelería Málaga 2024</span>
        </div>
        <div className="convenio-details">
          <div className="convenio-item">
            <span className="label">RD-Ley 8/2019:</span>
            <span className="value">✓ Cumplido</span>
          </div>
          <div className="convenio-item">
            <span className="label">Conservación:</span>
            <span className="value">4 años mínimo</span>
          </div>
          <div className="convenio-item">
            <span className="label">Acceso Inspección:</span>
            <span className="value">✓ Disponible</span>
          </div>
        </div>
      </div>

      {/* Tabla de nóminas */}
      <div className="nominas-card">
        <h3>Nóminas - {mesSeleccionado}</h3>
        {nominasFiltradas.length === 0 ? (
          <p className="no-data">No hay nóminas para este período</p>
        ) : (
          <div className="tabla-container">
            <table className="nominas-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>NIF</th>
                  <th>Horas</th>
                  <th>Salario Base</th>
                  <th>Vacaciones</th>
                  <th>Paga Extra</th>
                  <th>Devengado</th>
                  <th>IRPF</th>
                  <th>Líquido</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {nominasFiltradas.map(nom => (
                  <tr key={nom.id}>
                    <td>{nom.Empleado?.[0]?.value || '-'}</td>
                    <td>{empleados.find(e => e.id === nom.Empleado?.[0]?.id)?.NIF || '-'}</td>
                    <td>{nom.Horas_trabajadas}h</td>
                    <td>{parseFloat(nom.Salario_convenio).toFixed(2)}€</td>
                    <td>{parseFloat(nom.Bolsa_vacaciones).toFixed(2)}€</td>
                    <td>{parseFloat(nom.Paga_extra).toFixed(2)}€</td>
                    <td className="devengado">{parseFloat(nom.Total_devengado).toFixed(2)}€</td>
                    <td className="deduccion">{parseFloat(nom.IRPF).toFixed(2)}€</td>
                    <td className="liquido">{parseFloat(nom.Liquido).toFixed(2)}€</td>
                    <td>
                      <span className={`estado-badge ${nom.Estado?.value?.toLowerCase() || 'pendiente'}`}>
                        {nom.Estado?.value || 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="8"><strong>TOTAL</strong></td>
                  <td className="liquido total"><strong>{totalNominas.toFixed(2)}€</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Aviso legal */}
      <div className="legal-notice">
        <AlertCircle size={16} />
        <p>Datos conforme al RD-Ley 8/2019 y Convenio Colectivo de Hostelería de Málaga.
        Todos los registros son reales y están almacenados en la base de datos.</p>
      </div>
    </div>
  )
}

export default Nominas
