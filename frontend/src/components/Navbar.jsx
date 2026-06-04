import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const initials = user
    ? (user.username || user.email || '?').slice(0, 2).toUpperCase()
    : ''

  return (
    <nav className="sticky top-0 z-50 bg-dark-100/95 backdrop-blur border-b border-dark-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" onClick={() => setOpen(false)}>
          <span className="w-2 h-2 rounded-full bg-gold inline-block" />
          <span className="text-white">Reserv</span>
          <span className="text-gold">Smart</span>
        </Link>

        <button className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg" aria-label="Menu" onClick={() => setOpen(o => !o)}>
          {open
            ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>

        <ul className="hidden md:flex items-center gap-1">
          <li><NavLink to="/" end className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`}>Accueil</NavLink></li>
          {!user && (<>
            <li><NavLink to="/login" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`}>Connexion</NavLink></li>
            <li><NavLink to="/register" className="btn-gold text-sm ml-2">S'inscrire</NavLink></li>
          </>)}
          {user && user.role === 'client' && (<li><NavLink to="/reservations" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`}>Mes réservations</NavLink></li>)}
          {user && user.role === 'admin' && (<li><NavLink to="/admin/dashboard" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`}>Administration</NavLink></li>)}
          {user && (
            <li>
              <button onClick={handleLogout} title="Déconnexion" className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg border border-dark-400 hover:border-gold/50 transition-all group">
                <span className="w-7 h-7 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center">{initials}</span>
                <span className="text-sm text-gray-400 group-hover:text-white max-w-[100px] truncate">{user.username || user.email}</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      {open && (
        <div className="md:hidden bg-dark-100 border-t border-dark-400 px-4 py-3 space-y-1 animate-fade-in">
          <NavLink to="/" end onClick={() => setOpen(false)} className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`}>Accueil</NavLink>
          {!user && (<>
            <NavLink to="/login" onClick={() => setOpen(false)} className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`}>Connexion</NavLink>
            <NavLink to="/register" onClick={() => setOpen(false)} className="block btn-gold text-sm text-center mt-2">S'inscrire</NavLink>
          </>)}
          {user && user.role === 'client' && (<NavLink to="/reservations" onClick={() => setOpen(false)} className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`}>Mes réservations</NavLink>)}
          {user && user.role === 'admin' && (<NavLink to="/admin/dashboard" onClick={() => setOpen(false)} className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-white hover:bg-dark-400'}`}>Administration</NavLink>)}
          {user && (<button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"><span className="w-6 h-6 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center">{initials}</span>Déconnexion</button>)}
        </div>
      )}
    </nav>
  )
}
