import { useEffect, useMemo, useRef, useState } from 'react'
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi'
import { IoRestaurantOutline } from 'react-icons/io5'
import { menuAPI } from '../services/api'

const QUICK_QUESTIONS = [
  'Comment reserver un plat ?',
  'Quels plats sont disponibles ?',
  'Comment annuler ma reservation ?',
  'Comment telecharger mon recu PDF ?'
]

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const formatPrice = (price) => `${Number(price || 0).toFixed(2)} MAD`

function findMatchingItems(question, items) {
  const q = normalize(question)
  return items
    .filter((item) => {
      const words = normalize(item.name).split(/\s+/).filter((word) => word.length > 2)
      return words.length > 0 && words.some((word) => q.includes(word))
    })
    .slice(0, 3)
}

function buildMenuSummary(items) {
  if (!items.length) return "Le menu est en cours de chargement. Ouvrez la page Menu pour voir les plats disponibles."

  const plats = items.filter((item) => item.category === 'plat').slice(0, 4)
  const desserts = items.filter((item) => item.category === 'dessert').slice(0, 3)
  const jus = items.filter((item) => item.category === 'jus').slice(0, 3)
  const parts = []

  if (plats.length) parts.push(`Plats: ${plats.map((item) => `${item.name} (${formatPrice(item.price)})`).join(', ')}`)
  if (desserts.length) parts.push(`Desserts: ${desserts.map((item) => `${item.name} (${formatPrice(item.price)})`).join(', ')}`)
  if (jus.length) parts.push(`Jus: ${jus.map((item) => `${item.name} (${formatPrice(item.price)})`).join(', ')}`)

  return `${parts.join('. ')}. Pour tout voir, cliquez sur Menu puis utilisez la recherche.`
}

function answerQuestion(question, items) {
  const q = normalize(question)
  const matches = findMatchingItems(question, items)

  if (matches.length) {
    return matches
      .map((item) => `${item.name}: ${formatPrice(item.price)}. ${item.description || 'Disponible dans notre menu.'}`)
      .join('\n')
  }

  if (/(reserver|reservation|book|reserve|حجز|نحجز|بغيت|table)/.test(q)) {
    return "Pour reserver un plat: ouvrez Menu, cherchez le plat, cliquez dessus, puis choisissez Reserver ce plat. Ensuite selectionnez une table disponible, choisissez le creneau, confirmez la reservation et vous recevrez le QR code."
  }

  if (/(menu|plat|plats|dish|manger|disponible|شنو|اكل|ماكلة|dessert|jus)/.test(q)) {
    return buildMenuSummary(items)
  }

  if (/(prix|price|tarif|cout|ثمن|شحال)/.test(q)) {
    if (!items.length) return "Les prix sont affiches dans la page Menu et aussi dans le recapitulatif avant confirmation."
    const cheapest = [...items].sort((a, b) => Number(a.price) - Number(b.price))[0]
    return `Les prix sont affiches sur chaque plat. Exemple: ${cheapest.name} est a ${formatPrice(cheapest.price)}. Le total de reservation est confirme avant validation.`
  }

  if (/(annuler|cancel|supprimer|لغاء|نلغي)/.test(q)) {
    return "Pour annuler: connectez-vous, ouvrez Mes reservations, puis cliquez sur Annuler sur la reservation concernee. Si la reservation est deja traitee, contactez le restaurant."
  }

  if (/(pdf|recu|receipt|justificatif|تحميل|وصل)/.test(q)) {
    return "Apres confirmation, ouvrez Mes reservations et cliquez sur Recu PDF. Vous pouvez aussi telecharger le QR code de confirmation."
  }

  if (/(date|heure|creneau|horaire|وقت|ساعة)/.test(q)) {
    return "Les dates et horaires disponibles s'affichent apres le choix de la table. Vous pouvez chercher un horaire, selectionner un creneau libre, puis confirmer."
  }

  if (/(compte|login|connexion|inscrire|register|حساب|دخل)/.test(q)) {
    return "Pour reserver, il faut etre connecte. Si vous n'avez pas de compte, cliquez sur S'inscrire, creez votre compte, puis revenez au menu."
  }

  return "Je peux vous aider sur le menu, les prix, la reservation d'un plat, le choix de table, les horaires, l'annulation, le recu PDF et le QR code. Posez votre question avec le nom du plat si vous cherchez un prix precis."
}

export default function ChatbotAssistant() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Bonjour, je suis l'assistant ReservSmart. Posez-moi une question sur les plats, les prix ou la reservation."
    }
  ])
  const endRef = useRef(null)

  useEffect(() => {
    menuAPI.getAll()
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]))
  }, [])

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const menuCount = useMemo(() => items.length, [items])

  const ask = (text) => {
    const question = text.trim()
    if (!question) return

    const answer = answerQuestion(question, items)
    setMessages((current) => [
      ...current,
      { role: 'user', text: question },
      { role: 'bot', text: answer }
    ])
    setInput('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    ask(input)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[min(560px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#2a2a2f] bg-[#101012] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-[#242429] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-black">
                <IoRestaurantOutline />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Assistant ReservSmart</p>
                <p className="text-xs text-gray-500">{menuCount ? `${menuCount} elements du menu charges` : 'Menu en chargement'}</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              title="Fermer"
            >
              <FiX />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] whitespace-pre-line rounded-xl px-3 py-2 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'ml-auto border border-gold/25 bg-gold/10 text-gold'
                    : 'border border-[#26262a] bg-[#15161a] text-gray-200'
                }`}
              >
                {message.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#242429] p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="shrink-0 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/15"
                  onClick={() => ask(question)}
                >
                  {question}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-dark-400 bg-dark-50 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition focus:border-gold"
                placeholder="Ecrivez votre question..."
              />
              <button
                type="submit"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-black transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!input.trim()}
                aria-label="Envoyer"
                title="Envoyer"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        type="button"
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-gold/40 bg-gold px-4 text-sm font-bold text-black shadow-[0_12px_40px_rgba(245,166,35,0.25)] transition hover:bg-gold-dark"
        onClick={() => setOpen((value) => !value)}
      >
        <FiMessageCircle />
        Assistance
      </button>
    </div>
  )
}
