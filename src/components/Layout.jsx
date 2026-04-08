import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Clock, FileText, Users, Settings, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()
  
  const allNavItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/fichaje', icon: Clock, label: 'Fichaje' },
    { path: '/historial', icon: FileText, label: 'Historial' },
    { path: '/empleados', icon: Users, label: 'Empleados', adminOnly: true },
    { path: '/configuracion', icon: Settings, label: 'Configuración', adminOnly: true },
  ]

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🍝</span>
            <span className="logo-text">Sapore Italiano</span>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button className="nav-item nav-logout" onClick={logout}>
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      </header>

      {/* User Bar */}
      <div className="user-bar">
        <span className="user-name">
          {isAdmin ? '👑' : '👤'} {user?.nombre?.split(' ')[0]}
        </span>
        <span className="user-role">
          {isAdmin ? 'Administrador' : 'Empleado'}
        </span>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Sapore Italiano - Plaza Alameda, Coín (Málaga)</p>
        <p className="footer-note">Cumplimiento RD-Ley 8/2019 - Registro de Jornada Laboral</p>
      </footer>
    </div>
  )
}

export default Layout
