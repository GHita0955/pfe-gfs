import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      if (!err.response) {
        setError('Serveur backend inaccessible (port 5000). Démarrez le backend puis réessayez.')
      } else {
        setError(err.response?.data?.error || 'Erreur de connexion')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
            <span className="text-white">Reserv</span><span className="text-gold">Smart</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Connexion</h1>
          <p className="text-gray-500 text-sm">Accédez à votre espace de réservation</p>
        </div>

        <div className="card-dark animate-slide-up">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <span>&#9888;</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Adresse email</label>
              <input type="email" className="input-dark" placeholder="votre@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
              <input type="password" className="input-dark" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-gold w-full mt-2" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-gold hover:text-gold-light font-medium transition-colors">Créer un compte</Link>
          </p>
        </div>

        {/* Demo credentials removed as requested */}
      </div>
    </div>
  )
}
