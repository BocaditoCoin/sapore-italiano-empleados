import { useState, useEffect } from 'react'
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, Calendar, Loader } from 'lucide-react'
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from '../services/api'
import './Empleados.css'

function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [empleadoEditando, setEmpleadoEditando] = useState(null)
  const [formData, setFormData] = useState({
    'Nombre completo': '',
    'NIF': '',
    'NAF_SS': '',
    'Telefono': '',
    'Email': '',
    'Categoria': 'CAMARERO',
    'Fecha_alta': '',
    'IBAN': '',
    'Activo': true
  })

  const categorias = ['COCINERO', 'COCINERA', 'CAMARERO', 'CAMARERA', 'BARRA', 'GERENTE']

  useEffect(() => {
    loadEmpleados()
  }, [])

  const loadEmpleados = async () => {
    try {
      const data = await getEmpleados()
      setEmpleados(data)
    } catch (error) {
      console.error('Error cargando empleados:', error)
    } finally {
      setLoading(false)
    }
  }

  const empleadosFiltrados = empleados.filter(emp => 
    emp['Nombre completo']?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.NIF?.includes(busqueda) ||
    emp.Categoria?.value?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleNuevoEmpleado = () => {
    setEmpleadoEditando(null)
    setFormData({
      'Nombre completo': '',
      'NIF': '',
      'NAF_SS': '',
      'Telefono': '',
      'Email': '',
      'Categoria': 'CAMARERO',
      'Fecha_alta': new Date().toISOString().split('T')[0],
      'IBAN': '',
      'Activo': true
    })
    setMostrarModal(true)
  }

  const handleEditarEmpleado = (empleado) => {
    setEmpleadoEditando(empleado)
    setFormData({
      'Nombre completo': empleado['Nombre completo'] || '',
      'NIF': empleado.NIF || '',
      'NAF_SS': empleado.NAF_SS || '',
      'Telefono': empleado.Telefono || '',
      'Email': empleado.Email || '',
      'Categoria': empleado.Categoria?.value || 'CAMARERO',
      'Fecha_alta': empleado.Fecha_alta || '',
      'IBAN': empleado.IBAN || '',
      'Activo': empleado.Activo ?? true
    })
    setMostrarModal(true)
  }

  const handleEliminarEmpleado = async (id) => {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      await deleteEmpleado(id)
      loadEmpleados()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const dataToSend = {
      ...formData,
      'Ejemplo': formData['Nombre completo'],
      'Categoria': formData.Categoria
    }
    
    if (empleadoEditando) {
      await updateEmpleado(empleadoEditando.id, dataToSend)
    } else {
      await createEmpleado(dataToSend)
    }
    setMostrarModal(false)
    loadEmpleados()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={40} />
        <p>Cargando empleados...</p>
      </div>
    )
  }

  return (
    <div className="empleados-page">
      <div className="empleados-header">
        <h1><Users size={28} /> Gestión de Empleados</h1>
        <button className="btn-nuevo" onClick={handleNuevoEmpleado}>
          <Plus size={20} />
          Nuevo Empleado
        </button>
      </div>

      {/* Búsqueda */}
      <div className="busqueda-card">
        <div className="busqueda-input">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, NIF o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <span className="resultado-count">{empleadosFiltrados.length} empleados</span>
      </div>

      {/* Grid de empleados */}
      <div className="empleados-grid">
        {empleadosFiltrados.map(emp => (
          <div key={emp.id} className="empleado-card">
            <div className="empleado-card-header">
              <div className="empleado-avatar-large">
                {emp['Nombre completo']?.split(' ').map(n => n[0]).join('').slice(0,2) || 'NA'}
              </div>
              <div className="empleado-actions">
                <button className="btn-icon" onClick={() => handleEditarEmpleado(emp)}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon delete" onClick={() => handleEliminarEmpleado(emp.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="empleado-card-body">
              <h3>{emp['Nombre completo']}</h3>
              <span className="puesto-badge">{emp.Categoria?.value}</span>
              
              <div className="empleado-detalles">
                <div className="detalle">
                  <span className="label">NIF:</span>
                  <span>{emp.NIF}</span>
                </div>
                <div className="detalle">
                  <span className="label">NAF SS:</span>
                  <span>{emp.NAF_SS}</span>
                </div>
                {emp.Telefono && (
                  <div className="detalle">
                    <Phone size={14} />
                    <span>{emp.Telefono}</span>
                  </div>
                )}
                {emp.Email && (
                  <div className="detalle">
                    <Mail size={14} />
                    <span>{emp.Email}</span>
                  </div>
                )}
                <div className="detalle">
                  <Calendar size={14} />
                  <span>Alta: {emp.Fecha_alta ? new Date(emp.Fecha_alta).toLocaleDateString('es-ES') : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{empleadoEditando ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input 
                  type="text" 
                  value={formData['Nombre completo']}
                  onChange={e => setFormData({...formData, 'Nombre completo': e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>NIF</label>
                <input 
                  type="text" 
                  value={formData.NIF}
                  onChange={e => setFormData({...formData, NIF: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>NAF Seguridad Social</label>
                <input 
                  type="text" 
                  value={formData.NAF_SS}
                  onChange={e => setFormData({...formData, NAF_SS: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    value={formData.Telefono}
                    onChange={e => setFormData({...formData, Telefono: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select 
                    value={formData.Categoria}
                    onChange={e => setFormData({...formData, Categoria: e.target.value})}
                  >
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.Email}
                  onChange={e => setFormData({...formData, Email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>IBAN</label>
                <input 
                  type="text" 
                  value={formData.IBAN}
                  onChange={e => setFormData({...formData, IBAN: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Alta</label>
                <input 
                  type="date" 
                  value={formData.Fecha_alta}
                  onChange={e => setFormData({...formData, Fecha_alta: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Empleados
