import { useState, useEffect } from 'react'
import { servicesAPI } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../components/ConfirmModal'

const EMPTY = { name: '', description: '', base_price: '', duration: '' }
const labelCls = "block text-sm font-medium text-gray-400 mb-1.5"
const inputCls = "input-dark text-sm"

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editService, setEditService] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const toast = useToast()
  const confirm = useConfirm()

  useEffect(() => {
    servicesAPI.getAllAdmin().then(res => setServices(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setEditService(null); setForm(EMPTY); setError(''); setShowModal(true) }
  const openEdit = (s) => { setEditService(s); setForm({ name: s.name, description: s.description || '', base_price: s.base_price, duration: s.duration }); setError(''); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editService) {
        const res = await servicesAPI.update(editService.id, form)
        setServices(prev => prev.map(s => s.id === editService.id ? res.data : s))
        toast.success('Service mis à jour')
      } else {
        const res = await servicesAPI.create(form)
        setServices(prev => [...prev, res.data])
        toast.success('Service créé')
      }
      setShowModal(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (s) => {
    try {
      const res = await servicesAPI.update(s.id, { is_active: !s.is_active })
      setServices(prev => prev.map(x => x.id === s.id ? res.data : x))
      toast.info(res.data.is_active ? 'Service activé' : 'Service désactivé')
    } catch (err) { toast.error('Erreur', err.response?.data?.error || 'Impossible de modifier.') }
  }

  const handleDelete = async (service) => {
    const ok = await confirm({
      title: 'Supprimer ce service ?',
      message: 'Le service sera désactivé (suppression logique).',
      danger: true
    })
    if (!ok) return

    setDeletingId(service.id)
    try {
      await servicesAPI.delete(service.id)
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: false } : s))
      toast.success('Service désactivé')
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || 'Impossible de supprimer.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-5 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.08),transparent_35%)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion des Services</h1>
            <p className="text-gray-500 text-sm mt-1">{services.length} service{services.length !== 1 ? 's' : ''} configuré{services.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-gold text-sm" onClick={openCreate}>+ Nouveau service</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#25262a]">
                    {['#', 'Nom', 'Description', 'Prix de base', 'Durée', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id} className="border-b border-[#222328] hover:bg-[#15161a] transition-colors">
                      <td className="px-4 py-3 text-gray-600 text-xs">#{s.id}</td>
                      <td className="px-4 py-3 text-white font-semibold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" />{s.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[220px] truncate">{s.description || '—'}</td>
                      <td className="px-4 py-3 text-gold font-bold">{s.base_price}€</td>
                      <td className="px-4 py-3 text-gray-300">{s.duration} min</td>
                      <td className="px-4 py-3"><span className={s.is_active ? 'badge-green' : 'badge-red'}>{s.is_active ? 'Actif' : 'Inactif'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-xs text-gray-400 hover:text-white border border-dark-400 hover:border-gold/30 px-3 py-1.5 rounded-lg transition-colors" onClick={() => openEdit(s)}>✏️ Modifier</button>
                          <button className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${s.is_active ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' : 'text-green-400 border-green-500/30 hover:bg-green-500/10'}`} onClick={() => handleToggle(s)}>
                            {s.is_active ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                            onClick={() => handleDelete(s)}
                            disabled={deletingId === s.id}
                          >
                            {deletingId === s.id ? '…' : 'Supprimer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {services.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">⚙️</p>
                  <p className="text-white font-semibold mb-3">Aucun service</p>
                  <button className="btn-gold text-sm" onClick={openCreate}>Créer un service</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-w-lg w-full animate-slide-up rounded-2xl border border-[#242429] bg-gradient-to-b from-[#141417] to-[#0f1012] p-6">
            <h2 className="text-white font-bold text-xl mb-5">
              {editService ? '✏️ Modifier le service' : '➕ Nouveau service'}
            </h2>

            {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Nom du service *</label>
                <input type="text" className={inputCls + ' !bg-[#121215] !border-[#26262a]'} placeholder="Ex: Consultation Standard" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea className={inputCls + " resize-none !bg-[#121215] !border-[#26262a]"} placeholder="Description du service…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Prix de base (€) *</label>
                  <input type="number" className={inputCls + ' !bg-[#121215] !border-[#26262a]'} placeholder="50" min="0" step="0.01" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })} required />
                </div>
                <div>
                  <label className={labelCls}>Durée (minutes) *</label>
                  <input type="number" className={inputCls + ' !bg-[#121215] !border-[#26262a]'} placeholder="30" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-ghost text-sm" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn-gold text-sm" disabled={saving}>{saving ? 'Sauvegarde…' : editService ? 'Mettre à jour' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
