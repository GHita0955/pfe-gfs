import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservationsAPI } from '../services/api'

const MONTH_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function StatusBadge({ status }) {
  const map = {
    confirmed: { label: 'Confirmée', cls: 'badge-success' },
    cancelled: { label: 'Annulée', cls: 'badge-danger' },
    pending: { label: 'En attente', cls: 'badge-warning' }
  }
  const { label, cls } = map[status] || { label: status, cls: 'badge-gray' }
  return <span className={`badge ${cls}`}>{label}</span>
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    reservationsAPI.getAll()
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!confirm('Confirmer l\'annulation de cette réservation ?')) return
    setCancellingId(id)
    try {
      const res = await reservationsAPI.cancel(id)
      setReservations(prev => prev.map(r => r.id === id ? res.data : r))
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'annulation')
    } finally {
      setCancellingId(null)
    }
  }

  const filtered = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter)

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container"><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2>Mes Réservations</h2>
          <p>{reservations.length} réservation{reservations.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          + Nouvelle réservation
        </button>
      </div>

      {/* Filtres */}
      <div className="filter-bar">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'confirmed', label: 'Confirmées' },
          { key: 'cancelled', label: 'Annulées' }
        ].map(f => (
          <button
            key={f.key}
            className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Aucune réservation</h3>
          <p>Vous n'avez pas encore de réservation dans cette catégorie.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
            Réserver maintenant
          </button>
        </div>
      ) : (
        <div className="reservations-list">
          {filtered.map(res => {
            const slot = res.slot
            const dateObj = slot ? new Date(slot.date + 'T00:00:00') : null

            return (
              <div key={res.id} className="reservation-card" style={{ opacity: res.status === 'cancelled' ? 0.7 : 1 }}>
                {/* Date box */}
                {dateObj && (
                  <div className="reservation-date-box">
                    <div className="rd-day">{dateObj.getDate()}</div>
                    <div className="rd-month">{MONTH_FR[dateObj.getMonth()]}</div>
                  </div>
                )}

                {/* Info */}
                <div className="reservation-info">
                  <h4>{slot?.service_name || 'Service'}</h4>
                  <p>
                    {slot?.start_time} – {slot?.end_time}
                    {dateObj && ` · ${dateObj.getFullYear()}`}
                  </p>
                  {res.notes && (
                    <p style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
                      "{res.notes}"
                    </p>
                  )}
                </div>

                {/* Status & price */}
                <div className="reservation-right">
                  <div className="reservation-price">{res.price}€</div>
                  <StatusBadge status={res.status} />
                  <div className="reservation-actions">
                    {res.status === 'confirmed' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(res.id)}
                        disabled={cancellingId === res.id}
                      >
                        {cancellingId === res.id ? '…' : 'Annuler'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
