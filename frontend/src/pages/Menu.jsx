import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSearch, FiX } from 'react-icons/fi'
import { IoRestaurantOutline } from 'react-icons/io5'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [itemQuantity, setItemQuantity] = useState(1)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleAddToCart = (item, quantity = 1) => {
    const existingItem = cartItems.find(ci => ci.id === item.id)
    if (existingItem) {
      setCartItems(cartItems.map(ci =>
        ci.id === item.id ? { ...ci, quantity: ci.quantity + quantity } : ci
      ))
    } else {
      setCartItems([...cartItems, { ...item, quantity }])
    }
    setSelectedItem(null)
    setItemQuantity(1)
    setShowFullDescription(false)
  }

  const handleRemoveFromCart = (itemId) => {
    setCartItems(cartItems.filter(ci => ci.id !== itemId))
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(itemId)
    } else {
      setCartItems(cartItems.map(ci =>
        ci.id === itemId ? { ...ci, quantity: newQuantity } : ci
      ))
    }
  }

  const handleProceedToBook = () => {
    if (!user) return navigate('/login')
    if (cartItems.length === 0) return
    navigate('/select-table', {
      state: {
        items: cartItems,
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
    const q = searchTerm.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = activeTab === 'all' || item.category === activeTab
      const matchesSearch = !q || [
        item.name,
        item.description,
        CATEGORY_LABEL[item.category],
        item.category,
        `${Number(item.price).toFixed(2)} MAD`
      ].some((value) => String(value || '').toLowerCase().includes(q))

      return matchesCategory && matchesSearch
    })
  }, [items, activeTab, searchTerm])

  const resetFilters = () => {
    setActiveTab('all')
    setSearchTerm('')
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(245,166,35,0.12),transparent_40%),linear-gradient(180deg,#070707_0%,#0d0d0f_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div
          className="mb-8 rounded-3xl border border-gold/25 bg-cover bg-center p-6 md:p-8"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(10, 10, 10, 0.78), rgba(10, 10, 10, 0.68)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80')"
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-gold/40 hover:text-gold"
          >
            <FiArrowLeft />
            Retour
          </button>
          <p className="text-xs uppercase tracking-[0.24em] text-gold/80">Restaurant Menu</p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Bienvenue chez ReservSmart</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Degustez des plats raffines, prepares avec passion par nos meilleurs chefs pour une experience culinaire exceptionnelle.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowCart(!showCart)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gold-dark relative"
            >
              <IoRestaurantOutline />
              Mon panier
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs text-white font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-dark-400 bg-dark-100/80 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                className="input-dark pl-11 pr-24 text-sm"
                placeholder="Rechercher un plat, dessert, jus, prix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-white/5 hover:text-white"
                >
                  <FiX />
                  Effacer
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                    activeTab === tab.value
                      ? 'border-gold/40 bg-gold/10 text-gold'
                      : 'border-dark-400 text-gray-400 hover:border-gold/20 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">{error}</div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-400">
              {filteredItems.length} resultat{filteredItems.length > 1 ? 's' : ''} trouve{filteredItems.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item)
                    setShowFullDescription(false)
                  }}
                  className={`cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-br shadow-xl shadow-black/20 transition-transform duration-200 hover:scale-[1.02] ${CATEGORY_STYLE[item.category] || 'from-dark-200 to-dark-300 border-dark-400'}`}
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
                    <span className="absolute right-3 top-3 rounded-lg border border-white/20 bg-black/55 px-2.5 py-1 text-xs font-semibold text-gray-100">
                      {CATEGORY_LABEL[item.category] || item.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-bold leading-tight text-white">{item.name}</h2>
                    <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-gray-400">
                      {item.description || 'Preparation maison du chef avec des ingredients frais.'}
                    </p>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <span className="text-xs uppercase tracking-wider text-gray-400">Prix</span>
                      <span className="text-2xl font-extrabold text-gold">{Number(item.price).toFixed(2)} MAD</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="rounded-2xl border border-dark-400 bg-dark-200 px-6 py-12 text-center">
            <IoRestaurantOutline className="mx-auto mb-3 text-4xl text-gold" />
            <p className="font-semibold text-white">Aucun element trouve</p>
            <p className="mt-1 text-sm text-gray-500">Essayez un autre mot, une autre categorie ou reinitialisez la recherche.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/15"
            >
              Reinitialiser
            </button>
          </div>
        )}

        {showCart && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCart(false)}>
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gold/20 bg-[#131115] shadow-[0_24px_80px_rgba(0,0,0,0.6)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/10 bg-black/40 p-6">
                <h2 className="text-2xl font-bold text-white">Mon panier</h2>
                <button type="button" onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-400">Votre panier est vide</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border border-white/10 rounded-xl p-4 bg-[#0f0f11]">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-sm text-gray-400">{Number(item.price).toFixed(2)} MAD</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                              >
                                −
                              </button>
                              <span className="min-w-[20px] text-center text-sm font-semibold text-white">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="mb-4 text-lg font-semibold text-white">Total: {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} MAD</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCart(false)
                          handleProceedToBook()
                        }}
                        className="w-full rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-black transition hover:bg-gold-dark"
                      >
                        Proceder a la reservation
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-gold/20 bg-[#131115] shadow-[0_24px_80px_rgba(0,0,0,0.6)] md:grid-cols-[280px_1fr]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative min-h-[240px]">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null)
                  setShowFullDescription(false)
                }}
                aria-label="Retour au menu"
                className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/65 px-3 py-2 text-sm font-semibold text-white transition hover:border-gold/50 hover:text-gold"
              >
                <FiArrowLeft />
                Retour
              </button>
              <img
                src={getImageUrl(selectedItem)}
                alt={selectedItem.name}
                className="h-full min-h-[240px] w-full object-cover"
                onError={(e) => { e.currentTarget.src = FALLBACK_BY_CATEGORY[selectedItem.category] }}
              />
            </div>

            <div className="flex flex-col justify-center p-6 md:p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                {CATEGORY_LABEL[selectedItem.category] || selectedItem.category}
              </p>
              <h2 className="text-2xl font-bold leading-tight text-white">{selectedItem.name}</h2>
              <p className="mt-3 text-3xl font-extrabold text-gold">{Number(selectedItem.price).toFixed(2)} MAD</p>
              <div className="mt-5">
                <p className={`text-sm leading-7 text-gray-300 ${showFullDescription ? '' : 'line-clamp-3'}`}>
                  {selectedItem.description || 'Preparation maison du chef avec des ingredients frais et soigneusement selectionnes.'}
                </p>
                {selectedItem.description && selectedItem.description.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription((prev) => !prev)}
                    className="mt-2 text-sm font-semibold text-gold hover:text-gold-light"
                  >
                    {showFullDescription ? 'Voir moins' : 'Voir plus'}
                  </button>
                )}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-white/10 bg-[#0c0c0d] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Quantité</p>
                  <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setItemQuantity((prev) => Math.max(1, prev - 1))}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#131313] text-white disabled:opacity-40"
                      disabled={itemQuantity === 1}
                    >
                      −
                    </button>
                    <span className="min-w-[32px] text-center text-lg font-semibold text-white">{itemQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setItemQuantity((prev) => Math.min(10, prev + 1))}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#131313] text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(selectedItem, itemQuantity)
                      alert('Plat ajouté au panier!')
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-dark"
                  >
                    <IoRestaurantOutline />
                    Ajouter au panier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(null)
                      setShowFullDescription(false)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark-400 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-gold/40 hover:text-gold"
                  >
                    <FiArrowLeft />
                    Retour au menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
