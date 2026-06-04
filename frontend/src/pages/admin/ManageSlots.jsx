import { useState, useEffect } from 'react'
import { slotsAPI, servicesAPI } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../components/ConfirmModal'

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
function formatDate(iso) { const d = new Date(iso + 'T00:00:00'); return `${DAYS_FR[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}` }
function today() { return new Date().toISOString().split('T')[0] }
function inDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0] }

const inputCls = "input-dark text-sm"
const labelCls = "block text-sm font-medium text-gray-400 mb-1.5"

export default function ManageSlots() {
  const [tab, setTab] = useState('generate')
  const [services, setServices] = useState([])
  const toast = useToast()
  const confirm = useConfirm()
  const [genForm, setGenForm] = useState({ service_id: '', start_date: today(), end_date: inDays(7), skip_weekends: false })
  const [timePairs, setTimePairs] = useState([{ start: '09:00', end: '09:30' }, { start: '10:00', end: '10:30' }, { start: '14:00', end: '14:30' }])
  const [genLoading, setGenLoading] = useState(false)
  const [slots, setSlots] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [listFilter, setListFilter] = useState({ service_id: '', date: today() })
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    servicesAPI.getAllAdmin().then(res => {
      setServices(res.data)
      if (res.data.length > 0) setGenForm(f => ({ ...f, service_id: res.data[0].id }))
    }).catch(console.error)
  }, [])

  useEffect(() => { if (tab === 'list') loadSlots() }, [tab])

  const loadSlots = () => {
    setListLoading(true)
    const params = {}
    if (listFilter.service_id) params.service_id = listFilter.service_id
    if (listFilter.date) params.date = listFilter.date
    slotsAPI.getAll(params).then(res => setSlots(res.data)).catch(console.error).finally(() => setListLoading(false))
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenLoading(true)
    try {
      const res = await slotsAPI.generate({ service_id: parseInt(genForm.service_id), start_date: genForm.start_date, end_date: genForm.end_date, skip_weekends: genForm.skip_weekends, time_slots: timePairs.map(tp => ({ start: tp.start, end: tp.end })) })
      toast.success('Créneaux générés !', res.data.message)
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || 'Erreur lors de la génération')
    } finally {
      setGenLoading(false)
    }
  }

  const toggleAvailability = async (slot) => {
    try {
      await slotsAPI.update(slot.id, { is_available: !slot.is_available })
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, is_available: !s.is_available } : s))
      toast.info('Disponibilité mise à jour')
    } catch (err) { toast.error('Erreur', err.response?.data?.error || 'Impossible de mettre à jour.') }
  }

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Supprimer ce créneau ?', message: 'Cette action est irréversible.', danger: true })
    if (!ok) return
    setDeletingId(id)
    try {
      await slotsAPI.delete(id)
      setSlots(prev => prev.filter(s => s.id !== id))
      toast.success('Créneau supprimé')
    } catch (err) { toast.error('Erreur', err.response?.data?.error || 'Impossible de supprimer.') }
    finally { setDeletingId(null) }
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-5 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.08),transparent_35%)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Gestion des Créneaux</h1>
          <p className="text-gray-500 text-sm mt-1">Générez et gérez les créneaux horaires de vos services</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-2">
          {[['generate', '⚡ Générer'], ['list', '📋 Liste']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === k ? 'bg-gradient-to-r from-gold/20 to-gold/5 text-gold border border-gold/30' : 'text-gray-400 border border-[#26262a] bg-[#121215] hover:text-white hover:border-[#34343a]'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Generate tab */}
        {tab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#242429] bg-gradient-to-b from-[#141417] to-[#0f1012] p-5">
              <h3 className="text-white font-semibold mb-4">Générateur de créneaux en masse</h3>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className={labelCls}>Service</label>
                  <select className={inputCls + ' !bg-[#121215] !border-[#26262a]'} value={genForm.service_id} onChange={e => setGenForm({ ...genForm, service_id: e.target.value })} required>
                    <option value="">-- Sélectionner --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Date de début</label>
                    <input type="date" className={inputCls + ' !bg-[#121215] !border-[#26262a]'} value={genForm.start_date} onChange={e => setGenForm({ ...genForm, start_date: e.target.value })} required />
                  </div>
                  <div>
                    <label className={labelCls}>Date de fin</label>
                    <input type="date" className={inputCls + ' !bg-[#121215] !border-[#26262a]'} value={genForm.end_date} onChange={e => setGenForm({ ...genForm, end_date: e.target.value })} required />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
                  <input type="checkbox" className="accent-gold w-4 h-4" checked={genForm.skip_weekends} onChange={e => setGenForm({ ...genForm, skip_weekends: e.target.checked })} />
                  Ignorer les week-ends
                </label>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={labelCls + " mb-0"}>Créneaux horaires</label>
                    <button type="button" className="text-xs text-gold hover:text-gold-light border border-gold/30 px-2 py-1 rounded-lg transition-colors" onClick={() => setTimePairs([...timePairs, { start: '09:00', end: '09:30' }])}>+ Ajouter</button>
                  </div>
                  <div className="space-y-2">
                    {timePairs.map((tp, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="time" className={inputCls + " flex-1 !bg-[#121215] !border-[#26262a]"} value={tp.start} onChange={e => setTimePairs(timePairs.map((x, j) => j === i ? { ...x, start: e.target.value } : x))} required />
                        <span className="text-gray-600 text-sm">→</span>
                        <input type="time" className={inputCls + " flex-1 !bg-[#121215] !border-[#26262a]"} value={tp.end} onChange={e => setTimePairs(timePairs.map((x, j) => j === i ? { ...x, end: e.target.value } : x))} required />
                        {timePairs.length > 1 && <button type="button" className="text-gray-600 hover:text-red-400 w-6 h-6 flex items-center justify-center" onClick={() => setTimePairs(timePairs.filter((_, j) => j !== i))}>✕</button>}
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-gold w-full" disabled={genLoading}>
                  {genLoading ? 'Génération…' : '⚡ Générer les créneaux'}
                </button>
              </form>
            </div>

            <div className="p-5 bg-gradient-to-b from-[#1b1510] to-[#120f0d] border border-[#2a221b] rounded-2xl text-sm text-gray-400 space-y-2">
              <p className="text-gold font-semibold mb-2">💡 Comment ça marche</p>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Sélectionnez un service et une plage de dates</li>
                <li>Ajoutez les créneaux horaires souhaités</li>
                <li>Cochez "Ignorer les week-ends" si nécessaire</li>
                <li>Les créneaux existants ne seront pas dupliqués</li>
              </ul>
            </div>
          </div>
        )}

        {/* List tab */}
        {tab === 'list' && (
          <>
            <div className="flex flex-wrap gap-3 mb-5">
              <select className="input-dark text-sm max-w-[200px] !bg-[#121215] !border-[#26262a]" value={listFilter.service_id} onChange={e => setListFilter({ ...listFilter, service_id: e.target.value })}>
                <option value="">Tous les services</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="date" className="input-dark text-sm max-w-[180px] !bg-[#121215] !border-[#26262a]" value={listFilter.date} onChange={e => setListFilter({ ...listFilter, date: e.target.value })} />
              <button className="btn-gold text-sm" onClick={loadSlots}>🔍 Filtrer</button>
            </div>

            {listLoading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#25262a]">
                        {['#', 'Service', 'Date', 'Horaire', 'Prix dynamique', 'Disponibilité', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map(slot => (
                        <tr key={slot.id} className="border-b border-[#222328] hover:bg-[#15161a] transition-colors">
                          <td className="px-4 py-3 text-gray-600 text-xs">#{slot.id}</td>
                          <td className="px-4 py-3 text-gray-300">{slot.service_name}</td>
                          <td className="px-4 py-3 text-gray-300">{formatDate(slot.date)}</td>
                          <td className="px-4 py-3 text-gray-300 font-semibold whitespace-nowrap">{slot.start_time} – {slot.end_time}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${slot.is_discounted ? 'text-green-400' : slot.is_peak ? 'text-orange-400' : 'text-gold'}`}>{slot.dynamic_price}€</span>
                            {slot.is_discounted && <span className="badge-green ml-2">Promo</span>}
                            {slot.is_peak && <span className="badge-gold ml-2">Peak</span>}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleAvailability(slot)}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${slot.is_available ? 'text-green-400 border-green-500/30 hover:bg-green-500/10' : 'text-gray-500 border-dark-400 hover:border-gold/30 hover:text-white'}`}
                            >
                              {slot.is_available ? '✓ Disponible' : '✗ Indisponible'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="text-gray-600 hover:text-red-400 text-base transition-colors"
                              onClick={() => handleDelete(slot.id)}
                              disabled={deletingId === slot.id}
                            >
                              {deletingId === slot.id ? '…' : '🗑'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {slots.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-4xl mb-3">🗓️</p>
                      <p className="text-white font-semibold">Aucun créneau trouvé</p>
                      <p className="text-gray-500 text-sm mt-1">Générez des créneaux ou modifiez les filtres</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
