import { useState } from 'react'
import { Settings, Bell, Clock, Database, Shield, Download, Trash2, Save } from 'lucide-react'
import './Configuracion.css'

function Configuracion() {
  const [config, setConfig] = useState({
    nombreRestaurante: 'Sapore Italiano',
    direccion: 'Plaza Alameda, Coín (Málaga)',
    telefono: '951 234 567',
    email: 'info@saporeitaliano.es',
    horarioApertura: '08:00',
    horarioCierre: '23:00',
    toleranciaFichaje: 5,
    notificacionesEmail: true,
    backupAutomatico: true,
    conservacionAnos: 4
  })

  const [guardado, setGuardado] = useState(false)

  const handleSave = () => {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  const exportarDatos = () => {
    alert('Exportando todos los datos a formato compatible con Inspección de Trabajo...')
  }

  return (
    <div className="configuracion-page">
      <div className="config-header">
        <h1><Settings size={28} /> Configuración</h1>
      </div>

      <div className="config-grid">
        {/* Datos del Restaurante */}
        <div className="config-card">
          <h2>Datos del Restaurante</h2>
          <div className="form-group">
            <label>Nombre</label>
            <input 
              type="text" 
              value={config.nombreRestaurante}
              onChange={e => setConfig({...config, nombreRestaurante: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input 
              type="text" 
              value={config.direccion}
              onChange={e => setConfig({...config, direccion: e.target.value})}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input 
                type="tel" 
                value={config.telefono}
                onChange={e => setConfig({...config, telefono: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={config.email}
                onChange={e => setConfig({...config, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="config-card">
          <h2><Clock size={18} /> Horarios</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Hora Apertura</label>
              <input 
                type="time" 
                value={config.horarioApertura}
                onChange={e => setConfig({...config, horarioApertura: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Hora Cierre</label>
              <input 
                type="time" 
                value={config.horarioCierre}
                onChange={e => setConfig({...config, horarioCierre: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Tolerancia fichaje (minutos)</label>
            <input 
              type="number" 
              value={config.toleranciaFichaje}
              onChange={e => setConfig({...config, toleranciaFichaje: parseInt(e.target.value)})}
              min="0"
              max="30"
            />
            <p className="help-text">Margen de tolerancia para considerar un fichaje a tiempo</p>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="config-card">
          <h2><Bell size={18} /> Notificaciones</h2>
          <div className="toggle-group">
            <label className="toggle-label">
              <span>Alertas por email</span>
              <input 
                type="checkbox" 
                checked={config.notificacionesEmail}
                onChange={e => setConfig({...config, notificacionesEmail: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Datos y Seguridad */}
        <div className="config-card">
          <h2><Database size={18} /> Datos y Seguridad</h2>
          <div className="toggle-group">
            <label className="toggle-label">
              <span>Backup automático diario</span>
              <input 
                type="checkbox" 
                checked={config.backupAutomatico}
                onChange={e => setConfig({...config, backupAutomatico: e.target.checked})}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="form-group">
            <label>Conservación de registros (años)</label>
            <select 
              value={config.conservacionAnos}
              onChange={e => setConfig({...config, conservacionAnos: parseInt(e.target.value)})}
            >
              <option value={4}>4 años (mínimo legal)</option>
              <option value={5}>5 años</option>
              <option value={6}>6 años</option>
            </select>
            <p className="help-text">RD-Ley 8/2019 exige mínimo 4 años</p>
          </div>
        </div>

        {/* Cumplimiento Legal */}
        <div className="config-card legal">
          <h2><Shield size={18} /> Cumplimiento Legal</h2>
          <div className="legal-info">
            <div className="legal-item">
              <span className="legal-check">✓</span>
              <span>Registro de jornada conforme a RD-Ley 8/2019</span>
            </div>
            <div className="legal-item">
              <span className="legal-check">✓</span>
              <span>Datos accesibles para Inspección de Trabajo</span>
            </div>
            <div className="legal-item">
              <span className="legal-check">✓</span>
              <span>Registro de horarios de trabajo efectivo</span>
            </div>
            <div className="legal-item">
              <span className="legal-check">✓</span>
              <span>Control de pausas y descansos</span>
            </div>
          </div>
          <button className="btn-export-legal" onClick={exportarDatos}>
            <Download size={18} />
            Exportar para Inspección de Trabajo
          </button>
        </div>
      </div>

      {/* Botón guardar */}
      <div className="config-actions">
        {guardado && <span className="guardado-msg">✓ Configuración guardada</span>}
        <button className="btn-guardar" onClick={handleSave}>
          <Save size={18} />
          Guardar Cambios
        </button>
      </div>
    </div>
  )
}

export default Configuracion
