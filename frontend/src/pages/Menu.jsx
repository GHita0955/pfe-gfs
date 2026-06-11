import { useEffect, useMemo, useState } from 'react'
import { menuAPI } from '../services/api'

const CATEGORY_TABS = [
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
        <div className="mb-8 rounded-3xl border border-gold/25 bg-gradient-to-r from-[#1a140f] via-[#131115] to-[#0f1310] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-gold/80">Restaurant Menu</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-white">Découvrez nos plats, desserts et jus</h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-300">
            Le client peut consulter le menu ici. L'admin peut ajouter et gérer tous les éléments depuis l'espace admin.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => (
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

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className={`overflow-hidden rounded-2xl border bg-gradient-to-br shadow-xl shadow-black/20 ${CATEGORY_STYLE[item.category] || 'from-dark-200 to-dark-300 border-dark-400'}`}
              >
                <div className="relative h-44">
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = FALLBACK_BY_CATEGORY[item.category] || FALLBACK_BY_CATEGORY.plat
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
                  <p className="mt-2 text-sm text-gray-300 min-h-[40px]">{item.description || 'Préparation maison du chef.'}</p>
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
    </section>
  )
}
