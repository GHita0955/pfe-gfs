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
    <div className={`bg-dark-50 border rounded-xl p-5 transition-all hover:border-gold/20 ${accent ? 'border-gold/30' : 'border-dark-400'}`}>
      <p className="text-2xl mb-2">{icon}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-1">{label}</p>
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
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de l'activité en temps réel</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="📋" value={stats.confirmed_reservations} label="Réservations confirmées" accent />
            <StatCard icon="💶" value={`${stats.total_revenue}€`} label="Revenu total" accent />
            <StatCard icon="👥" value={stats.total_clients} label="Clients" />
            <StatCard icon="📈" value={`${stats.occupancy_rate}%`} label="Taux d'occupation" />
            <StatCard icon="🗓️" value={stats.available_slots} label="Créneaux disponibles" />
            <StatCard icon="📅" value={stats.week_reservations} label="Cette semaine" />
            <StatCard icon="❌" value={stats.cancelled_reservations} label="Annulations" />
            <StatCard icon="🗂️" value={stats.total_slots} label="Créneaux totaux" />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { title: '📈 Revenus par mois', dataKey: 'revenue', color: '#F5A623', data: revenueData, fmt: (v) => [`${v}€`, 'Revenus'] },
            { title: '🔢 Réservations par mois', dataKey: 'count', color: '#60a5fa', data: revenueData, fmt: (v) => [v, 'Réservations'] },
          ].map(chart => (
            <div key={chart.title} className="bg-dark-50 border border-dark-400 rounded-xl p-5">
              <p className="text-white font-semibold text-sm mb-4">{chart.title}</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chart.data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.grid} />
                  <XAxis dataKey="month_name" tick={chartStyle.tick} />
                  <YAxis tick={chartStyle.tick} />
                  <Tooltip {...chartStyle.tooltip} formatter={chart.fmt} />
                  <Bar dataKey={chart.dataKey} fill={chart.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}

          <div className="bg-dark-50 border border-dark-400 rounded-xl p-5">
            <p className="text-white font-semibold text-sm mb-4">📊 Taux d'occupation par jour</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={occupancyData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid {...chartStyle.grid} />
                <XAxis dataKey="day" tick={chartStyle.tick} />
                <YAxis tick={chartStyle.tick} domain={[0, 100]} unit="%" />
                <Tooltip {...chartStyle.tooltip} formatter={(v) => [`${v}%`, 'Occupation']} />
                <Bar dataKey="occupancy" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-50 border border-dark-400 rounded-xl p-5">
            <p className="text-white font-semibold text-sm mb-4">🥧 Répartition par statut</p>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartStyle.tooltip.contentStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#888' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-600 text-sm text-center py-8">Aucune donnée</p>}
          </div>
        </div>

        {/* Forecast */}
        <div className="bg-dark-50 border border-dark-400 rounded-xl p-5">
          <p className="text-white font-semibold text-sm mb-4">🔮 Prévision de la demande (14 prochains jours)</p>
          <div className="flex gap-3 mb-4 flex-wrap">
            {[['bg-red-500/20 text-red-400', '🔴 Forte demande'], ['bg-gold/20 text-gold', '🟡 Demande moyenne'], ['bg-green-500/20 text-green-400', '🟢 Faible demande']].map(([cls, label]) => (
              <span key={label} className={`text-xs px-3 py-1 rounded-full font-medium ${cls}`}>{label}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {forecast.map(d => {
              const colorMap = { high: 'border-red-500/40 bg-red-500/10 text-red-400', medium: 'border-gold/40 bg-gold/10 text-gold', low: 'border-green-500/40 bg-green-500/10 text-green-400' }
              return (
                <div key={d.date} className={`border rounded-xl p-2.5 text-center text-xs transition-all ${colorMap[d.level] || 'border-dark-400 text-gray-500'}`}>
                  <p className="font-semibold">{d.day_name}</p>
                  <p className="text-xs opacity-70">{d.date.slice(8)}/{d.date.slice(5,7)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent reservations */}
        <div className="bg-dark-100 border border-dark-400 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
            <p className="text-white font-semibold">🕐 Réservations récentes</p>
            <Link to="/admin/reservations" className="text-gold text-xs hover:text-gold-light transition-colors">Voir tout →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-400">
                  {['#', 'Client', 'Service', 'Date', 'Horaire', 'Prix', 'Statut'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id} className="border-b border-dark-400 hover:bg-dark-200 transition-colors">
                    <td className="px-4 py-3 text-gray-600 text-xs">#{r.id}</td>
                    <td className="px-4 py-3 text-white">{r.client_name}</td>
                    <td className="px-4 py-3 text-gray-400">{r.slot?.service_name}</td>
                    <td className="px-4 py-3 text-gray-400">{r.slot?.date}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{r.slot?.start_time} – {r.slot?.end_time}</td>
                    <td className="px-4 py-3 text-gold font-semibold">{r.price}€</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm">Aucune réservation pour le moment</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
