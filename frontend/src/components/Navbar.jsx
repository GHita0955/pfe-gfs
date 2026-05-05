import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          📅 ReservSmart
        </Link>

        <ul className="navbar-nav">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-label">Accueil</span>
            </NavLink>
          </li>

          {!user && (
            <>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Connexion
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  className="nav-link btn-nav"
                >
                  S'inscrire
                </NavLink>
              </li>
            </>
          )}

          {user && user.role === 'client' && (
            <li>
              <NavLink
                to="/reservations"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                Mes réservations
              </NavLink>
            </li>
          )}

          {user && user.role === 'admin' && (
            <>
              <li>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/reservations"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Réservations
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/slots"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Créneaux
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/services"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Services
                </NavLink>
              </li>
            </>
          )}

          {user && (
            <li>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                style={{ marginLeft: '0.25rem' }}
              >
                👤 {user.username}  ·  Déconnexion
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}
