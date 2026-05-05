import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { servicesAPI } from '../../services/api'

const EMPTY_FORM = { name: '', description: '', base_price: '', duration: '' }

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editService, setEditService] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = () => {
    servicesAPI.getAllAdmin()
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const openCreate = () => {
    setEditService(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  const openEdit = (service) => {
    setEditService(service)
    setForm({
      name: service.name,
      description: service.description || '',
      base_price: service.base_price,
      duration: service.duration
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editService) {
        const res = await servicesAPI.update(editService.id, form)
        setServices(prev => prev.map(s => s.id === editService.id ? res.data : s))
      } else {
        const res = await servicesAPI.create(form)
        setServices(prev => [...prev, res.data])
      }
      setShowModal(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (service) => {
    try {
      const res = await servicesAPI.update(service.id, { is_active: !service.is_active })
      setServices(prev => prev.map(s => s.id === service.id ? res.data : s))
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="page-container">
      <nav className="admin-nav">
        <Link to="/admin" className="admin-nav-link">📊 Dashboard</Link>
        <Link to="/admin/reservations" className="admin-nav-link">📋 Réservations</Link>
        <Link to="/admin/slots" className="admin-nav-link">🗓️ Créneaux</Link>
        <Link to="/admin/services" className="admin-nav-link active">⚙️ Services</Link>
      </nav>

      <div className="section-header">
        <div>
          <h2>Gestion des Services</h2>
          <p>{services.length} service{services.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouveau service
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Prix de base</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>#{s.id}</td>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ color: 'var(--gray-500)', maxWidth: '250px', fontSize: '0.8125rem' }}>
                    {s.description || '—'}
                  </td>
                  <td><strong style={{ color: 'var(--primary)' }}>{s.base_price}€</strong></td>
                  <td>{s.duration} min</td>
                  <td>
                    <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {s.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(s)}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        className={`btn btn-sm ${s.is_active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggle(s)}
                      >
                        {s.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <div className="empty-icon">⚙️</div>
              <h3>Aucun service</h3>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreate}>
                Créer un service
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">
              {editService ? '✏️ Modifier le service' : '➕ Nouveau service'}
            </h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom du service *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Consultation Standard"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Description du service…"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Prix de base (€) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="50"
                    min="0"
                    step="0.01"
                    value={form.base_price}
                    onChange={e => setForm({ ...form, base_price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Durée (minutes) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="30"
                    min="1"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde…' : editService ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
