import { useEffect, useMemo, useState } from 'react'
import { menuAPI } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../components/ConfirmModal'

const EMPTY = {
  name: '',
  description: '',
  category: 'plat',
  price: '',
  image_url: '',
  is_available: true
}

const CATEGORIES = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'plat', label: 'Plats' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'jus', label: 'Jus' }
]

const labelCls = 'block text-sm font-medium text-gray-400 mb-1.5'
const inputCls = 'input-dark text-sm !bg-[#121215] !border-[#26262a]'

const FALLBACK_BY_CATEGORY = {
  plat: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
  dessert: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=1200&q=80',
  jus: 'https://images.unsplash.com/photo-1622597467836-f3e6704f2fbc?auto=format&fit=crop&w=1200&q=80'
}

const getImageUrl = (item) => (item.image_url || '').trim() || FALLBACK_BY_CATEGORY[item.category] || FALLBACK_BY_CATEGORY.plat

export default function ManageMenu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const toast = useToast()
  const confirm = useConfirm()

  const loadItems = async () => {
    try {
      const res = await menuAPI.getAllAdmin()
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || 'Impossible de charger le menu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return items
    return items.filter((item) => item.category === activeCategory)
  }, [items, activeCategory])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      image_url: item.image_url || '',
      is_available: item.is_available
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        const res = await menuAPI.update(editing.id, form)
        setItems((prev) => prev.map((it) => (it.id === editing.id ? res.data : it)))
        toast.success('Élément du menu mis à jour')
      } else {
        const res = await menuAPI.create(form)
        setItems((prev) => [res.data, ...prev])
        toast.success('Élément ajouté au menu')
      }
      setShowModal(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      const res = await menuAPI.update(item.id, { is_available: !item.is_available })
      setItems((prev) => prev.map((it) => (it.id === item.id ? res.data : it)))
      toast.info(res.data.is_available ? 'Élément activé' : 'Élément désactivé')
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || 'Impossible de modifier le statut.')
    }
  }

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Retirer cet élément du menu ?',
      message: 'L\'élément sera désactivé (suppression logique).',
      danger: true
    })
    if (!ok) return

    setDeletingId(item.id)
    try {
      await menuAPI.delete(item.id)
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, is_available: false } : it)))
      toast.success('Élément retiré du menu')
    } catch (err) {
      toast.error('Erreur', err.response?.data?.error || 'Impossible de supprimer.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-5 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.08),transparent_35%)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion du Menu</h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} élément{items.length !== 1 ? 's' : ''} dans le menu
            </p>
          </div>
          <button className="btn-gold text-sm" onClick={openCreate}>+ Ajouter au menu</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                activeCategory === cat.value
                  ? 'text-gold border-gold/30 bg-gold/10'
                  : 'text-gray-400 border-dark-400 hover:text-white'
              }`}
            >
              {cat.label}
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
                    {['#', 'Image', 'Nom', 'Catégorie', 'Description', 'Prix', 'Statut', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-[#222328] hover:bg-[#15161a] transition-colors">
                      <td className="px-4 py-3 text-gray-600 text-xs">#{item.id}</td>
                      <td className="px-4 py-3">
                        <img
                          src={getImageUrl(item)}
                          alt={item.name}
                          className="w-14 h-10 object-cover rounded-md border border-dark-400"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = FALLBACK_BY_CATEGORY[item.category] || FALLBACK_BY_CATEGORY.plat
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">{item.name}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{item.category}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[240px] truncate">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-gold font-bold">{Number(item.price).toFixed(2)} MAD</td>
                      <td className="px-4 py-3">
                        <span className={item.is_available ? 'badge-green' : 'badge-red'}>
                          {item.is_available ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-xs text-gray-400 hover:text-white border border-dark-400 hover:border-gold/30 px-3 py-1.5 rounded-lg transition-colors" onClick={() => openEdit(item)}>Modifier</button>
                          <button className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${item.is_available ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' : 'text-green-400 border-green-500/30 hover:bg-green-500/10'}`} onClick={() => handleToggle(item)}>
                            {item.is_available ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? '…' : 'Supprimer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🍽️</p>
                  <p className="text-white font-semibold mb-3">Aucun élément dans cette catégorie</p>
                  <button className="btn-gold text-sm" onClick={openCreate}>Ajouter un élément</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-w-lg w-full animate-slide-up rounded-2xl border border-[#242429] bg-gradient-to-b from-[#141417] to-[#0f1012] p-6">
            <h2 className="text-white font-bold text-xl mb-5">
              {editing ? 'Modifier élément menu' : 'Ajouter élément menu'}
            </h2>

            {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Nom *</label>
                <input
                  type="text"
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={inputCls + ' resize-none'}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Catégorie *</label>
                  <select
                    className={inputCls}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                  >
                    <option value="plat">Plat</option>
                    <option value="dessert">Dessert</option>
                    <option value="jus">Jus</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Prix (MAD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputCls}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Image URL (optionnel)</label>
                <input
                  type="text"
                  className={inputCls}
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
                <div className="mt-2">
                  <img
                    src={(form.image_url || '').trim() || FALLBACK_BY_CATEGORY[form.category]}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-[#26262a]"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = FALLBACK_BY_CATEGORY[form.category] || FALLBACK_BY_CATEGORY.plat
                    }}
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                />
                Disponible pour les clients
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-ghost text-sm" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn-gold text-sm" disabled={saving}>
                  {saving ? 'Sauvegarde…' : editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
