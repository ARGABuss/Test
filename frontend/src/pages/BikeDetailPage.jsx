import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { bikesService, ordersService } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'
import MotoIcon from '../components/MotoIcon'

const fmtDate = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtCOP  = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v))

export default function BikeDetailPage() {
  const { id } = useParams()
  const [bike,    setBike]    = useState(null)
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError('')
      try {
        const [bRes, oRes] = await Promise.all([
          bikesService.getById(id),
          ordersService.getAll({ pageSize: 100 }),
        ])
        if (!cancelled) {
          const b = bRes.data.data
          setBike(b)
          setOrders(oRes.data.data.data.filter((o) => o.bike?.id === b.id))
        }
      } catch (e) { if (!cancelled) setError(e.message) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="container py-5"><LoadingSpinner /></div>
  if (error)   return <div className="container py-5"><AlertMessage type="error" message={error} /></div>
  if (!bike)   return null

  return (
    <div className="container-xl py-4">
      <Link to="/bikes" className="text-muted small text-decoration-none">
        <i className="bi bi-arrow-left me-1" />Motos
      </Link>

      {/* Header */}
      <div className="card border-0 shadow-sm my-3">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex gap-3 align-items-center">
            <MotoIcon className="fs-1" />
            <div>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <h1 className="h4 fw-bold font-monospace mb-0">{bike.placa}</h1>
                {bike.cylinder && (
                  <span className="badge bg-secondary">{bike.cylinder}cc</span>
                )}
              </div>
              <div className="text-muted">{bike.brand} {bike.model}</div>
              <small className="text-muted">Registrada el {fmtDate(bike.createdAt)}</small>
            </div>
          </div>
          <Link to="/orders/new" className="btn btn-warning fw-semibold">
            <i className="bi bi-plus-circle me-1" />Nueva Orden
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Propietario */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold">
              <i className="bi bi-person me-2 text-warning" />Propietario
            </div>
            <div className="card-body">
              {bike.client ? (
                <>
                  <div className="fw-bold mb-1">{bike.client.name}</div>
                  <a href={`tel:${bike.client.phone}`} className="text-muted small text-decoration-none d-block">
                    <i className="bi bi-telephone me-1" />{bike.client.phone}
                  </a>
                  {bike.client.email && (
                    <a href={`mailto:${bike.client.email}`} className="text-muted small text-decoration-none d-block">
                      <i className="bi bi-envelope me-1" />{bike.client.email}
                    </a>
                  )}
                  <Link to={`/clients/${bike.client.id}`} className="small text-warning text-decoration-none d-block mt-2">
                    Ver perfil →
                  </Link>
                </>
              ) : (
                <p className="text-muted small mb-0">Sin propietario</p>
              )}
            </div>
          </div>
        </div>

        {/* Historial de órdenes */}
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold">
              <i className="bi bi-clipboard-list me-2 text-warning" />Historial de Órdenes ({orders.length})
            </div>
            {!orders.length ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-clipboard-x fs-1 d-block mb-2" />
                <p className="mb-0 small">Sin órdenes registradas</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {orders.map((o) => (
                  <li key={o.id} className="list-group-item px-4 py-3">
                    <Link to={`/orders/${o.id}`} className="text-decoration-none d-flex justify-content-between align-items-center">
                      <div>
                        <div className="d-flex gap-2 align-items-center mb-1">
                          <span className="font-monospace small text-muted">#{String(o.id).padStart(4, '0')}</span>
                          <StatusBadge status={o.status} />
                        </div>
                        <p className="mb-0 small text-muted text-truncate" style={{ maxWidth: 300 }}>{o.faultDescription}</p>
                        <small className="text-muted">{fmtDate(o.entryDate)}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-dark">{fmtCOP(o.total)}</div>
                        <small className="text-muted">→</small>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
