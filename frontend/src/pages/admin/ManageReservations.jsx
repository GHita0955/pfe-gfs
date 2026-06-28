import { useEffect, useState } from 'react'
import { FiDownload, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'
import { reservationsAPI } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../components/ConfirmModal'

function StatusBadge({ status }) {
  const map = { confirmed: 'badge-green', cancelled: 'badge-red', pending: 'badge-gold' }
  const labels = { confirmed: 'Confirmee', cancelled: 'Annulee', pending: 'En attente' }
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function ManageReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [actionId, setActionId] = useState(null)
  const [downloadId, setDownloadId] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const confirm = useConfirm()

  const loadReservations = () => {
    setLoading(true)
    reservationsAPI.getAll({
      status: statusFilter,
      q: search.trim() || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined
    })
      .then(res => setReservations(res.data))
      .catch(() => toast.error('Erreur', 'Impossible de charger les reservations.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReservations()
  }, [statusFilter, search, dateFrom, dateTo])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearch(q)
  }, [searchParams])

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Annuler la reservation ?',
      message: 'Cette action est irreversible. Le creneau sera libere.',
      danger: true
    })
    if (!ok) return
    setActionId(id)
    try {
      const res = await reservationsAPI.cancel(id)
      setReservations(prev => prev.map(r => r.id === id ? res.data : r))
      toast.success('Reservation annulee', 'Le creneau a ete libere.')
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || "Impossible d'annuler.")
    } finally {
      setActionId(null)
    }
  }

  const handleReceipt = async (id) => {
    setDownloadId(`receipt-${id}`)
    try {
      const res = await reservationsAPI.receipt(id)
      downloadBlob(res.data, `recu-reservation-${id}.pdf`)
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || 'Impossible de telecharger le recu.')
    } finally {
      setDownloadId('')
    }
  }

  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length
  const pendingCount = reservations.filter(r => r.status === 'pending').length

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-5 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.08),transparent_35%)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-gold/25 bg-gradient-to-b from-[#171513] to-[#11100f] p-4">
            <p className="text-xs text-gray-500">Resultats</p>
            <p className="text-2xl font-bold text-gold mt-1">{reservations.length}</p>
          </div>
          <div className="rounded-2xl border border-[#25262a] bg-gradient-to-b from-[#141417] to-[#0f1012] p-4">
            <p className="text-xs text-gray-500">Confirmees</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{confirmedCount}</p>
          </div>
          <div className="rounded-2xl border border-[#25262a] bg-gradient-to-b from-[#141417] to-[#0f1012] p-4">
            <p className="text-xs text-gray-500">En attente</p>
            <p className="text-2xl font-bold text-gold mt-1">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-[#25262a] bg-gradient-to-b from-[#141417] to-[#0f1012] p-4">
            <p className="text-xs text-gray-500">Annulees</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{cancelledCount}</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion des Reservations</h1>
            <p className="text-gray-500 text-sm mt-1">Recherche et filtres avances connectes au backend</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-[#26262a] bg-[#121215] px-4 py-2 text-sm text-gray-300 hover:border-gold/40 hover:text-gold"
            onClick={loadReservations}
          >
            <FiRefreshCw />
            Actualiser
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              className="input-dark pl-11 pr-11 text-sm !bg-[#121215] !border-[#26262a]"
              placeholder="Rechercher client, email, service ou ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                onClick={() => setSearch('')}
                aria-label="Effacer"
              >
                <FiX />
              </button>
            )}
          </div>
          <input type="date" className="input-dark text-sm !bg-[#121215] !border-[#26262a]" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" className="input-dark text-sm !bg-[#121215] !border-[#26262a]" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-3">
          {[['all', 'Toutes'], ['confirmed', 'Confirmees'], ['cancelled', 'Annulees'], ['pending', 'En attente']].map(([k, l]) => (
            <button key={k} onClick={() => setStatusFilter(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === k ? 'bg-gradient-to-r from-gold/20 to-gold/5 text-gold border border-gold/30' : 'text-gray-400 border border-[#26262a] bg-[#121215] hover:text-white hover:border-[#34343a]'}`}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#25262a]">
                    {['#ID', 'Client', 'Service', 'Date', 'Horaire', 'Prix', 'Statut', 'Creee le', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.id} className="border-b border-[#222328] hover:bg-[#15161a] transition-colors">
                      <td className="px-4 py-3 text-gray-600 text-xs">#{r.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" />{r.client_name}</p>
                        <p className="text-gray-500 text-xs">{r.client_email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{r.slot?.service_name}</td>
                      <td className="px-4 py-3 text-gray-300">{r.slot?.date}</td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{r.slot?.start_time} - {r.slot?.end_time}</td>
                      <td className="px-4 py-3 text-gold font-semibold">{r.price} EUR</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light border border-gold/30 px-3 py-1.5 rounded-lg transition-colors"
                            onClick={() => handleReceipt(r.id)}
                            disabled={downloadId === `receipt-${r.id}`}
                          >
                            <FiDownload />
                            {downloadId === `receipt-${r.id}` ? '...' : 'PDF'}
                          </button>
                          {r.status === 'confirmed' && (
                            <button
                              className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
                              onClick={() => handleCancel(r.id)}
                              disabled={actionId === r.id}
                            >
                              {actionId === r.id ? '...' : 'Annuler'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reservations.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-white font-semibold">Aucune reservation trouvee</p>
                  <p className="text-gray-500 text-sm mt-1">Essayez de modifier les filtres.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
