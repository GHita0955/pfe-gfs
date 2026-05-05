import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { servicesAPI, slotsAPI, reservationsAPI } from '../services/api'

const DAY_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTH_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function buildDateTabs(count = 14) {
  const tabs = []
  const today = new Date()
  let i = 0
  while (tabs.length < count) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    tabs.push({
      iso,
      dayName: DAY_FR[d.getDay()],
      dayNum: d.getDate(),
      monthName: MONTH_FR[d.getMonth()]
    })
    i++
  }
  return tabs
}

export default function BookingPage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()

  const [service, setService] = useState(null)
  const [dateTabs] = useState(() => buildDateTabs(14))
  const [selectedDate, setSelectedDate] = useState(buildDateTabs(1)[0].iso)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState('')
  const [booked, setBooked] = useState(false)
  const [bookedReservation, setBookedReservation] = useState(null)

  // Charger le service
  useEffect(() => {
    servicesAPI.getOne(serviceId)
      .then(res => setService(res.data))
      .catch(() => navigate('/'))
  }, [serviceId, navigate])

  // Charger les créneaux quand la date change
  useEffect(() => {
    setSelectedSlot(null)
    setSlotsLoading(true)
    setError('')
    slotsAPI.getAll({ service_id: serviceId, date: selectedDate })
      .then(res => setSlots(res.data))
      .catch(() => setError('Impossible de charger les créneaux'))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, serviceId])

  const handleConfirm = async () => {
    if (!selectedSlot) return
    setLoading(true)
    setError('')
    try {
      const res = await reservationsAPI.create({ slot_id: selectedSlot.id, notes })
      setBookedReservation(res.data)
      setBooked(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  if (booked) {
    const slot = bookedReservation?.slot
    const dateObj = slot ? new Date(slot.date + 'T00:00:00') : null
    return (
      <div className="page-container">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Réservation confirmée !</h2>
          <p>
            {service?.name} — {dateObj ? `${dateObj.getDate()} ${MONTH_FR[dateObj.getMonth()]}` : ''}{' '}
            de {slot?.start_time} à {slot?.end_time}
          </p>
          <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--gray-900)', margin: '0.5rem auto 2rem' }}>
            Prix payé : {bookedReservation?.price}€
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/reservations')}>
              Voir mes réservations
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/')}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* En-tête du service */}
      {service && (
        <div className="booking-service-header">
          <h2>{service.name}</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{service.description}</p>
          <div className="booking-service-meta">
            <span>⏱ Durée : {service.duration} min</span>
            <span>💶 Prix de base : {service.base_price}€</span>
          </div>
        </div>
      )}

      <div className="booking-layout">
        {/* Zone de sélection */}
        <div>
          {/* Sélecteur de date */}
          <p className="slots-section-title">Choisissez une date</p>
          <div className="date-tabs">
            {dateTabs.map(tab => (
              <button
                key={tab.iso}
                className={`date-tab${selectedDate === tab.iso ? ' active' : ''}`}
                onClick={() => setSelectedDate(tab.iso)}
              >
                <div className="dt-day">{tab.dayName}</div>
                <div className="dt-num">{tab.dayNum}</div>
                <div className="dt-month">{tab.monthName}</div>
              </button>
            ))}
          </div>

          {/* Créneaux disponibles */}
          <p className="slots-section-title">
            Créneaux disponibles —{' '}
            {(() => {
              const d = new Date(selectedDate + 'T00:00:00')
              return `${DAY_FR[d.getDay()]} ${d.getDate()} ${MONTH_FR[d.getMonth()]}`
            })()}
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {slotsLoading ? (
            <div className="loading-container" style={{ padding: '2rem' }}>
              <div className="spinner" />
            </div>
          ) : slots.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">🗓️</div>
              <h3>Aucun créneau disponible</h3>
              <p>Essayez une autre date</p>
            </div>
          ) : (
            <div className="slots-grid">
              {slots.map(slot => {
                const isAvailable = slot.is_available
                const isSelected = selectedSlot?.id === slot.id
                let priceClass = ''
                if (slot.is_discounted) priceClass = 'discount'
                else if (slot.is_peak) priceClass = 'peak'

                return (
                  <div
                    key={slot.id}
                    className={`slot-card${isSelected ? ' selected' : ''}${!isAvailable ? ' unavailable' : ''}`}
                    onClick={() => isAvailable && setSelectedSlot(isSelected ? null : slot)}
                  >
                    <div className="slot-time">{slot.start_time}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>→ {slot.end_time}</div>
                    <div className={`slot-price ${priceClass}`}>
                      {isAvailable ? `${slot.dynamic_price}€` : 'Réservé'}
                    </div>
                    {isAvailable && slot.is_discounted && (
                      <div className="slot-badge" style={{ color: 'var(--secondary)' }}>🏷 Promo</div>
                    )}
                    {isAvailable && slot.is_peak && (
                      <div className="slot-badge" style={{ color: 'var(--accent)' }}>🔥 Forte demande</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Panneau de réservation */}
        <div className="booking-summary">
          <h3>📋 Récapitulatif</h3>
          {selectedSlot ? (
            <>
              <div className="summary-row">
                <span>Service</span>
                <span>{service?.name}</span>
              </div>
              <div className="summary-row">
                <span>Date</span>
                <span>
                  {(() => {
                    const d = new Date(selectedDate + 'T00:00:00')
                    return `${d.getDate()} ${MONTH_FR[d.getMonth()]}`
                  })()}
                </span>
              </div>
              <div className="summary-row">
                <span>Horaire</span>
                <span>{selectedSlot.start_time} – {selectedSlot.end_time}</span>
              </div>
              <div className="summary-row">
                <span>Prix de base</span>
                <span>{service?.base_price}€</span>
              </div>
              {selectedSlot.price_multiplier !== 1 && (
                <div className="summary-row">
                  <span>Ajustement</span>
                  <span style={{ color: selectedSlot.is_discounted ? 'var(--secondary)' : 'var(--accent)' }}>
                    ×{selectedSlot.price_multiplier}
                  </span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>{selectedSlot.dynamic_price}€</span>
              </div>

              {selectedSlot.is_discounted && (
                <div className="alert alert-success" style={{ marginTop: '1rem' }}>
                  🏷 Tarif réduit appliqué !
                </div>
              )}
              {selectedSlot.is_peak && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                  🔥 Période de forte demande
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Notes (optionnel)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Informations supplémentaires…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleConfirm}
                disabled={loading}
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Confirmation…' : '✓ Confirmer la réservation'}
              </button>
              <button
                className="btn btn-ghost btn-full"
                onClick={() => setSelectedSlot(null)}
                style={{ marginTop: '0.5rem' }}
              >
                Annuler
              </button>
            </>
          ) : (
            <div className="summary-placeholder">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👈</div>
              <p>Sélectionnez un créneau pour voir le récapitulatif et confirmer votre réservation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
