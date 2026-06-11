import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/reservations', label: 'Réservations', icon: '📋' },
  { to: '/admin/slots', label: 'Créneaux', icon: '🗓️' },
  { to: '/admin/menu', label: 'Menu', icon: '🍽️' },
  { to: '/admin/services', label: 'Services', icon: '⚙️' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const initials = user ? (user.username || user.email || '?').slice(0, 2).toUpperCase() : ''

  return (
    <div className="flex min-h-screen bg-[#060606]">
      <aside className="hidden md:flex w-64 bg-[#0b0b0c] border-r border-[#1f1f22] flex-col shrink-0 p-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#1a1410] to-[#0f0c0a] border border-[#2a221b] p-4">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-white">Reserv</span><span className="text-gold">Smart</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Admin workspace</p>
        </div>

        <nav className="flex-1 py-2 space-y-1">
          <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em] font-semibold px-3 mb-2">Menu</p>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-gold/20 to-gold/5 text-gold border border-gold/30 shadow-gold'
                    : 'text-gray-400 hover:text-white hover:bg-[#141417] border border-transparent hover:border-[#222227]'
                }`
              }
            >
              <span className="w-7 h-7 rounded-lg grid place-items-center bg-[#121215] border border-[#222227] group-hover:border-gold/30 text-[13px]">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-2xl border border-[#2a221b] bg-gradient-to-b from-[#1b1510] to-[#120f0d] p-4">
          <p className="text-gold text-sm font-semibold">Boost Your Booking</p>
          <p className="text-xs text-gray-400 mt-1">Optimisez vos menus et créneaux depuis le dashboard.</p>
          <button
            onClick={() => navigate('/admin/menu')}
            className="mt-3 w-full text-xs font-semibold bg-gold text-black rounded-lg py-2 hover:bg-gold-light transition-colors"
          >
            Gérer Menu
          </button>
        </div>

        <div className="p-3 rounded-xl border border-[#222227] bg-[#101012]">
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span>↩</span> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-20 border-b border-[#1f1f22] bg-[#0a0a0bdd] backdrop-blur">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-600">Hello</p>
              <p className="text-white text-sm md:text-base font-medium">Welcome back, {user?.username || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#26262a] bg-[#121215] text-gray-500 text-sm">
                <span>🔎</span>
                <span className="text-xs">Search</span>
              </div>
              <button className="w-9 h-9 rounded-xl border border-[#26262a] bg-[#121215] text-gray-300">🔔</button>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-[#26262a] bg-[#121215]">
                <span className="w-7 h-7 rounded-full bg-gold text-black text-[11px] font-bold grid place-items-center">{initials}</span>
                <span className="hidden md:block text-xs text-gray-300 max-w-[120px] truncate">{user?.username || user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
