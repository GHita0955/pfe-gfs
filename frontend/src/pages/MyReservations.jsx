import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservationsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ConfirmModal'

const MONTH_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function StatusBadge({ status }) {
  const map = {
    confirmed: 'badge-green',
    cancelled:  'badge-red',
    pending:    'badge-gold',
  }
  const labels = { confirmed: 'Confirmée', cancelled: 'Annulée', pending: 'En attente' }
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  useEffect(() => {
    reservationsAPI.getAll()
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    const ok = await confirm({ title: 'Annuler la réservation ?', message: 'Cette action est irréversible. Votre créneau sera libéré.', danger: true })
    if (!ok) return
    setCancellingId(id)
    try {
      const res = await reservationsAPI.cancel(id)
      setReservations(prev => prev.map(r => r.id === id ? res.data : r))
      toast.success('Réservation annulée', 'Votre créneau a été libéré.')
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || "Impossible d'annuler.")
    } finally {
      setCancellingId(null)
    }
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Mes Réservations</h1>
            <p className="text-gray-500 text-sm mt-1">{reservations.length} réservation{reservations.length !== 1 ? 's' : ''} au total</p>
          </div>
          <button className="btn-gold text-sm" onClick={() => navigate('/')}>+ Nouvelle</button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[['all', 'Toutes'], ['confirmed', 'Confirmées'], ['cancelled', 'Annulées']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === key ? 'bg-gold/15 text-gold border border-gold/30' : 'text-gray-400 border border-dark-400 hover:text-white hover:border-gold/20'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-white font-semibold mb-1">Aucune réservation</h3>
            <p className="text-gray-500 text-sm mb-5">Vous n'avez pas encore de réservation dans cette catégorie.</p>
            <button className="btn-gold text-sm" onClick={() => navigate('/')}>Réserver maintenant</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(res => {
              const slot = res.slot
              const dateObj = slot ? new Date(slot.date + 'T00:00:00') : null
              return (
                <div
                  key={res.id}
                  className={`card-dark flex items-center gap-5 hover:border-gold/20 transition-all ${res.status === 'cancelled' ? 'opacity-60' : ''}`}
                >
                  {/* Date box */}
                  {dateObj && (
                    <div className="shrink-0 w-14 text-center bg-dark-300 rounded-xl p-2.5 border border-dark-400">
                      <p className="text-gold font-bold text-xl leading-none">{dateObj.getDate()}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{MONTH_FR[dateObj.getMonth()]}</p>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{slot?.service_name || 'Service'}</p>
                    <p className="text-gray-500 text-sm">
                      {slot?.start_time} – {slot?.end_time}
                      {dateObj && ` · ${dateObj.getFullYear()}`}
                    </p>
                    {res.notes && <p className="text-gray-600 text-xs mt-1 italic">"{res.notes}"</p>}
                  </div>

                  {/* Right */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <p className="text-gold font-bold">{res.price}€</p>
                    <StatusBadge status={res.status} />
                    {res.status === 'confirmed' && (
                      <button
                        className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-3 py-1 rounded-lg transition-colors"
                        onClick={() => handleCancel(res.id)}
                        disabled={cancellingId === res.id}
                      >
                        {cancellingId === res.id ? '…' : 'Annuler'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
