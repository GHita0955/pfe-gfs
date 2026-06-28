import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { reservationsAPI } from '../services/api'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/reservations', label: 'Réservations', icon: 'reservations' },
  { to: '/admin/slots', label: 'Créneaux', icon: 'slots' },
  { to: '/admin/menu', label: 'Menu', icon: 'menu' },
  { to: '/admin/services', label: 'Services', icon: 'services' },
]

function AdminIcon({ name, className = 'w-4 h-4' }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="4" />
          <rect x="14" y="10" width="7" height="11" />
          <rect x="3" y="13" width="7" height="8" />
        </svg>
      )
    case 'reservations':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      )
    case 'slots':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 3v8a3 3 0 0 0 3 3h1V3" />
          <path d="M10 3v11" />
          <path d="M16 3c2 2 2 5 0 7l-1 1v10" />
        </svg>
      )
    case 'services':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9h.1a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6z" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      )
    case 'notifications':
      return (
        <svg {...common}>
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 17a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      )
    default:
      return null
  }
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [globalSearch, setGlobalSearch] = useState('')
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  const handleLogout = () => { logout(); navigate('/') }

  const initials = user ? (user.username || user.email || '?').slice(0, 2).toUpperCase() : ''
  const pendingCount = useMemo(
    () => notifications.filter((item) => item.status === 'pending').length,
    [notifications]
  )

  useEffect(() => {
    let mounted = true
    reservationsAPI.getAll({ status: 'pending' })
      .then((res) => {
        if (!mounted) return
        const pending = Array.isArray(res.data) ? res.data : []
        if (pending.length) {
          setNotifications(pending.slice(0, 5))
          return
        }

        reservationsAPI.getAll({})
          .then((allRes) => {
            if (!mounted) return
            setNotifications((Array.isArray(allRes.data) ? allRes.data : []).slice(0, 5))
          })
          .catch(() => {
            if (mounted) setNotifications([])
          })
      })
      .catch(() => {
        if (mounted) setNotifications([])
      })

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGlobalSearch = (e) => {
    e.preventDefault()
    const q = globalSearch.trim()
    if (!q) return
    navigate(`/admin/reservations?q=${encodeURIComponent(q)}`)
  }

  const openReservation = (id) => {
    setShowNotifications(false)
    navigate(`/admin/reservations?q=${encodeURIComponent(String(id))}`)
  }

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
                <AdminIcon name={item.icon} className="w-4 h-4" />
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
            <AdminIcon name="logout" className="w-4 h-4" /> Déconnexion
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
              <form
                onSubmit={handleGlobalSearch}
                className="hidden sm:flex items-center gap-2 rounded-xl border border-[#26262a] bg-[#121215] px-3 py-1.5 text-sm text-gray-500 transition-colors focus-within:border-gold/40"
              >
                <AdminIcon name="search" className="w-4 h-4" />
                <input
                  type="search"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search"
                  className="w-24 bg-transparent text-xs text-gray-200 outline-none placeholder:text-gray-500 md:w-32"
                />
              </form>
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative grid h-9 w-9 place-items-center rounded-xl border border-[#26262a] bg-[#121215] text-gray-300 transition-colors hover:border-gold/40 hover:text-gold"
                  aria-label="Notifications"
                >
                  <AdminIcon name="notifications" className="w-4 h-4" />
                  {pendingCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-black">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-11 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#26262a] bg-[#101012] shadow-2xl shadow-black/50">
                    <div className="flex items-center justify-between border-b border-[#222227] px-4 py-3">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      <button
                        type="button"
                        onClick={() => navigate('/admin/reservations')}
                        className="text-xs font-semibold text-gold hover:text-gold-light"
                      >
                        Voir tout
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => openReservation(item.id)}
                          className="block w-full border-b border-[#1f1f22] px-4 py-3 text-left transition-colors hover:bg-[#15161a]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                #{item.id} {item.client_name || item.client_email}
                              </p>
                              <p className="mt-1 truncate text-xs text-gray-500">
                                {item.slot?.service_name || 'Reservation'} - {item.slot?.date || 'Date inconnue'}
                              </p>
                            </div>
                            <span className={item.status === 'pending' ? 'badge-gold shrink-0' : 'badge-green shrink-0'}>
                              {item.status === 'pending' ? 'En attente' : 'Confirmee'}
                            </span>
                          </div>
                        </button>
                      )) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm font-semibold text-white">Aucune notification</p>
                          <p className="mt-1 text-xs text-gray-500">Les nouvelles reservations apparaitront ici.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 text-xs font-medium transition-colors flex items-center gap-2"
              >
                <AdminIcon name="logout" className="w-4 h-4" />
                Déconnexion
              </button>
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
