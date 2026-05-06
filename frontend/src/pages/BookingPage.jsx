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
    tabs.push({ iso, dayName: DAY_FR[d.getDay()], dayNum: d.getDate(), monthName: MONTH_FR[d.getMonth()] })
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

  useEffect(() => {
    servicesAPI.getOne(serviceId).then(res => setService(res.data)).catch(() => navigate('/'))
  }, [serviceId, navigate])

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
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="card-dark max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
          <h2 className="text-2xl font-bold text-white mb-2">Réservation confirmée !</h2>
          <p className="text-gray-400 text-sm mb-1">{service?.name} — {dateObj ? `${dateObj.getDate()} ${MONTH_FR[dateObj.getMonth()]}` : ''}</p>
          <p className="text-gray-400 text-sm mb-4">de {slot?.start_time} à {slot?.end_time}</p>
          <p className="text-gold font-bold text-2xl mb-6">{bookedReservation?.price}€</p>
          <div className="flex gap-3">
            <button className="btn-gold flex-1" onClick={() => navigate('/reservations')}>Mes réservations</button>
            <button className="btn-outline-gold flex-1" onClick={() => navigate('/')}>Accueil</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Service header */}
        {service && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">{service.name}</h1>
            <p className="text-gray-500 text-sm mb-3">{service.description}</p>
            <div className="flex gap-4">
              <span className="text-xs text-gray-500 bg-dark-50 border border-dark-400 px-3 py-1.5 rounded-full">⏱ {service.duration} min</span>
              <span className="text-xs text-gray-500 bg-dark-50 border border-dark-400 px-3 py-1.5 rounded-full">💶 À partir de {service.base_price}€</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: date + slots */}
          <div>
            {/* Date tabs */}
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Choisissez une date</p>
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
              {dateTabs.map(tab => (
                <button
                  key={tab.iso}
                  onClick={() => setSelectedDate(tab.iso)}
                  className={`flex flex-col items-center min-w-[56px] px-3 py-2.5 rounded-xl border text-sm transition-all shrink-0 ${
                    selectedDate === tab.iso
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-dark-400 bg-dark-50 text-gray-400 hover:border-gold/30 hover:text-white'
                  }`}
                >
                  <span className="text-xs">{tab.dayName}</span>
                  <span className="font-bold text-base">{tab.dayNum}</span>
                  <span className="text-xs">{tab.monthName}</span>
                </button>
              ))}
            </div>

            {/* Slots */}
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-6 mb-3">
              Créneaux disponibles
            </p>

            {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

            {slotsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🗓️</div>
                <p className="text-white font-semibold mb-1">Aucun créneau disponible</p>
                <p className="text-gray-500 text-sm">Essayez une autre date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map(slot => {
                  const available = slot.is_available
                  const selected = selectedSlot?.id === slot.id
                  return (
                    <button
                      key={slot.id}
                      disabled={!available}
                      onClick={() => available && setSelectedSlot(selected ? null : slot)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        !available ? 'border-dark-400 bg-dark-50 opacity-40 cursor-not-allowed'
                        : selected ? 'border-gold bg-gold/10 shadow-gold'
                        : 'border-dark-400 bg-dark-50 hover:border-gold/40 hover:bg-dark-200'
                      }`}
                    >
                      <p className={`font-bold text-sm ${selected ? 'text-gold' : 'text-white'}`}>{slot.start_time}</p>
                      <p className="text-xs text-gray-600">→ {slot.end_time}</p>
                      <p className={`font-semibold text-sm mt-1 ${
                        !available ? 'text-gray-600'
                        : slot.is_discounted ? 'text-green-400'
                        : slot.is_peak ? 'text-orange-400'
                        : 'text-gold'
                      }`}>
                        {available ? `${slot.dynamic_price}€` : 'Réservé'}
                      </p>
                      {available && slot.is_discounted && <p className="text-xs text-green-400 mt-0.5">🏷 Promo</p>}
                      {available && slot.is_peak && <p className="text-xs text-orange-400 mt-0.5">🔥 Peak</p>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: summary */}
          <div>
            <div className="card-dark sticky top-20">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <span className="text-gold">📋</span> Récapitulatif
              </h3>

              {selectedSlot ? (
                <>
                  {[
                    ['Service', service?.name],
                    ['Date', (() => { const d = new Date(selectedDate + 'T00:00:00'); return `${d.getDate()} ${MONTH_FR[d.getMonth()]}` })()],
                    ['Horaire', `${selectedSlot.start_time} – ${selectedSlot.end_time}`],
                    ['Prix de base', `${service?.base_price}€`],
                    ...(selectedSlot.price_multiplier !== 1 ? [['Ajustement', `×${selectedSlot.price_multiplier}`]] : [])
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-2 border-b border-dark-400">
                      <span className="text-gray-500">{k}</span>
                      <span className="text-white font-medium">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-gold font-bold text-xl">{selectedSlot.dynamic_price}€</span>
                  </div>

                  {selectedSlot.is_discounted && <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-3">🏷 Tarif réduit appliqué !</p>}
                  {selectedSlot.is_peak && <p className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 mb-3">🔥 Période de forte demande</p>}

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Notes (optionnel)</label>
                    <textarea
                      className="input-dark resize-none text-sm"
                      placeholder="Informations supplémentaires…"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

                  <button className="btn-gold w-full mt-4" onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Confirmation…' : '✓ Confirmer la réservation'}
                  </button>
                  <button className="btn-ghost w-full mt-2 text-sm" onClick={() => setSelectedSlot(null)}>
                    Annuler
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-3xl mb-3">👈</p>
                  <p className="text-sm">Sélectionnez un créneau pour confirmer votre réservation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
