import { NavLink } from 'react-router-dom'
import MotoIcon from './MotoIcon'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container-xl">
        <NavLink to="/" className="navbar-brand fw-bold">
          <i className="bi bi-tools me-2 text-warning" />
          <span className="text-warning">Moto</span>Taller
        </NavLink>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto gap-1">
            <li className="nav-item">
              <NavLink to="/" end className={({ isActive }) => `nav-link px-3 rounded ${isActive ? 'active bg-warning text-dark fw-semibold' : 'text-light'}`}>
                <i className="bi bi-clipboard-list me-1" />Órdenes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/orders/new" className={({ isActive }) => `nav-link px-3 rounded ${isActive ? 'active bg-warning text-dark fw-semibold' : 'text-light'}`}>
                <i className="bi bi-plus-circle me-1" />Nueva Orden
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/clients" className={({ isActive }) => `nav-link px-3 rounded ${isActive ? 'active bg-warning text-dark fw-semibold' : 'text-light'}`}>
                <i className="bi bi-people me-1" />Clientes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/bikes" className={({ isActive }) => `nav-link px-3 rounded ${isActive ? 'active bg-warning text-dark fw-semibold' : 'text-light'}`}>
                <MotoIcon className="me-1" />Motos
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
