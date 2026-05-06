import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
            <span className="text-white">Reserv</span><span className="text-gold">Smart</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez ReservSmart gratuitement</p>
        </div>

        <div className="card-dark animate-slide-up">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom d'utilisateur</label>
              <input type="text" name="username" className="input-dark" placeholder="jean_dupont"
                value={form.username} onChange={handleChange} required autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Adresse email</label>
              <input type="email" name="email" className="input-dark" placeholder="votre@email.com"
                value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
              <input type="password" name="password" className="input-dark" placeholder="Minimum 6 caractères"
                value={form.password} onChange={handleChange} required autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmer le mot de passe</label>
              <input type="password" name="confirm" className="input-dark" placeholder="Répétez votre mot de passe"
                value={form.confirm} onChange={handleChange} required autoComplete="new-password" />
            </div>
            <button type="submit" className="btn-gold w-full mt-2" disabled={loading}>
              {loading ? 'Inscription…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-gold hover:text-gold-light font-medium transition-colors">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
