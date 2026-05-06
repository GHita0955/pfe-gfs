import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ICONS = ['🍽️', '⭐', '🎯', '🏆', '💡', '🔬']

const FEATURES = [
  { icon: '💰', title: 'Prix Dynamiques', desc: "Les tarifs s'adaptent selon la demande et le type de jour." },
  { icon: '📊', title: 'Prévision demande', desc: "Identifiez les créneaux les plus demandés à l'avance." },
  { icon: '🔔', title: 'Confirmation instantanée', desc: 'Votre réservation est confirmée immédiatement.' },
  { icon: '🔄', title: 'Modification facile', desc: 'Modifiez ou annulez votre réservation à tout moment.' },
]

export default function Home() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    servicesAPI.getAll()
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleBook = (serviceId) => navigate(user ? `/book/${serviceId}` : '/login')

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,166,35,0.08),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-widest mb-6">
            ✦ Système Intelligent de Réservation
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Réservez votre<br />
            <span className="text-gold">expérience idéale</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Des prix ajustés en temps réel selon la demande. Obtenez toujours la meilleure offre.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="px-4 py-2 bg-dark-50 border border-dark-400 rounded-full text-sm text-gray-300">📈 Tarification dynamique</span>
            <span className="px-4 py-2 bg-dark-50 border border-dark-400 rounded-full text-sm text-gray-300">🗓️ Créneaux optimisés</span>
            <span className="px-4 py-2 bg-dark-50 border border-dark-400 rounded-full text-sm text-gray-300">⚡ Réservation instantanée</span>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Nos Services</h2>
            <p className="text-gray-500 text-sm mt-1">Choisissez le service qui vous convient</p>
          </div>
          {!user && (
            <button className="btn-outline-gold text-sm hidden sm:flex" onClick={() => navigate('/login')}>
              Se connecter
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-sm">Chargement des services…</span>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-white font-semibold text-lg mb-1">Aucun service disponible</h3>
            <p className="text-gray-500 text-sm">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, idx) => (
              <div key={service.id} className="card-dark hover:border-gold/30 hover:shadow-gold transition-all duration-300 flex flex-col group">
                <div className="text-4xl mb-4">{ICONS[idx % ICONS.length]}</div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-gold transition-colors">{service.name}</h3>
                <p className="text-gray-500 text-sm mb-4 flex-1">{service.description || 'Aucune description disponible.'}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 bg-dark-300 px-3 py-1 rounded-full">⏱ {service.duration} min</span>
                  <span className="text-gold font-bold text-sm">À partir de {service.base_price}€</span>
                </div>
                <button className="btn-gold w-full text-sm" onClick={() => handleBook(service.id)}>
                  {user ? 'Réserver maintenant' : 'Se connecter & Réserver'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="border-t border-dark-400 pt-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Pourquoi ReservSmart ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(item => (
              <div key={item.title} className="p-5 bg-dark-50 border border-dark-400 rounded-xl hover:border-gold/30 transition-colors">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
