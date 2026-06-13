import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { menuAPI } from '../services/api'

const CATEGORIES = [
  { value: 'all', label: 'Tout le menu' },
  { value: 'plat', label: 'Plats' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'jus', label: 'Jus' }
]

const CATEGORY_STYLE = {
  plat: 'from-amber-400/20 to-orange-500/20 border-amber-500/30',
  dessert: 'from-pink-400/20 to-rose-500/20 border-pink-500/30',
  jus: 'from-emerald-400/20 to-lime-500/20 border-emerald-500/30'
}

const CATEGORY_LABEL = {
  plat: 'Plat',
  dessert: 'Dessert',
  jus: 'Jus'
}

const FALLBACK_BY_CATEGORY = {
  plat: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
  dessert: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=1200&q=80',
  jus: 'https://images.unsplash.com/photo-1622597467836-f3e6704f2fbc?auto=format&fit=crop&w=1200&q=80'
}

const getImageUrl = (item) => (item.image_url || '').trim() || FALLBACK_BY_CATEGORY[item.category] || FALLBACK_BY_CATEGORY.plat

export default function Menu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleReserve = (item = null) => {
    if (!user) return navigate('/login')
    navigate('/select-table', {
      state: {
        item,
        serviceId: 1,
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        guests: 2
      }
    })
  }

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await menuAPI.getAll()
        setItems(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        setError(err.response?.data?.error || 'Impossible de charger le menu.')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items
    return items.filter((item) => item.category === activeTab)
  }, [items, activeTab])

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(245,166,35,0.12),transparent_40%),linear-gradient(180deg,#070707_0%,#0d0d0f_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div
          className="mb-8 rounded-3xl border border-gold/25 bg-cover bg-center p-6 md:p-8"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.65)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80')"
          }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-gold/80">Restaurant Menu</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-white">Bienvenue chez ReservSmart</h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-300">
            Dégustez des plats raffinés, préparés avec passion par nos meilleurs chefs pour une expérience culinaire exceptionnelle.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-gold/40 hover:bg-white/10"
            >
              ← Retour
            </button>
            <button
              type="button"
              onClick={() => handleReserve()}
              className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#d89f18]"
            >
              Réserver
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                activeTab === tab.value
                  ? 'border-gold/40 text-gold bg-gold/10'
                  : 'border-dark-400 text-gray-400 hover:text-white hover:border-gold/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-9 h-9 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">{error}</div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`overflow-hidden rounded-2xl border bg-gradient-to-br shadow-xl shadow-black/20 cursor-pointer hover:scale-[1.02] transition-transform duration-200 ${CATEGORY_STYLE[item.category] || 'from-dark-200 to-dark-300 border-dark-400'}`}
              >
                <div className="relative h-44">
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_BY_CATEGORY[item.category]
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute top-3 right-3 rounded-lg bg-black/55 border border-white/20 px-2.5 py-1 text-xs font-semibold text-gray-100">
                    {CATEGORY_LABEL[item.category] || item.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-white font-bold text-lg leading-tight">{item.name}</h2>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-xs uppercase tracking-wider text-gray-400">Prix</span>
                    <span className="text-gold text-2xl font-extrabold">{Number(item.price).toFixed(2)} MAD</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="rounded-2xl border border-dark-400 bg-dark-200 px-6 py-12 text-center">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="text-white font-semibold">Aucun élément pour cette catégorie</p>
            <p className="text-sm text-gray-500 mt-1">L'admin peut ajouter de nouveaux plats depuis le dashboard.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)', padding: '16px' }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{ display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '680px', borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg, #1a140f, #131115)', border: '1px solid rgba(245,166,35,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div style={{ width: '260px', flexShrink: 0, position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null)
                  setShowFullDescription(false)
                }}
                aria-label="Retour au menu"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  zIndex: 10,
                  background: 'rgba(0,0,0,0.65)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff',
                  borderRadius: '999px',
                  minWidth: '90px',
                  height: '38px',
                  padding: '0 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.02em'
                }}
              >
                ← Retour
              </button>
              <img
                src={getImageUrl(selectedItem)}
                alt={selectedItem.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.currentTarget.src = FALLBACK_BY_CATEGORY[selectedItem.category] }}
              />
            </div>

            {/* Details */}
            <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: '#F5A623', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
                {CATEGORY_LABEL[selectedItem.category] || selectedItem.category}
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '8px', lineHeight: 1.3 }}>{selectedItem.name}</h2>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#F5A623', marginBottom: '14px' }}>{Number(selectedItem.price).toFixed(2)} MAD</p>
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.8, maxHeight: showFullDescription ? 'none' : '3.6em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: showFullDescription ? 'none' : 3, WebkitBoxOrient: 'vertical' }}>
                  {selectedItem.description || 'Préparation maison du chef avec des ingrédients frais et soigneusement sélectionnés.'}
                </p>
                {selectedItem.description && selectedItem.description.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription((prev) => !prev)}
                    style={{ background: 'none', border: 'none', color: '#F5A623', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600, marginTop: '8px' }}
                  >
                    {showFullDescription ? 'Voir moins' : 'Voir plus'}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleReserve(selectedItem)}
                style={{ alignSelf: 'flex-start', backgroundColor: '#F5A623', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '14px' }}
              >
                Réserver
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null)
                  setShowFullDescription(false)
                }}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', cursor: 'pointer', padding: 0 }}
              >
                ← Retour aux Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
