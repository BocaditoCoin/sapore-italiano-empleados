import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('sapore_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('sapore_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (empleado) => {
    const userData = {
      id: empleado.id,
      nombre: empleado['Nombre completo'],
      nif: empleado.NIF,
      categoria: empleado.Categoria?.value || empleado.Categoria,
      rol: empleado.Rol?.value || empleado.Rol || 'empleado',
      passwordSet: !!empleado.Password,
    }
    setUser(userData)
    localStorage.setItem('sapore_user', JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sapore_user')
  }

  const isAdmin = user?.rol === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
