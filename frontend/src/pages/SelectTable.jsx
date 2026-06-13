import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiCalendar, FiClock, FiUsers, FiCheckCircle } from 'react-icons/fi'
import { IoRestaurantOutline } from 'react-icons/io5'

const TABLES = [
  { id: 1, number: 'T1', x: 10, y: 14, shape: 'round', seats: 2, status: 'available' },
  { id: 2, number: 'T2', x: 26, y: 12, shape: 'rect', seats: 4, status: 'reserved' },
  { id: 3, number: 'T3', x: 44, y: 15, shape: 'round', seats: 2, status: 'available' },
  { id: 4, number: 'T4', x: 62, y: 12, shape: 'rect', seats: 6, status: 'available' },
  { id: 5, number: 'T5', x: 80, y: 16, shape: 'round', seats: 2, status: 'reserved' },
  { id: 6, number: 'T6', x: 14, y: 40, shape: 'rect', seats: 4, status: 'available' },
  { id: 7, number: 'T7', x: 34, y: 38, shape: 'round', seats: 2, status: 'available' },
  { id: 8, number: 'T8', x: 53, y: 42, shape: 'rect', seats: 6, status: 'reserved' },
  { id: 9, number: 'T9', x: 74, y: 40, shape: 'round', seats: 2, status: 'available' },
  { id: 10, number: 'T10', x: 22, y: 66, shape: 'round', seats: 2, status: 'available' },
  { id: 11, number: 'T11', x: 42, y: 70, shape: 'rect', seats: 4, status: 'available' },
  { id: 12, number: 'T12', x: 66, y: 68, shape: 'round', seats: 2, status: 'reserved' }
]

export default function SelectTable() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}

  const [selectedTableId, setSelectedTableId] = useState(null)

  const item = state.item
  const serviceId = state.serviceId

  const summary = useMemo(
    () => ({
      date: state.date || '18 June 2026',
      time: state.time || '20:00',
      guests: state.guests || 2
    }),
    [state.date, state.guests, state.time]
  )

  const selectedTable = useMemo(
    () => TABLES.find((table) => table.id === selectedTableId) || null,
    [selectedTableId]
  )

  const handleSelect = (table) => {
    if (table.status === 'reserved') return
    setSelectedTableId(table.id)
  }

  const handleContinue = () => {
    if (!selectedTable) return

    const targetServiceId = serviceId || 1
    navigate(`/book/${targetServiceId}`, {
      state: {
        ...summary,
        item,
        tableNumber: selectedTable.number
      }
    })
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[#060606] text-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[32px] border border-white/10 bg-[#121212]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold/80">Place in hall</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Réservez votre table</h1>
              <p className="mt-3 max-w-xl text-sm text-gray-400">Sélectionnez une table disponible sur le plan, puis confirmez pour continuer votre réservation.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-[#171717]/80 px-4 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Libre</p>
                <div className="mt-3 mx-auto h-10 w-10 rounded-full border border-white/10 bg-[#1f1f1f]" />
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#171717]/80 px-4 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Sélectionnée</p>
                <div className="mt-3 mx-auto h-10 w-10 rounded-full bg-gold shadow-[0_0_0_6px_rgba(245,166,35,0.18)]" />
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#171717]/80 px-4 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Réservée</p>
                <div className="mt-3 mx-auto h-10 w-10 rounded-full bg-[#3b3b3b]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="rounded-[32px] border border-white/10 bg-[#101010]/90 p-5 md:p-6 overflow-hidden">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Plan de la salle</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Sélectionnez votre table</h2>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
                <span className="inline-flex h-3 w-3 rounded-full bg-[#1f1f1f] ring-1 ring-white/10" /> Disponible
                <span className="inline-flex h-3 w-3 rounded-full bg-gold" /> Sélectionnée
                <span className="inline-flex h-3 w-3 rounded-full bg-[#3b3b3b]" /> Réservée
              </div>
            </div>

            <div className="relative rounded-[28px] border border-white/10 bg-[#090909] px-4 py-6">
              <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-gray-400">
                Entrée
              </div>
              <div className="absolute inset-x-6 top-24 h-px bg-white/5" />
              <div className="absolute inset-x-6 bottom-24 h-px bg-white/5" />
              <div className="relative h-[520px] md:h-[560px]">
                {TABLES.map((table) => {
                  const isSelected = selectedTableId === table.id
                  const isReserved = table.status === 'reserved'
                  const baseShape = table.shape === 'round' ? 'rounded-full' : 'rounded-[24px]'
                  const sizeCls = table.shape === 'round' ? 'w-[76px] h-[76px]' : 'w-[98px] h-[70px]'

                  const stateCls = isReserved
                    ? 'bg-[#2c2c2c] border-[#444] text-[#8d8d8d] cursor-not-allowed opacity-80'
                    : isSelected
                    ? 'bg-gold border-gold text-black shadow-[0_0_0_12px_rgba(245,166,35,0.18)]'
                    : 'bg-[#121212] border border-white/10 text-white hover:border-gold hover:shadow-[0_0_0_10px_rgba(245,166,35,0.12)]'

                  const glowStyle = isSelected
                    ? { boxShadow: '0 0 0 10px rgba(245,166,35,0.14)' }
                    : {}

                  return (
                    <button
                      key={table.id}
                      type="button"
                      disabled={isReserved}
                      onClick={() => handleSelect(table)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 ${baseShape} ${sizeCls} flex items-center justify-center text-center transition-all duration-300 ease-out ${stateCls}`}
                      style={{ left: `${table.x}%`, top: `${table.y}%`, ...glowStyle }}
                      aria-label={`Table ${table.number}`}
                    >
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-gray-400">{table.shape === 'round' ? 'Table' : 'Banquette'}</p>
                        <p className="mt-1 text-sm font-semibold">{table.number}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-white/10 bg-[#101010]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
            <div className="mb-5 rounded-[28px] border border-white/10 bg-[#121212]/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Réservation</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Résumé</h3>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-[#111111]/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Date</p>
                <p className="mt-2 text-sm font-medium text-white">{summary.date}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#111111]/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Heure</p>
                <p className="mt-2 text-sm font-medium text-white">{summary.time}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#111111]/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Personnes</p>
                <p className="mt-2 text-sm font-medium text-white">{summary.guests}</p>
              </div>
              {item && (
              <div className="rounded-[24px] border border-white/10 bg-[#111111]/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Menu choisi</p>
                <p className="mt-2 text-sm font-semibold text-white">{item.name}</p>
              </div>
            )}
            <div className="rounded-[24px] border border-white/10 bg-[#111111]/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Table sélectionnée</p>
                <p className={`mt-2 text-sm font-semibold ${selectedTable ? 'text-gold' : 'text-gray-500'}`}>
                  {selectedTable ? selectedTable.number : 'Aucune table'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedTable}
              onClick={handleContinue}
              className="mt-8 w-full rounded-[24px] bg-gold px-5 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-[#d89f18] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuer vers la réservation
            </button>

            {selectedTable && (
              <div className="mt-4 rounded-[24px] border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold">
                Table {selectedTable.number} prête à être réservée.
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
