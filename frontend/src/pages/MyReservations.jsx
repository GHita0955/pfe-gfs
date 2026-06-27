import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiSearch, FiX } from 'react-icons/fi'
import { reservationsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ConfirmModal'

const MONTH_FR = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']

function StatusBadge({ status }) {
  const map = {
    confirmed: 'badge-green',
    cancelled: 'badge-red',
    pending: 'badge-gold',
  }
  const labels = { confirmed: 'Confirmee', cancelled: 'Annulee', pending: 'En attente' }
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [downloading, setDownloading] = useState('')
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)
    setFetchError('')
    reservationsAPI.getAll({
      status: filter,
      q: debouncedSearch || undefined
    })
      .then(res => {
        if (!active) return
        setReservations(Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => {
        if (!active) return
        setReservations([])
        setFetchError('Impossible de charger les reservations.')
        toast.error('Erreur', 'Impossible de charger les reservations.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filter, debouncedSearch])

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleReceipt = async (id) => {
    setDownloading(`receipt-${id}`)
    try {
      const res = await reservationsAPI.receipt(id)
      downloadBlob(res.data, `recu-reservation-${id}.pdf`)
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || 'Impossible de telecharger le recu.')
    } finally {
      setDownloading('')
    }
  }

  const handleQr = async (id) => {
    setDownloading(`qr-${id}`)
    try {
      const res = await reservationsAPI.qr(id)
      downloadBlob(res.data, `qr-reservation-${id}.svg`)
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || 'Impossible de telecharger le QR code.')
    } finally {
      setDownloading('')
    }
  }

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Annuler la reservation ?',
      message: 'Cette action est irreversible. Votre creneau sera libere.',
      danger: true
    })
    if (!ok) return
    setCancellingId(id)
    try {
      const res = await reservationsAPI.cancel(id)
      setReservations(prev => prev.map(r => r.id === id ? res.data : r))
      toast.success('Reservation annulee', 'Votre creneau a ete libere.')
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || "Impossible d'annuler.")
    } finally {
      setCancellingId(null)
    }
  }

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-dark-400 text-gray-400 hover:border-gold/40 hover:text-gold transition-colors"
              onClick={() => navigate(-1)}
              aria-label="Retour"
              title="Retour"
            >
              <FiArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Mes Reservations</h1>
              <p className="text-gray-500 text-sm mt-1">
                {reservations.length} resultat{reservations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button className="btn-gold text-sm" onClick={() => navigate('/')}>+ Nouvelle</button>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              className="input-dark pl-11 pr-11 text-sm"
              placeholder="Rechercher par service, client, date ou numero..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                onClick={() => setSearch('')}
                aria-label="Effacer la recherche"
                title="Effacer"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[['all', 'Toutes'], ['confirmed', 'Confirmees'], ['cancelled', 'Annulees']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === key ? 'bg-gold/15 text-gold border border-gold/30' : 'text-gray-400 border border-dark-400 hover:text-white hover:border-gold/20'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {fetchError}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-white font-semibold mb-1">Aucune reservation</h3>
            <p className="text-gray-500 text-sm mb-5">Aucun resultat ne correspond a cette consultation.</p>
            <button className="btn-gold text-sm" onClick={() => navigate('/')}>Reserver maintenant</button>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map(res => {
              const slot = res.slot
              const dateObj = slot ? new Date(slot.date + 'T00:00:00') : null
              return (
                <div
                  key={res.id}
                  className={`card-dark flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 hover:border-gold/20 transition-all ${res.status === 'cancelled' ? 'opacity-60' : ''}`}
                >
                  {dateObj && (
                    <div className="shrink-0 w-14 text-center bg-dark-300 rounded-xl p-2.5 border border-dark-400">
                      <p className="text-gold font-bold text-xl leading-none">{dateObj.getDate()}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{MONTH_FR[dateObj.getMonth()]}</p>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{slot?.service_name || 'Service'}</p>
                    <p className="text-gray-500 text-sm">
                      {slot?.start_time} - {slot?.end_time}
                      {dateObj && ` - ${dateObj.getFullYear()}`}
                    </p>
                    {res.notes && <p className="text-gray-600 text-xs mt-1 italic">"{res.notes}"</p>}
                  </div>

                  <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
                    <p className="text-gold font-bold">{res.price} EUR</p>
                    <StatusBadge status={res.status} />
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button
                        className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light border border-gold/30 hover:border-gold/50 px-3 py-1 rounded-lg transition-colors"
                        onClick={() => handleReceipt(res.id)}
                        disabled={downloading === `receipt-${res.id}`}
                      >
                        <FiDownload />
                        {downloading === `receipt-${res.id}` ? '...' : 'PDF'}
                      </button>
                      <button
                        className="text-xs text-gray-300 hover:text-white border border-dark-400 hover:border-gold/40 px-3 py-1 rounded-lg transition-colors"
                        onClick={() => handleQr(res.id)}
                        disabled={downloading === `qr-${res.id}`}
                      >
                        {downloading === `qr-${res.id}` ? '...' : 'QR'}
                      </button>
                      {res.status === 'confirmed' && (
                        <button
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-3 py-1 rounded-lg transition-colors"
                          onClick={() => handleCancel(res.id)}
                          disabled={cancellingId === res.id}
                        >
                          {cancellingId === res.id ? '...' : 'Annuler'}
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
    </div>
  )
}
