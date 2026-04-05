import { useState } from 'react'
import { DollarSign, Calendar, Download, Eye, Calculator, FileText, AlertCircle } from 'lucide-react'
import './Nominas.css'

function Nominas() {
  const [mesSeleccionado, setMesSeleccionado] = useState('2024-01')
  const [empleadoFiltro, setEmpleadoFiltro] = useState('')
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false)
  
  // Convenio Colectivo Hostelería Málaga 2024
  const convenio = {
    salarioBase: {
      'Gerente': 1450,
      'Jefe Cocina': 1320,
      'Cocina': 1180,
      'Sala': 1150,
      'Barra': 1100,
    },
    pagasExtras: 2, // Junio y Diciembre
    antiguedad: {
      trienio1: 20, // €/mes por trienio
      trienio2: 25,
      trienio3: 30,
    },
    horasExtra: 12.50, // €/hora
    nocturnidad: 4.50, // €/noche
    festivo: 1.25, // 25% sobre hora
  }

  const [empleados] = useState([
    { 
      id: 1, nombre: 'María García', dni: '12345678A', puesto: 'Cocina', 
      fechaAlta: '2022-03-15', cuenta: 'ES91 2100 0418 45 0200051332',
      horasExtra: 8, nocturnidad: 0, festivos: 2
    },
    { 
      id: 2, nombre: 'Carlos López', dni: '87654321B', puesto: 'Sala', 
      fechaAlta: '2022-05-20', cuenta: 'ES12 1234 5678 90 1234567890',
      horasExtra: 12, nocturnidad: 5, festivos: 1
    },
    { 
      id: 3, nombre: 'Ana Martínez', dni: '11223344C', puesto: 'Cocina', 
      fechaAlta: '2023-01-10', cuenta: 'ES34 2345 6789 01 2345678901',
      horasExtra: 4, nocturnidad: 0, festivos: 3
    },
    { 
      id: 4, nombre: 'Pedro Sánchez', dni: '55667788D', puesto: 'Sala', 
      fechaAlta: '2023-06-01', cuenta: 'ES56 3456 7890 12 3456789012',
      horasExtra: 20, nocturnidad: 8, festivos: 2
    },
    { 
      id: 5, nombre: 'Laura Fernández', dni: '99887766E', puesto: 'Barra', 
      fechaAlta: '2023-08-15', cuenta: 'ES78 4567 8901 23 4567890123',
      horasExtra: 6, nocturnidad: 2, festivos: 0
    },
    { 
      id: 6, nombre: 'Miguel Torres', dni: '22334455F', puesto: 'Cocina', 
      fechaAlta: '2023-09-01', cuenta: 'ES90 5678 9012 34 5678901234',
      horasExtra: 10, nocturnidad: 0, festivos: 1
    },
    { 
      id: 7, nombre: 'Sofía Ruiz', dni: '33445566G', puesto: 'Sala', 
      fechaAlta: '2023-10-15', cuenta: 'ES21 6789 0123 45 6789012345',
      horasExtra: 15, nocturnidad: 6, festivos: 2
    },
    { 
      id: 8, nombre: 'David Moreno', dni: '44556677H', puesto: 'Barra', 
      fechaAlta: '2024-01-05', cuenta: 'ES43 7890 1234 56 7890123456',
      horasExtra: 5, nocturnidad: 1, festivos: 0
    },
  ])

  const calcularAntiguedad = (fechaAlta) => {
    const fecha = new Date(fechaAlta)
    const ahora = new Date()
    const años = (ahora - fecha) / (1000 * 60 * 60 * 24 * 365.25)
    const trienios = Math.floor(años / 3)
    
    let total = 0
    for (let i = 0; i < trienios; i++) {
      if (i < 3) total += convenio.antiguedad.trienio1
      else if (i < 6) total += convenio.antiguedad.trienio2
      else total += convenio.antiguedad.trienio3
    }
    return { trienios, cantidad: total }
  }

  const calcularNomina = (empleado) => {
    const salarioBase = convenio.salarioBase[empleado.puesto] || 1150
    const antiguedad = calcularAntiguedad(empleado.fechaAlta)
    const importeHorasExtra = empleado.horasExtra * convenio.horasExtra
    const importeNocturnidad = empleado.nocturnidad * convenio.nocturnidad
    
    // Devengos
    const totalDevengado = salarioBase + antiguedad.cantidad + importeHorasExtra + importeNocturnidad
    
    // Deducciones (aproximadas)
    const ccContComun = totalDevengado * 0.047 // 4.7%
    const desempleo = totalDevengado * 0.0155 // 1.55%
    const fp = totalDevengado * 0.001 // 0.1%
    const irpf = calcularIRPF(totalDevengado)
    
    const totalDeducciones = ccContComun + desempleo + fp + irpf
    const liquido = totalDevengado - totalDeducciones
    
    return {
      salarioBase,
      antiguedad: antiguedad.cantidad,
      trienios: antiguedad.trienios,
      horasExtra: importeHorasExtra,
      nocturnidad: importeNocturnidad,
      totalDevengado,
      ccContComun,
      desempleo,
      fp,
      irpf,
      totalDeducciones,
      liquido,
      diasCotizados: 30
    }
  }

  const calcularIRPF = (base) => {
    // Tramos IRPF 2024 (aproximados)
    if (base <= 12450) return base * 0.095 // 9.5%
    if (base <= 20200) return base * 0.12  // 12%
    if (base <= 35200) return base * 0.15  // 15%
    if (base <= 60000) return base * 0.18  // 18%
    return base * 0.22 // 22%
  }

  const empleadosFiltrados = empleados.filter(emp => 
    empleadoFiltro === '' || emp.nombre === empleadoFiltro
  )

  const exportarNomina = (empleado, nomina) => {
    // En producción esto generaría un PDF
    alert(`Generando PDF de nómina para ${empleado.nombre}\nTotal: ${nomina.liquido.toFixed(2)}€`)
  }

  const exportarTodasNominas = () => {
    alert(`Exportando ${empleadosFiltrados.length} nóminas en lote...`)
  }

  const totalNomina = empleadosFiltrados.reduce((acc, emp) => {
    const nomina = calcularNomina(emp)
    return acc + nomina.liquido
  }, 0)

  return (
    <div className="nominas-page">
      <div className="nominas-header">
        <h1><DollarSign size={28} /> Gestión de Nóminas</h1>
        <div className="header-actions">
          <button className="btn-calculadora" onClick={() => setMostrarCalculadora(!mostrarCalculadora)}>
            <Calculator size={18} />
            Calculadora
          </button>
          <button className="btn-exportar-todas" onClick={exportarTodasNominas}>
            <Download size={18} />
            Exportar Todas
          </button>
        </div>
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
                <option key={emp.id} value={emp.nombre}>{emp.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen mensual */}
      <div className="resumen-grid">
        <div className="resumen-card total">
          <span className="resumen-label">Total Nóminas</span>
          <span className="resumen-valor">{totalNomina.toFixed(2)}€</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Empleados</span>
          <span className="resumen-valor">{empleadosFiltrados.length}</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Promedio</span>
          <span className="resumen-valor">{(totalNomina / empleadosFiltrados.length).toFixed(2)}€</span>
        </div>
      </div>

      {/* Convenio info */}
      <div className="convenio-card">
        <div className="convenio-header">
          <FileText size={18} />
          <span>Convenio Colectivo Hostelería Málaga 2024</span>
        </div>
        <div className="convenio-details">
          <div className="convenio-item">
            <span className="label">Salario Base Cocina:</span>
            <span className="value">{convenio.salarioBase['Cocina']}€/mes</span>
          </div>
          <div className="convenio-item">
            <span className="label">Salario Base Sala:</span>
            <span className="value">{convenio.salarioBase['Sala']}€/mes</span>
          </div>
          <div className="convenio-item">
            <span className="label">Horas Extra:</span>
            <span className="value">{convenio.horasExtra}€/hora</span>
          </div>
          <div className="convenio-item">
            <span className="label">Nocturnidad:</span>
            <span className="value">{convenio.nocturnidad}€/noche</span>
          </div>
        </div>
      </div>

      {/* Tabla de nóminas */}
      <div className="nominas-card">
        <h3>Detalle de Nóminas - {mesSeleccionado}</h3>
        <div className="tabla-container">
          <table className="nominas-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Puesto</th>
                <th>Salario Base</th>
                <th>Antigüedad</th>
                <th>H. Extra</th>
                <th>Nocturn.</th>
                <th>Devengado</th>
                <th>IRPF</th>
                <th>SS</th>
                <th>Líquido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.map(emp => {
                const nomina = calcularNomina(emp)
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="empleado-cell">
                        <div className="avatar-mini">
                          {emp.nombre.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{emp.nombre}</span>
                      </div>
                    </td>
                    <td><span className="puesto-badge">{emp.puesto}</span></td>
                    <td>{nomina.salarioBase.toFixed(2)}€</td>
                    <td>{nomina.antiguedad.toFixed(2)}€ <span className="trienios">({nomina.trienios}t)</span></td>
                    <td>{nomina.horasExtra.toFixed(2)}€</td>
                    <td>{nomina.nocturnidad.toFixed(2)}€</td>
                    <td className="devengado">{nomina.totalDevengado.toFixed(2)}€</td>
                    <td className="deduccion">-{nomina.irpf.toFixed(2)}€</td>
                    <td className="deduccion">-{(nomina.ccContComun + nomina.desempleo + nomina.fp).toFixed(2)}€</td>
                    <td className="liquido">{nomina.liquido.toFixed(2)}€</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon" title="Ver detalle" onClick={() => exportarNomina(emp, nomina)}>
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" title="Descargar PDF" onClick={() => exportarNomina(emp, nomina)}>
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="9"><strong>TOTAL</strong></td>
                <td className="liquido total"><strong>{totalNomina.toFixed(2)}€</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Calculadora */}
      {mostrarCalculadora && (
        <div className="modal-overlay" onClick={() => setMostrarCalculadora(false)}>
          <div className="modal calculadora-modal" onClick={e => e.stopPropagation()}>
            <h2><Calculator size={20} /> Calculadora de Nómina</h2>
            <CalculadoraNomina convenio={convenio} onClose={() => setMostrarCalculadora(false)} />
          </div>
        </div>
      )}

      {/* Aviso legal */}
      <div className="legal-notice">
        <AlertCircle size={16} />
        <p>Los cálculos son orientativos según Convenio Colectivo de Hostelería de Málaga. 
        Consulta con tu gestoría para confirmar valores exactos de IRPF y cotizaciones.</p>
      </div>
    </div>
  )
}

// Componente calculadora
function CalculadoraNomina({ convenio, onClose }) {
  const [datos, setDatos] = useState({
    puesto: 'Sala',
    horasExtra: 0,
    nocturnidad: 0,
    antiguedad: 0
  })

  const calcular = () => {
    const base = convenio.salarioBase[datos.puesto]
    const extra = datos.horasExtra * convenio.horasExtra
    const noct = datos.nocturnidad * convenio.nocturnidad
    const antig = datos.antiguedad
    const bruto = base + extra + noct + antig
    const ss = bruto * 0.0635
    const irpf = bruto * 0.12
    return {
      bruto,
      ss,
      irpf,
      liquido: bruto - ss - irpf
    }
  }

  const resultado = calcular()

  return (
    <div className="calculadora-content">
      <div className="calc-form">
        <div className="form-group">
          <label>Puesto</label>
          <select value={datos.puesto} onChange={e => setDatos({...datos, puesto: e.target.value})}>
            <option value="Barra">Barra ({convenio.salarioBase['Barra']}€)</option>
            <option value="Sala">Sala ({convenio.salarioBase['Sala']}€)</option>
            <option value="Cocina">Cocina ({convenio.salarioBase['Cocina']}€)</option>
            <option value="Jefe Cocina">Jefe Cocina ({convenio.salarioBase['Jefe Cocina']}€)</option>
            <option value="Gerente">Gerente ({convenio.salarioBase['Gerente']}€)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Horas Extra</label>
          <input type="number" value={datos.horasExtra} onChange={e => setDatos({...datos, horasExtra: +e.target.value})} />
        </div>
        <div className="form-group">
          <label>Nocturnidad (noches)</label>
          <input type="number" value={datos.nocturnidad} onChange={e => setDatos({...datos, nocturnidad: +e.target.value})} />
        </div>
        <div className="form-group">
          <label>Antigüedad (€)</label>
          <input type="number" value={datos.antiguedad} onChange={e => setDatos({...datos, antiguedad: +e.target.value})} />
        </div>
      </div>
      
      <div className="calc-result">
        <div className="result-row">
          <span>Bruto:</span>
          <strong>{resultado.bruto.toFixed(2)}€</strong>
        </div>
        <div className="result-row deduccion">
          <span>Seg. Social (6.35%):</span>
          <span>-{resultado.ss.toFixed(2)}€</span>
        </div>
        <div className="result-row deduccion">
          <span>IRPF (estimado 12%):</span>
          <span>-{resultado.irpf.toFixed(2)}€</span>
        </div>
        <div className="result-row total">
          <span>Líquido:</span>
          <strong>{resultado.liquido.toFixed(2)}€</strong>
        </div>
      </div>
      
      <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
    </div>
  )
}

export default Nominas
