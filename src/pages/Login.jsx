import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getEmpleados } from '../services/api'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const [empleados, setEmpleados] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState('select') // select, password, create-password
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [empleadoData, setEmpleadoData] = useState(null)

  const handleLoadEmpleados = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getEmpleados()
      const activos = data.filter(e => e.Activo)
      setEmpleados(activos)
    } catch {
      setError('Error al cargar empleados')
    }
    setLoading(false)
  }

  const handleSelectEmpleado = () => {
    if (!selectedId) {
      setError('Selecciona tu nombre')
      return
    }
    const emp = empleados.find(e => e.id === parseInt(selectedId))
    if (!emp) return

    setEmpleadoData(emp)
    if (emp.Password) {
      setStep('password')
    } else {
      setStep('create-password')
    }
    setError('')
  }

  const handleLogin = () => {
    if (!password) {
      setError('Introduce tu contraseña')
      return
    }
    if (password !== empleadoData.Password) {
      setError('Contraseña incorrecta')
      return
    }
    login(empleadoData)
  }

  const handleCreatePassword = () => {
    if (!newPassword || newPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    // Guardar contraseña en Baserow
    import('../services/api').then(api => {
      api.updateEmpleado(empleadoData.id, { Password: newPassword }).then(() => {
        empleadoData.Password = newPassword
        login(empleadoData)
      }).catch(() => {
        setError('Error al guardar la contraseña')
      })
    })
  }

  return (
    <div className="login-page">
      <div className="login-bg"></div>
      <div className="login-container">
        <div className="login-logo">
          <span className="logo-emoji">🍝</span>
          <h1>Sapore Italiano</h1>
          <p>Sistema de Registro de Empleados</p>
        </div>

        {step === 'select' && (
          <div className="login-form">
            <h2>Identifícate</h2>
            {empleados.length === 0 ? (
              <button className="login-btn" onClick={handleLoadEmpleados} disabled={loading}>
                {loading ? 'Cargando...' : 'Cargar empleados'}
              </button>
            ) : (
              <>
                <div className="form-group">
                  <label>¿Quién eres?</label>
                  <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                    <option value="">-- Selecciona tu nombre --</option>
                    {empleados.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp['Nombre completo']}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="login-btn" onClick={handleSelectEmpleado}>
                  Continuar
                </button>
              </>
            )}
          </div>
        )}

        {step === 'password' && (
          <div className="login-form">
            <h2>Bienvenido, {empleadoData?.['Nombre completo']?.split(' ')[0]}</h2>
            <p className="login-subtitle">Introduce tu contraseña</p>
            <div className="form-group">
              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoFocus
              />
            </div>
            <button className="login-btn" onClick={handleLogin}>
              Entrar
            </button>
            <button className="login-link" onClick={() => { setStep('select'); setPassword(''); setError('') }}>
              ← Volver
            </button>
          </div>
        )}

        {step === 'create-password' && (
          <div className="login-form">
            <h2>Hola, {empleadoData?.['Nombre completo']?.split(' ')[0]}</h2>
            <p className="login-subtitle">Primer acceso - Crea tu contraseña</p>
            <div className="form-group">
              <input
                type="password"
                placeholder="Nueva contraseña (mínimo 4 caracteres)"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError('') }}
                autoFocus
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCreatePassword()}
              />
            </div>
            <button className="login-btn" onClick={handleCreatePassword}>
              Crear contraseña y entrar
            </button>
            <button className="login-link" onClick={() => { setStep('select'); setNewPassword(''); setConfirmPassword(''); setError('') }}>
              ← Volver
            </button>
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        <div className="login-footer">
          <p>RD-Ley 8/2019 · Registro de Jornada Laboral</p>
        </div>
      </div>
    </div>
  )
}

export default Login
