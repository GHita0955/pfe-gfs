import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
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
  const state = location.state || {}

  const [selectedTableId, setSelectedTableId] = useState(null)
  const [isConfirmed, setIsConfirmed] = useState(false)

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
    setIsConfirmed(false)
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[#121212] text-white px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 rounded-3xl border border-[#ffffff1f] bg-white/[0.03] backdrop-blur-xl p-5 md:p-7">
          <p className="text-xs tracking-[0.24em] uppercase text-[#FF6B00]">Select Your Table</p>
          <h1 className="text-2xl md:text-4xl font-bold mt-2">Choose your perfect table</h1>
          <p className="text-sm text-white/70 mt-2 max-w-2xl">
            Pick one available table on the floor map. Reserved tables are locked. Your final choice appears in the reservation summary.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 md:gap-6">
          <div className="rounded-3xl border border-[#ffffff1a] bg-[#1E1E1E]/85 backdrop-blur-2xl p-4 md:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                <IoRestaurantOutline className="text-[#FF6B00]" />
                Restaurant Floor Plan
              </h2>
              <div className="hidden md:flex items-center gap-4 text-xs text-white/70">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-white inline-block" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] inline-block" /> Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#555] inline-block" /> Reserved</span>
              </div>
            </div>

            <div className="relative h-[520px] md:h-[600px] rounded-2xl border border-[#ffffff12] bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,0,0.10),transparent_36%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.05),transparent_34%),#161616]">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] tracking-widest uppercase border border-[#ffffff20] bg-black/35 text-white/80">
                Entrance
              </div>

              <div className="absolute inset-5 rounded-2xl border border-dashed border-[#ffffff14]" />

              {TABLES.map((table) => {
                const isSelected = selectedTableId === table.id
                const isReserved = table.status === 'reserved'
                const baseShape = table.shape === 'round' ? 'rounded-full' : 'rounded-xl'
                const sizeCls = table.shape === 'round' ? 'w-[76px] h-[76px]' : 'w-[96px] h-[68px]'

                const stateCls = isReserved
                  ? 'bg-[#2e2e2e] border-[#5a5a5a] text-[#9a9a9a] cursor-not-allowed opacity-70'
                  : isSelected
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white scale-105'
                  : 'bg-[#1E1E1E] border-white text-white hover:border-[#FF6B00] hover:-translate-y-0.5'

                const glowStyle = isSelected
                  ? { boxShadow: '0 0 0 4px rgba(255,107,0,0.24), 0 0 28px rgba(255,107,0,0.45)' }
                  : {}

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={isReserved}
                    onClick={() => handleSelect(table)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 ${baseShape} ${sizeCls} transition-all duration-300 ease-out ${stateCls}`}
                    style={{ left: `${table.x}%`, top: `${table.y}%`, ...glowStyle }}
                    aria-label={`Table ${table.number}`}
                  >
                    <div className="text-center leading-tight">
                      <p className="text-[10px] md:text-[11px] opacity-80">Table</p>
                      <p className="font-bold text-sm md:text-base">{table.number}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="md:hidden mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/75">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-white inline-block" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] inline-block" /> Selected</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#555] inline-block" /> Reserved</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-[#ffffff1a] bg-[#1E1E1E]/85 backdrop-blur-2xl p-5 md:p-6 h-fit xl:sticky xl:top-20">
            <h2 className="text-lg font-semibold mb-4 md:mb-5">Reservation Summary</h2>

            <div className="space-y-3">
              <div className="rounded-2xl border border-[#ffffff14] bg-white/[0.03] px-4 py-3 flex items-center justify-between">
                <span className="text-white/70 text-sm flex items-center gap-2"><FiCalendar /> Date</span>
                <span className="font-semibold text-sm">{summary.date}</span>
              </div>

              <div className="rounded-2xl border border-[#ffffff14] bg-white/[0.03] px-4 py-3 flex items-center justify-between">
                <span className="text-white/70 text-sm flex items-center gap-2"><FiClock /> Time</span>
                <span className="font-semibold text-sm">{summary.time}</span>
              </div>

              <div className="rounded-2xl border border-[#ffffff14] bg-white/[0.03] px-4 py-3 flex items-center justify-between">
                <span className="text-white/70 text-sm flex items-center gap-2"><FiUsers /> Guests</span>
                <span className="font-semibold text-sm">{summary.guests}</span>
              </div>

              <div className="rounded-2xl border border-[#ffffff14] bg-white/[0.03] px-4 py-3 flex items-center justify-between">
                <span className="text-white/70 text-sm">Selected Table</span>
                <span className={`font-bold text-sm ${selectedTable ? 'text-[#FF6B00]' : 'text-white/60'}`}>
                  {selectedTable ? selectedTable.number : 'Not selected'}
                </span>
              </div>
            </div>

            {isConfirmed && selectedTable && (
              <div className="mt-4 rounded-2xl border border-[#FF6B0055] bg-[#FF6B0018] px-4 py-3 text-sm flex items-center gap-2">
                <FiCheckCircle className="text-[#FF6B00]" />
                Table {selectedTable.number} is selected successfully.
              </div>
            )}

            <button
              type="button"
              disabled={!selectedTable}
              onClick={() => setIsConfirmed(true)}
              className="mt-5 w-full rounded-2xl bg-[#FF6B00] px-4 py-4 text-base font-semibold text-white transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-45 disabled:cursor-not-allowed"
              style={selectedTable ? { boxShadow: '0 14px 30px rgba(255,107,0,0.35)' } : {}}
            >
              Confirm Reservation
            </button>
          </aside>
        </div>
      </div>
    </section>
  )
}
