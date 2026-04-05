import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Fichaje from './pages/Fichaje'
import Historial from './pages/Historial'
import Empleados from './pages/Empleados'
import Configuracion from './pages/Configuracion'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fichaje" element={<Fichaje />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
