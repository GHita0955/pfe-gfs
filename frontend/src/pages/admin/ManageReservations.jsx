import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reservationsAPI } from '../../services/api'

function StatusBadge({ status }) {
  const map = {
    confirmed: { label: 'Confirmée', cls: 'badge-success' },
    cancelled: { label: 'Annulée', cls: 'badge-danger' },
    pending: { label: 'En attente', cls: 'badge-warning' }
  }
  const { label, cls } = map[status] || { label: status, cls: 'badge-gray' }
  return <span className={`badge ${cls}`}>{label}</span>
}

export default function ManageReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState(null)

  useEffect(() => {
    reservationsAPI.getAll()
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!confirm('Confirmer l\'annulation ?')) return
    setActionId(id)
    try {
      const res = await reservationsAPI.cancel(id)
      setReservations(prev => prev.map(r => r.id === id ? res.data : r))
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur')
    } finally {
      setActionId(null)
    }
  }

  const filtered = reservations.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.client_name?.toLowerCase().includes(q)
      || r.client_email?.toLowerCase().includes(q)
      || r.slot?.service_name?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="page-container">
      <nav className="admin-nav">
        <Link to="/admin" className="admin-nav-link">📊 Dashboard</Link>
        <Link to="/admin/reservations" className="admin-nav-link active">📋 Réservations</Link>
        <Link to="/admin/slots" className="admin-nav-link">🗓️ Créneaux</Link>
        <Link to="/admin/services" className="admin-nav-link">⚙️ Services</Link>
      </nav>

      <div className="section-header">
        <div>
          <h2>Gestion des Réservations</h2>
          <p>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Rechercher client, service…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: '240px' }}
        />
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'confirmed', label: 'Confirmées' },
          { key: 'cancelled', label: 'Annulées' },
          { key: 'pending', label: 'En attente' }
        ].map(f => (
          <button
            key={f.key}
            className={`btn btn-sm ${statusFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#ID</th>
                <th>Client</th>
                <th>Service</th>
                <th>Date</th>
                <th>Horaire</th>
                <th>Prix</th>
                <th>Statut</th>
                <th>Créée le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>#{r.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.client_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{r.client_email}</div>
                  </td>
                  <td>{r.slot?.service_name}</td>
                  <td>{r.slot?.date}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.slot?.start_time} – {r.slot?.end_time}</td>
                  <td><strong>{r.price}€</strong></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    {r.status === 'confirmed' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(r.id)}
                        disabled={actionId === r.id}
                      >
                        {actionId === r.id ? '…' : 'Annuler'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <div className="empty-icon">📭</div>
              <h3>Aucune réservation</h3>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
