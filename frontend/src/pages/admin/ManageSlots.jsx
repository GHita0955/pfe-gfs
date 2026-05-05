import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { slotsAPI, servicesAPI } from '../../services/api'

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return `${DAYS_FR[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

function today() {
  return new Date().toISOString().split('T')[0]
}
function inDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function ManageSlots() {
  const [tab, setTab] = useState('generate') // 'generate' | 'list'
  const [services, setServices] = useState([])

  // --- Generator state ---
  const [genForm, setGenForm] = useState({
    service_id: '',
    start_date: today(),
    end_date: inDays(7),
    skip_weekends: false
  })
  const [timePairs, setTimePairs] = useState([
    { start: '09:00', end: '09:30' },
    { start: '10:00', end: '10:30' },
    { start: '14:00', end: '14:30' }
  ])
  const [genLoading, setGenLoading] = useState(false)
  const [genMsg, setGenMsg] = useState(null)

  // --- Slot list state ---
  const [slots, setSlots] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [listFilter, setListFilter] = useState({ service_id: '', date: today() })
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    servicesAPI.getAllAdmin()
      .then(res => {
        setServices(res.data)
        if (res.data.length > 0) setGenForm(f => ({ ...f, service_id: res.data[0].id }))
      })
      .catch(console.error)
  }, [])

  // Load slots when tab is list
  useEffect(() => {
    if (tab === 'list') loadSlots()
  }, [tab])

  const loadSlots = () => {
    setListLoading(true)
    const params = {}
    if (listFilter.service_id) params.service_id = listFilter.service_id
    if (listFilter.date) params.date = listFilter.date
    slotsAPI.getAll(params)
      .then(res => setSlots(res.data))
      .catch(console.error)
      .finally(() => setListLoading(false))
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenMsg(null)
    setGenLoading(true)
    try {
      const res = await slotsAPI.generate({
        service_id: parseInt(genForm.service_id),
        start_date: genForm.start_date,
        end_date: genForm.end_date,
        skip_weekends: genForm.skip_weekends,
        time_slots: timePairs.map(tp => ({ start: tp.start, end: tp.end }))
      })
      setGenMsg({ type: 'success', text: res.data.message })
    } catch (err) {
      setGenMsg({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la génération' })
    } finally {
      setGenLoading(false)
    }
  }

  const addTimePair = () => setTimePairs([...timePairs, { start: '09:00', end: '09:30' }])
  const removeTimePair = (i) => setTimePairs(timePairs.filter((_, idx) => idx !== i))
  const updateTimePair = (i, field, val) =>
    setTimePairs(timePairs.map((tp, idx) => idx === i ? { ...tp, [field]: val } : tp))

  const toggleAvailability = async (slot) => {
    try {
      await slotsAPI.update(slot.id, { is_available: !slot.is_available })
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, is_available: !s.is_available } : s))
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce créneau ?')) return
    setDeletingId(id)
    try {
      await slotsAPI.delete(id)
      setSlots(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page-container">
      <nav className="admin-nav">
        <Link to="/admin" className="admin-nav-link">📊 Dashboard</Link>
        <Link to="/admin/reservations" className="admin-nav-link">📋 Réservations</Link>
        <Link to="/admin/slots" className="admin-nav-link active">🗓️ Créneaux</Link>
        <Link to="/admin/services" className="admin-nav-link">⚙️ Services</Link>
      </nav>

      <div className="section-header">
        <h2>Gestion des Créneaux</h2>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${tab === 'generate' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('generate')}
        >
          ⚡ Générer des créneaux
        </button>
        <button
          className={`btn ${tab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('list')}
        >
          📋 Liste des créneaux
        </button>
      </div>

      {/* ─── Generator ─── */}
      {tab === 'generate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card">
            <div className="card-header"><h3>Générateur de créneaux en masse</h3></div>
            <div className="card-body">
              {genMsg && (
                <div className={`alert ${genMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                  {genMsg.text}
                </div>
              )}
              <form onSubmit={handleGenerate}>
                <div className="form-group">
                  <label className="form-label">Service</label>
                  <select
                    className="form-select"
                    value={genForm.service_id}
                    onChange={e => setGenForm({ ...genForm, service_id: e.target.value })}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date de début</label>
                    <input
                      type="date"
                      className="form-input"
                      value={genForm.start_date}
                      onChange={e => setGenForm({ ...genForm, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date de fin</label>
                    <input
                      type="date"
                      className="form-input"
                      value={genForm.end_date}
                      onChange={e => setGenForm({ ...genForm, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={genForm.skip_weekends}
                      onChange={e => setGenForm({ ...genForm, skip_weekends: e.target.checked })}
                    />
                    Ignorer les week-ends
                  </label>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Créneaux horaires</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addTimePair}>
                      + Ajouter
                    </button>
                  </div>
                  <div className="time-pairs-list">
                    {timePairs.map((tp, i) => (
                      <div key={i} className="time-pair">
                        <input
                          type="time"
                          className="form-input"
                          value={tp.start}
                          onChange={e => updateTimePair(i, 'start', e.target.value)}
                          required
                        />
                        <span className="time-pair-sep">→</span>
                        <input
                          type="time"
                          className="form-input"
                          value={tp.end}
                          onChange={e => updateTimePair(i, 'end', e.target.value)}
                          required
                        />
                        {timePairs.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => removeTimePair(i)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={genLoading}
                >
                  {genLoading ? 'Génération en cours…' : '⚡ Générer les créneaux'}
                </button>
              </form>
            </div>
          </div>

          {/* Info panel */}
          <div>
            <div className="alert alert-info">
              <div>
                <strong>💡 Comment ça marche</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', lineHeight: 2 }}>
                  <li>Sélectionnez un service et une plage de dates</li>
                  <li>Ajoutez les créneaux horaires souhaités</li>
                  <li>Cochez "Ignorer les week-ends" si nécessaire</li>
                  <li>Les créneaux déjà existants ne seront pas dupliqués</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Slot list ─── */}
      {tab === 'list' && (
        <>
          <div className="filter-bar">
            <select
              className="form-select"
              value={listFilter.service_id}
              onChange={e => setListFilter({ ...listFilter, service_id: e.target.value })}
            >
              <option value="">Tous les services</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input
              type="date"
              className="form-input"
              value={listFilter.date}
              onChange={e => setListFilter({ ...listFilter, date: e.target.value })}
            />
            <button className="btn btn-primary" onClick={loadSlots}>
              🔍 Filtrer
            </button>
          </div>

          {listLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Horaire</th>
                    <th>Prix dynamique</th>
                    <th>Disponibilité</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>#{slot.id}</td>
                      <td>{slot.service_name}</td>
                      <td>{formatDate(slot.date)}</td>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {slot.start_time} – {slot.end_time}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: slot.is_discounted ? 'var(--secondary)' : slot.is_peak ? 'var(--accent)' : 'var(--primary)' }}>
                          {slot.dynamic_price}€
                        </span>
                        {slot.is_discounted && <span className="badge badge-success" style={{ marginLeft: '0.375rem' }}>Promo</span>}
                        {slot.is_peak && <span className="badge badge-warning" style={{ marginLeft: '0.375rem' }}>Forte demande</span>}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${slot.is_available ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => toggleAvailability(slot)}
                        >
                          {slot.is_available ? '✓ Disponible' : '✗ Indisponible'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                        >
                          {deletingId === slot.id ? '…' : '🗑'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {slots.length === 0 && (
                <div className="empty-state" style={{ padding: '3rem' }}>
                  <div className="empty-icon">🗓️</div>
                  <h3>Aucun créneau trouvé</h3>
                  <p>Générez des créneaux ou modifiez les filtres</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
