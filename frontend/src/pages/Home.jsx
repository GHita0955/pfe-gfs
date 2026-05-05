import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const SERVICE_ICONS = ['📋', '⭐', '🎯', '💡', '🏆', '🔬']

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

  const handleBook = (serviceId) => {
    if (user) {
      navigate(`/book/${serviceId}`)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="hero">
        <h1>Système de Réservation Intelligent</h1>
        <p>
          Réservez vos créneaux facilement. Des prix ajustés en temps réel
          selon la demande pour toujours obtenir la meilleure offre.
        </p>
        <div className="hero-badges">
          <span className="hero-badge">📈 Tarification dynamique</span>
          <span className="hero-badge">🗓️ Créneaux optimisés</span>
          <span className="hero-badge">⚡ Réservation instantanée</span>
        </div>
      </div>

      {/* Services */}
      <div className="section-header">
        <h2 className="section-title" style={{ margin: 0 }}>Nos Services</h2>
        {!user && (
          <button className="btn btn-outline" onClick={() => navigate('/login')}>
            Se connecter pour réserver
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            Chargement des services…
          </span>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Aucun service disponible</h3>
          <p>Revenez bientôt !</p>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((service, idx) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{SERVICE_ICONS[idx % SERVICE_ICONS.length]}</div>
              <h3>{service.name}</h3>
              <p>{service.description || 'Aucune description disponible.'}</p>
              <div className="service-meta">
                <span className="service-duration">⏱ {service.duration} min</span>
                <span className="service-price">À partir de {service.base_price}€</span>
              </div>
              <button
                className="btn btn-primary btn-full"
                onClick={() => handleBook(service.id)}
              >
                {user ? 'Réserver maintenant' : 'Se connecter & Réserver'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info section */}
      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { icon: '💰', title: 'Prix Dynamiques', desc: 'Les tarifs s\'adaptent selon la demande et le type de jour.' },
          { icon: '📊', title: 'Prévision de la demande', desc: 'Identifiez les créneaux les plus demandés à l\'avance.' },
          { icon: '🔔', title: 'Confirmation instantanée', desc: 'Votre réservation est confirmée immédiatement.' },
          { icon: '🔄', title: 'Modification facile', desc: 'Modifiez ou annulez votre réservation à tout moment.' }
        ].map(item => (
          <div key={item.title} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.icon}</div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.375rem', color: 'var(--gray-800)' }}>{item.title}</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
