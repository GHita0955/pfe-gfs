import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { dashboardAPI } from '../../services/api'

const COLORS = ['#10b981', '#ef4444', '#f59e0b']

function StatCard({ icon, value, label, colorClass }) {
  return (
    <div className={`stat-card ${colorClass || ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    confirmed: { label: 'Confirmée', cls: 'badge-success' },
    cancelled: { label: 'Annulée', cls: 'badge-danger' },
    pending: { label: 'En attente', cls: 'badge-warning' }
  }
  const { label, cls } = map[status] || { label: status, cls: 'badge-gray' }
  return <span className={`badge ${cls}`}>{label}</span>
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
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="page-container"><div className="loading-container"><div className="spinner" /></div></div>
  }

  return (
    <div className="page-container">
      {/* Admin Nav */}
      <nav className="admin-nav">
        <Link to="/admin" className="admin-nav-link active">📊 Dashboard</Link>
        <Link to="/admin/reservations" className="admin-nav-link">📋 Réservations</Link>
        <Link to="/admin/slots" className="admin-nav-link">🗓️ Créneaux</Link>
        <Link to="/admin/services" className="admin-nav-link">⚙️ Services</Link>
      </nav>

      <div className="section-header">
        <h2>Tableau de bord</h2>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="stats-grid">
          <StatCard icon="📋" value={stats.confirmed_reservations} label="Réservations confirmées" colorClass="primary" />
          <StatCard icon="💶" value={`${stats.total_revenue}€`} label="Revenu total" colorClass="success" />
          <StatCard icon="👥" value={stats.total_clients} label="Clients" colorClass="warning" />
          <StatCard icon="📈" value={`${stats.occupancy_rate}%`} label="Taux d'occupation" />
          <StatCard icon="🗓️" value={stats.available_slots} label="Créneaux disponibles" />
          <StatCard icon="📅" value={stats.week_reservations} label="Réservations cette semaine" />
          <StatCard icon="❌" value={stats.cancelled_reservations} label="Annulations" colorClass="danger" />
          <StatCard icon="🗂️" value={stats.total_slots} label="Créneaux totaux" />
        </div>
      )}

      {/* Charts */}
      <div className="charts-grid">
        {/* Revenus par mois */}
        <div className="chart-card">
          <div className="chart-title">📈 Revenus par mois (6 derniers mois)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month_name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}€`, 'Revenus']} />
              <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Occupation par jour */}
        <div className="chart-card">
          <div className="chart-title">📊 Taux d'occupation par jour de la semaine</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={occupancyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Occupation']} />
              <Bar dataKey="occupancy" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Réservations par mois (count) */}
        <div className="chart-card">
          <div className="chart-title">🔢 Nombre de réservations par mois</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month_name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Réservations']} />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition statuts */}
        <div className="chart-card">
          <div className="chart-title">🥧 Répartition par statut</div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Prévision de la demande */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <div className="chart-title">🔮 Prévision de la demande (14 prochains jours)</div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>🔴 Forte demande</span>
          <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>🟡 Demande moyenne</span>
          <span style={{ background: '#d1fae5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>🟢 Faible demande</span>
        </div>
        <div className="forecast-grid">
          {forecast.map(d => (
            <div key={d.date} className={`forecast-day ${d.level}`}>
              <div className="fd-name">{d.day_name}</div>
              <div>{d.date.slice(8)}/{d.date.slice(5, 7)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Réservations récentes */}
      <div className="table-container">
        <div className="table-header">
          <h3>🕐 Réservations récentes</h3>
          <Link to="/admin/reservations" className="btn btn-secondary btn-sm">Voir tout</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>Service</th>
              <th>Date</th>
              <th>Horaire</th>
              <th>Prix</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(r => (
              <tr key={r.id}>
                <td style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>#{r.id}</td>
                <td>{r.client_name}</td>
                <td>{r.slot?.service_name}</td>
                <td>{r.slot?.date}</td>
                <td>{r.slot?.start_time} – {r.slot?.end_time}</td>
                <td><strong>{r.price}€</strong></td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {recent.length === 0 && (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p>Aucune réservation pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
