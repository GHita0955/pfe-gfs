import { useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const isHome = location.pathname === '/'

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const initials = user
    ? (user.username || user.email || '?').slice(0, 2).toUpperCase()
    : ''

  const desktopLink = ({ isActive }) => (
    isHome
      ? `text-xs font-bold text-white/90 drop-shadow-md transition-colors hover:text-gold ${isActive ? 'text-white' : ''}`
      : `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`
  )

  const mobileLink = ({ isActive }) => (
    `block px-4 py-2.5 rounded-lg text-sm font-medium ${
      isActive ? 'text-gold bg-gold/10' : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`
  )

  return (
    <nav className={isHome ? 'absolute left-0 right-0 top-0 z-50 bg-transparent' : 'sticky top-0 z-50 bg-dark-100/95 backdrop-blur border-b border-dark-400'}>
      <div className={`${isHome ? 'max-w-7xl px-7 sm:px-12 md:px-16 lg:px-20' : 'max-w-7xl px-4 sm:px-6'} mx-auto h-16 flex items-center justify-between`}>
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className={isHome ? 'font-serif text-xl font-bold italic text-white drop-shadow-md transition-colors hover:text-gold' : 'flex items-center gap-2 text-xl font-bold tracking-tight'}
        >
          {isHome ? (
            'ReservSmart'
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-gold inline-block" />
              <span className="text-white">Reserv</span>
              <span className="text-gold">Smart</span>
            </>
          )}
        </Link>

        <button
          className={`${isHome ? 'bg-black/20 text-white/90 backdrop-blur-sm hover:text-gold' : 'text-gray-400 hover:text-white'} md:hidden p-2 rounded-lg`}
          aria-label="Menu"
          onClick={() => setOpen(o => !o)}
        >
          {open
            ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>

        <ul className={`${isHome ? 'gap-8' : 'gap-1'} hidden md:flex items-center`}>
          <li><NavLink to="/" end className={desktopLink}>Home</NavLink></li>
          <li><NavLink to="/menu" className={desktopLink}>Menu</NavLink></li>

          {!user && (
            <>
              <li><NavLink to="/login" className={desktopLink}>Connexion</NavLink></li>
              <li>
                <NavLink
                  to="/register"
                  className={isHome ? 'rounded-full border border-white/35 px-4 py-2 text-xs font-bold text-white transition-all hover:border-gold hover:bg-black/20 hover:text-gold' : 'btn-gold text-sm ml-2'}
                >
                  S'inscrire
                </NavLink>
              </li>
            </>
          )}

          {user && user.role === 'client' && (
            <li><NavLink to="/reservations" className={desktopLink}>Reservations</NavLink></li>
          )}

          {user && user.role === 'admin' && (
            <li><NavLink to="/admin/dashboard" className={desktopLink}>Administration</NavLink></li>
          )}

          {user && (
            <li>
              <button
                onClick={handleLogout}
                title="Deconnexion"
                className={`${isHome ? 'border-white/30 bg-black/15 text-white backdrop-blur-sm hover:border-gold/60' : 'border-dark-400 hover:border-gold/50'} flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg border transition-all group`}
              >
                <span className="w-7 h-7 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center">{initials}</span>
                <span className={`${isHome ? 'text-white/85' : 'text-gray-400'} text-sm group-hover:text-white max-w-[100px] truncate`}>
                  {user.username || user.email}
                </span>
              </button>
            </li>
          )}
        </ul>
      </div>

      {open && (
        <div className={`${isHome ? 'bg-black/85 border-white/10 backdrop-blur-md' : 'bg-dark-100 border-dark-400'} md:hidden border-t px-4 py-3 space-y-1 animate-fade-in`}>
          <NavLink to="/" end onClick={() => setOpen(false)} className={mobileLink}>Home</NavLink>
          <NavLink to="/menu" onClick={() => setOpen(false)} className={mobileLink}>Menu</NavLink>

          {!user && (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)} className={mobileLink}>Connexion</NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)} className="block btn-gold text-sm text-center mt-2">S'inscrire</NavLink>
            </>
          )}

          {user && user.role === 'client' && (
            <NavLink to="/reservations" onClick={() => setOpen(false)} className={mobileLink}>Reservations</NavLink>
          )}

          {user && user.role === 'admin' && (
            <NavLink to="/admin/dashboard" onClick={() => setOpen(false)} className={mobileLink}>Administration</NavLink>
          )}

          {user && (
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/10 transition-colors">
              <span className="w-6 h-6 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center">{initials}</span>
              Deconnexion
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
