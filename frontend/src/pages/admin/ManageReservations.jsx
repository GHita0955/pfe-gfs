import { useState, useEffect } from 'react'
import { reservationsAPI } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../components/ConfirmModal'

function StatusBadge({ status }) {
  const map = { confirmed: 'badge-green', cancelled: 'badge-red', pending: 'badge-gold' }
  const labels = { confirmed: 'Confirmée', cancelled: 'Annulée', pending: 'En attente' }
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>
}

export default function ManageReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState(null)
  const toast = useToast()
  const confirm = useConfirm()

  useEffect(() => {
    reservationsAPI.getAll().then(res => setReservations(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    const ok = await confirm({ title: 'Annuler la réservation ?', message: 'Cette action est irréversible. Le créneau sera libéré.', danger: true })
    if (!ok) return
    setActionId(id)
    try {
      const res = await reservationsAPI.cancel(id)
      setReservations(prev => prev.map(r => r.id === id ? res.data : r))
      toast.success('Réservation annulée', 'Le créneau a été libéré.')
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || "Impossible d'annuler.")
    } finally {
      setActionId(null)
    }
  }

  const filtered = reservations.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || r.client_name?.toLowerCase().includes(q) || r.client_email?.toLowerCase().includes(q) || r.slot?.service_name?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Gestion des Réservations</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            className="input-dark max-w-xs text-sm"
            placeholder="🔍 Rechercher client, service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {[['all', 'Toutes'], ['confirmed', 'Confirmées'], ['cancelled', 'Annulées'], ['pending', 'En attente']].map(([k, l]) => (
            <button key={k} onClick={() => setStatusFilter(k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === k ? 'bg-gold/15 text-gold border border-gold/30' : 'text-gray-400 border border-dark-400 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-dark-100 border border-dark-400 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-400">
                    {['#ID', 'Client', 'Service', 'Date', 'Horaire', 'Prix', 'Statut', 'Créée le', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b border-dark-400 hover:bg-dark-200 transition-colors">
                      <td className="px-4 py-3 text-gray-600 text-xs">#{r.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{r.client_name}</p>
                        <p className="text-gray-500 text-xs">{r.client_email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{r.slot?.service_name}</td>
                      <td className="px-4 py-3 text-gray-300">{r.slot?.date}</td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{r.slot?.start_time} – {r.slot?.end_time}</td>
                      <td className="px-4 py-3 text-gold font-semibold">{r.price}€</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        {r.status === 'confirmed' && (
                          <button
                            className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
                            onClick={() => handleCancel(r.id)}
                            disabled={actionId === r.id}
                          >
                            {actionId === r.id ? '…' : 'Annuler'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-white font-semibold">Aucune réservation trouvée</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
