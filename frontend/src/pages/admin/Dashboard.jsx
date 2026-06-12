import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { dashboardAPI } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

const PIE_COLORS = ['#22c55e', '#ef4444', '#F5A623']

function StatCard({ icon, value, label, accent }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-[#141417] to-[#0f1012] border rounded-2xl px-4 py-4 transition-all hover:-translate-y-0.5 ${accent ? 'border-gold/30 shadow-gold' : 'border-[#242429] hover:border-[#323238]'}`}>
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gold/5" />
      <p className="text-xl mb-2 relative z-10">{icon}</p>
      <p className={`text-2xl font-bold relative z-10 ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-1 relative z-10">{label}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { confirmed: 'badge-green', cancelled: 'badge-red', pending: 'badge-gold' }
  const labels = { confirmed: 'Confirmée', cancelled: 'Annulée', pending: 'En attente' }
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>
}

const chartStyle = {
  tooltip: { contentStyle: { background: '#111', border: '1px solid #252525', borderRadius: '8px', color: '#fff', fontSize: '12px' } },
  grid: { strokeDasharray: '3 3', stroke: '#252525' },
  tick: { fill: '#666', fontSize: 11 }
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [occupancyData, setOccupancyData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [forecast, setForecast] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      dashboardAPI.getRevenueChart(),
      dashboardAPI.getOccupancyChart(),
      dashboardAPI.getStatusChart(),
      dashboardAPI.getForecast(),
      dashboardAPI.getRecentReservations()
    ]).then(([s, rev, occ, stat, fore, rec]) => {
      setStats(s.data)
      setRevenueData(rev.data)
      setOccupancyData(occ.data)
      setStatusData(stat.data.filter(d => d.value > 0))
      setForecast(fore.data)
      setRecent(rec.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-5 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.08),transparent_35%)]">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon="€" value={`${stats?.total_revenue || 0}€`} label="Today's Income" accent />
          <StatCard icon="ORD" value={stats?.confirmed_reservations || 0} label="Today's Orders" />
          <StatCard icon="CUS" value={stats?.total_clients || 0} label="Today's Customers" />
          <StatCard icon="X" value={stats?.cancelled_reservations || 0} label="Canceled Order" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold text-sm">Total Revenue</p>
              <p className="text-xs text-gray-500">Last 12 months</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid {...chartStyle.grid} vertical={false} />
                <XAxis dataKey="month_name" tick={chartStyle.tick} axisLine={false} tickLine={false} />
                <YAxis tick={chartStyle.tick} axisLine={false} tickLine={false} />
                <Tooltip {...chartStyle.tooltip} formatter={(v) => [`${v}€`, 'Revenue']} />
                <Bar dataKey="revenue" fill="url(#goldGrad)" radius={[8, 8, 0, 0]} maxBarSize={34} />
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5A623" />
                    <stop offset="100%" stopColor="#8a5b12" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl p-4 md:p-5">
            <p className="text-white font-semibold text-sm mb-3">Weekly Best Seller Item</p>
            <div className="rounded-2xl bg-[#101114] border border-[#25262a] p-4 flex flex-col items-center text-center">
              <img
                src="https://th.bing.com/th/id/OIP.6-xQQU4QDb3PgZDqN9ooAQHaE7?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Chicken Burger"
                className="w-24 h-24 rounded-full border-4 border-[#2a221b] object-cover mb-3"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80'
                }}
              />
              <p className="text-white text-sm font-semibold">Chicken Burger</p>
              <p className="text-xs text-gray-500 mt-1">Top performing menu</p>
              <p className="text-gold font-bold mt-2">{recent?.[0]?.price ? `${recent[0].price}€` : '10.99€'}</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl overflow-hidden">
            <div className="px-4 md:px-5 py-4 border-b border-[#25262a] flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Recent Orders</p>
              <Link to="/admin/reservations" className="text-gold text-xs hover:text-gold-light transition-colors">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#25262a]">
                    {['Item', 'Placed On', 'Customer', 'Payment', 'Status', 'Amount'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(r => (
                    <tr key={r.id} className="border-b border-[#222328] hover:bg-[#15161a] transition-colors">
                      <td className="px-4 py-3 text-white whitespace-nowrap">{r.slot?.service_name || 'Service'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{r.slot?.date || '-'}</td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{r.client_name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">Paid</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-gold font-semibold whitespace-nowrap">{r.price}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recent.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">Aucune réservation pour le moment</div>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-4 grid gap-4">
            <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl p-4 md:p-5">
              <p className="text-white font-semibold text-sm mb-3">Daily Trending Menus</p>
              <div className="space-y-2.5">
                {(recent.slice(0, 4).map((r, idx) => ({
                  name: r.slot?.service_name || `Menu ${idx + 1}`,
                  price: r.price || (10 + idx * 2),
                }))).map((item, i) => (
                  <div key={`${item.name}-${i}`} className="flex items-center justify-between rounded-xl border border-[#25262a] bg-[#101114] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gold" />
                      <span className="text-gray-200 text-sm">{item.name}</span>
                    </div>
                    <span className="text-gold text-sm font-semibold">{item.price}€</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl p-4 md:p-5">
              <p className="text-white font-semibold text-sm mb-3">Customer Map</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={occupancyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid {...chartStyle.grid} vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip {...chartStyle.tooltip} formatter={(v) => [`${v}%`, 'Traffic']} />
                  <Bar dataKey="occupancy" fill="#b5651d" radius={[6, 6, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold text-sm">Reservations by Status</p>
              <p className="text-xs text-gray-500">Live overview</p>
            </div>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartStyle.tooltip.contentStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-600 text-sm text-center py-8">Aucune donnée</p>}
          </div>

          <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl p-4 md:p-5">
            <p className="text-white font-semibold text-sm mb-3">Forecast Pulse</p>
            <div className="grid grid-cols-7 gap-2">
              {forecast.slice(0, 14).map(d => {
                const colorMap = {
                  high: 'border-red-500/40 bg-red-500/10 text-red-400',
                  medium: 'border-gold/40 bg-gold/10 text-gold',
                  low: 'border-green-500/40 bg-green-500/10 text-green-400'
                }
                return (
                  <div key={d.date} className={`border rounded-lg p-2 text-center text-[10px] transition-all ${colorMap[d.level] || 'border-[#2a2a2f] text-gray-500'}`}>
                    <p className="font-semibold">{d.day_name.slice(0, 3)}</p>
                    <p className="opacity-70">{d.date.slice(8)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Cahier des charges: occupancy by day + reservations by month */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold text-sm">Taux d'occupation par jour</p>
              <p className="text-xs text-gray-500">Cahier des charges</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={occupancyData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid {...chartStyle.grid} vertical={false} />
                <XAxis dataKey="day" tick={chartStyle.tick} axisLine={false} tickLine={false} />
                <YAxis tick={chartStyle.tick} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                <Tooltip {...chartStyle.tooltip} formatter={(v) => [`${v}%`, 'Occupation']} />
                <Bar dataKey="occupancy" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-b from-[#141417] to-[#0f1012] border border-[#242429] rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold text-sm">Nombre de réservations par mois</p>
              <p className="text-xs text-gray-500">Cahier des charges</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid {...chartStyle.grid} vertical={false} />
                <XAxis dataKey="month_name" tick={chartStyle.tick} axisLine={false} tickLine={false} />
                <YAxis tick={chartStyle.tick} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip {...chartStyle.tooltip} formatter={(v) => [v, 'Réservations']} />
                <Bar dataKey="count" fill="#60a5fa" radius={[6, 6, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
