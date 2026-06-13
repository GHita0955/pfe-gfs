import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const state = location.state || {}
  const [service, setService] = useState(null)
  const [dateTabs] = useState(() => buildDateTabs(14))
  const [selectedDate, setSelectedDate] = useState(state.date || buildDateTabs(1)[0].iso)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [guestCount, setGuestCount] = useState(state.guests || 2)
  const [tableNumber, setTableNumber] = useState(state.tableNumber || null)
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
          <h2 className="text-2xl font-bold text-white mb-2">Réservation confirmée</h2>
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

  const selectedDateObject = new Date(selectedDate + 'T00:00:00')
  const selectedDateLabel = `${DAY_FR[selectedDateObject.getDay()]}, ${selectedDateObject.getDate()} ${MONTH_FR[selectedDateObject.getMonth()]}`

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {service && (
          <div className="mb-8 rounded-[32px] border border-dark-400 bg-[#090909] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-3">Réservation</p>
                <h1 className="text-4xl font-semibold text-white">{service.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">{service.description}</p>
              </div>
              <div className="rounded-3xl border border-dark-400 bg-dark-100 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-2">Durée</p>
                <p className="text-2xl font-semibold text-white">{service.duration} min</p>
                <p className="mt-2 text-sm text-gray-400">Prix de base {service.base_price}€</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="card-dark">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-2">Étape 1</p>
                  <h2 className="text-2xl font-semibold text-white">Date et invités</h2>
                </div>
                <span className="inline-flex rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold font-semibold">Sélection</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.35fr_0.85fr]">
                <div className="rounded-3xl border border-dark-400 bg-[#0f0f11] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-4">Date sélectionnée</p>
                  <div className="rounded-3xl border border-dark-400 bg-dark-50 p-5">
                    <p className="text-sm text-gray-400">{selectedDateLabel}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{selectedDateObject.getDate()}</p>
                    <p className="text-sm text-gray-400">{MONTH_FR[selectedDateObject.getMonth()]}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-dark-400 bg-[#0f0f11] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-4">Nombre de personnes</p>
                  <div className="rounded-3xl border border-dark-400 bg-dark-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-400">Invités</span>
                      <div className="inline-flex items-center gap-3 rounded-full border border-dark-400 bg-black/40 p-2">
                        <button
                          type="button"
                          disabled={guestCount === 1}
                          onClick={() => setGuestCount(count => Math.max(1, count - 1))}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dark-400 bg-dark-100 text-white disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="text-xl font-semibold text-white">{guestCount}</span>
                        <button
                          type="button"
                          onClick={() => setGuestCount(count => Math.min(12, count + 1))}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dark-400 bg-dark-100 text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-3">Choisissez une nouvelle date</p>
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                  {dateTabs.map(tab => (
                    <button
                      key={tab.iso}
                      onClick={() => setSelectedDate(tab.iso)}
                      className={`flex flex-col items-center min-w-[60px] px-3 py-3 rounded-2xl border text-sm transition-all shrink-0 ${
                        selectedDate === tab.iso
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-dark-400 bg-dark-50 text-gray-400 hover:border-gold/30 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-[0.3em]">{tab.dayName}</span>
                      <span className="mt-2 text-lg font-bold">{tab.dayNum}</span>
                      <span className="text-[11px] text-gray-400 mt-1">{tab.monthName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-dark">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Créneaux disponibles</p>
                  <h3 className="text-xl font-semibold text-white">Sélectionnez l'heure</h3>
                </div>
                <p className="text-sm text-gray-400">{slots.length} créneaux trouvés</p>
              </div>

              {error && <div className="mb-4 rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

              {slotsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-3xl border border-dark-400 bg-dark-50 p-8 text-center text-gray-400">
                  <p className="text-sm font-semibold text-white mb-2">Aucun créneau disponible</p>
                  <p className="text-sm">Essayez une autre date ou revenez plus tard.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slots.map(slot => {
                    const available = slot.is_available
                    const selected = selectedSlot?.id === slot.id
                    return (
                      <button
                        key={slot.id}
                        disabled={!available}
                        onClick={() => available && setSelectedSlot(selected ? null : slot)}
                        className={`w-full rounded-3xl border p-4 text-left transition-all ${
                          !available
                            ? 'border-dark-400 bg-dark-50 text-gray-500 cursor-not-allowed'
                            : selected
                            ? 'border-gold bg-gold/10 shadow-gold'
                            : 'border-dark-400 bg-dark-100 hover:border-gold/40 hover:bg-dark-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={`text-lg font-semibold ${selected ? 'text-gold' : 'text-white'}`}>{slot.start_time}</p>
                            <p className="text-sm text-gray-400">Jusqu'à {slot.end_time}</p>
                          </div>
                          <span className={`text-sm font-semibold ${available ? 'text-gold' : 'text-gray-500'}`}>{available ? `${slot.dynamic_price}€` : 'Réservé'}</span>
                        </div>
                        {available && (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {slot.is_discounted && <span className="rounded-full border border-green-500/25 bg-green-500/10 px-2 py-1 text-green-300">Promo</span>}
                            {slot.is_peak && <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-2 py-1 text-orange-300">Forte demande</span>}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card-dark sticky top-20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Étape finale</p>
                  <h2 className="text-2xl font-semibold text-white">Votre récapitulatif</h2>
                </div>
                <div className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold font-semibold">Prêt</div>
              </div>

              {selectedSlot ? (
                <>
                  <div className="space-y-3">
                    {[
                      ['Service', service?.name],
                      ['Date', selectedDateLabel],
                      ['Heure', `${selectedSlot.start_time} – ${selectedSlot.end_time}`],
                      ['Table', tableNumber || 'Non sélectionnée'],
                      ['Personnes', `${guestCount} invité${guestCount > 1 ? 's' : ''}`],
                      ['Prix de base', `${service?.base_price}€`],
                      ...(selectedSlot.price_multiplier !== 1 ? [['Ajustement', `×${selectedSlot.price_multiplier}`]] : [])
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm border-b border-dark-400 pb-3">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-3xl border border-dark-400 bg-[#0f0f11] p-5">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>Total estimé</span>
                      <span className="text-gold font-semibold text-lg">{selectedSlot.dynamic_price}€</span>
                    </div>
                    <p className="text-xs text-gray-500">Le prix final est confirmé à la validation. Les tarifs peuvent varier selon le créneau.</p>
                  </div>

                  {selectedSlot.is_discounted && <p className="mt-4 rounded-3xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">Tarif réduit appliqué.</p>}
                  {selectedSlot.is_peak && <p className="mt-4 rounded-3xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">Période de forte demande.</p>}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Notes supplémentaires</label>
                    <textarea
                      className="input-dark resize-none text-sm"
                      placeholder="Ajouter un commentaire ou une demande spéciale"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

                  <button className="btn-gold w-full mt-6" onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Confirmation…' : 'Confirmer la réservation'}
                  </button>
                  <button className="btn-ghost w-full mt-3 text-sm" onClick={() => setSelectedSlot(null)}>
                    Choisir un autre créneau
                  </button>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-dark-400 bg-dark-50 p-10 text-center text-gray-400">
                  <p className="text-sm font-semibold text-white mb-2">Aucun créneau sélectionné</p>
                  <p className="text-sm">Sélectionnez un créneau à gauche pour afficher le résumé.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
