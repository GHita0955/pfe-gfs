import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/reservations', label: 'Réservations', icon: '📋' },
  { to: '/admin/slots', label: 'Créneaux', icon: '🗓️' },
  { to: '/admin/services', label: 'Services', icon: '⚙️' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const initials = user ? (user.username || user.email || '?').slice(0, 2).toUpperCase() : ''

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Sidebar */}
      <aside className="w-60 bg-dark-100 border-r border-dark-400 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-dark-400">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-white">Reserv</span><span className="text-gold">Smart</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold px-3 mb-3">Administration</p>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold/15 text-gold border border-gold/20'
                    : 'text-gray-400 hover:text-white hover:bg-dark-400'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-dark-400">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.username || user?.email}</p>
              <p className="text-gray-600 text-xs">Administrateur</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span>↩</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
