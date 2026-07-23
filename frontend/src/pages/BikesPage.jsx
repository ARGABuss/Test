import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bikesService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'
import MotoIcon from '../components/MotoIcon'

export default function BikesPage() {
  const [bikes,   setBikes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [query,   setQuery]   = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError('')
      try {
        const res = await bikesService.getAll(query)
        if (!cancelled) setBikes(res.data.data)
      } catch (e) { if (!cancelled) setError(e.message) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [query])

  return (
    <div className="container-xl py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h4 fw-bold mb-0"><MotoIcon className="me-2 text-warning" />Motos</h1>
          <small className="text-muted">{bikes.length} moto{bikes.length !== 1 ? 's' : ''}</small>
        </div>
        <Link to="/orders/new" className="btn btn-warning fw-semibold">
          <i className="bi bi-plus-circle me-1" />Nueva Orden
        </Link>
      </div>

      {error && <div className="mb-3"><AlertMessage type="error" message={error} onClose={() => setError('')} /></div>}

      {/* Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <input
              className="form-control font-monospace text-uppercase"
              placeholder="Buscar placa…"
              value={search}
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') setQuery(search.trim()) }}
              maxLength={10}
            />
            <button className="btn btn-warning" onClick={() => setQuery(search.trim())}>
              <i className="bi bi-search" />
            </button>
            {query && (
              <button className="btn btn-outline-secondary" onClick={() => { setSearch(''); setQuery('') }}>Limpiar</button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? <LoadingSpinner text="Cargando motos…" /> : bikes.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5 text-muted">
          <MotoIcon className="fs-1 d-block mb-2" />
          <p className="fw-semibold mb-0">No hay motos registradas</p>
        </div>
      ) : (
        <div className="row g-3">
          {bikes.map((bike) => (
            <div key={bike.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <MotoIcon className="fs-1 text-warning" />
                    <Link to={`/bikes/${bike.id}`} className="btn btn-outline-secondary btn-sm">
                      <i className="bi bi-eye me-1" />Ver
                    </Link>
                  </div>
                  <div className="fw-bold font-monospace fs-5">{bike.placa}</div>
                  <div className="text-muted">{bike.brand} {bike.model}</div>
                  {bike.cylinder && <small className="text-muted">{bike.cylinder}cc</small>}
                  {bike.client && (
                    <div className="mt-3 pt-3 border-top">
                      <small className="text-muted text-uppercase fw-semibold d-block">Propietario</small>
                      <div className="fw-semibold small">{bike.client.name}</div>
                      <small className="text-muted">{bike.client.phone}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
