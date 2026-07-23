import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clientsService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'

export default function ClientsPage() {
  const [clients,    setClients]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')
  const [search,     setSearch]     = useState('')
  const [query,      setQuery]      = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState({ name: '', phone: '', email: '' })
  const [saving,     setSaving]     = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError('')
      try {
        const res = await clientsService.getAll(query)
        if (!cancelled) setClients(res.data.data)
      } catch (e) { if (!cancelled) setError(e.message) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [query, refreshKey])

  async function save() {
    setSaving(true); setError('')
    try {
      await clientsService.create({ name: form.name.trim(), phone: form.phone.trim(), email: form.email || null })
      setSuccess('Cliente registrado exitosamente')
      setForm({ name: '', phone: '', email: '' })
      setShowForm(false)
      refresh()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="container-xl py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h4 fw-bold mb-0"><i className="bi bi-people me-2 text-warning" />Clientes</h1>
          <small className="text-muted">{clients.length} cliente{clients.length !== 1 ? 's' : ''}</small>
        </div>
        <button className="btn btn-warning fw-semibold" onClick={() => setShowForm(!showForm)}>
          <i className="bi bi-person-plus me-1" />Nuevo Cliente
        </button>
      </div>

      {error   && <div className="mb-3"><AlertMessage type="error"   message={error}   onClose={() => setError('')} /></div>}
      {success && <div className="mb-3"><AlertMessage type="success" message={success} onClose={() => setSuccess('')} /></div>}

      {/* Form */}
      {showForm && (
        <div className="card border-warning border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Nuevo Cliente</h5>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold small">Nombre *</label>
                <input className="form-control" placeholder="Nombre completo" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold small">Teléfono *</label>
                <input className="form-control" placeholder="Número" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold small">Email (opcional)</label>
                <input className="form-control" type="email" placeholder="correo@email.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn btn-warning fw-semibold" onClick={save} disabled={saving || !form.name || !form.phone}>
                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <input className="form-control" placeholder="Buscar por nombre, teléfono o email…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setQuery(search.trim()) }} />
            <button className="btn btn-warning" onClick={() => setQuery(search.trim())}>
              <i className="bi bi-search" />
            </button>
            {query && (
              <button className="btn btn-outline-secondary" onClick={() => { setSearch(''); setQuery('') }}>Limpiar</button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card border-0 shadow-sm">
        {loading ? <LoadingSpinner text="Cargando clientes…" /> : clients.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-people fs-1 d-block mb-2" />
            <p className="fw-semibold mb-0">No hay clientes registrados</p>
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {clients.map((c) => (
              <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                <div>
                  <div className="fw-semibold">{c.name}</div>
                  <div className="d-flex gap-3 mt-1 flex-wrap">
                    <small className="text-muted"><i className="bi bi-telephone me-1" />{c.phone}</small>
                    {c.email && <small className="text-muted"><i className="bi bi-envelope me-1" />{c.email}</small>}
                  </div>
                </div>
                <Link to={`/clients/${c.id}`} className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-eye me-1" />Ver
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
