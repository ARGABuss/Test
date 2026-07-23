import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { clientsService, ordersService } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'
import MotoIcon from '../components/MotoIcon'

const fmtDate = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtCOP  = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v))

export default function ClientDetailPage() {
  const { id } = useParams()
  const [client,  setClient]  = useState(null)
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError('')
      try {
        const [cRes, oRes] = await Promise.all([
          clientsService.getById(id),
          ordersService.getAll({ pageSize: 100 }),
        ])
        if (!cancelled) {
          const cli = cRes.data.data
          setClient(cli)
          const bikeIds = (cli.bikes || []).map((b) => b.id)
          setOrders(oRes.data.data.data.filter((o) => bikeIds.includes(o.bike?.id)))
        }
      } catch (e) { if (!cancelled) setError(e.message) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="container py-5"><LoadingSpinner /></div>
  if (error)   return <div className="container py-5"><AlertMessage type="error" message={error} /></div>
  if (!client) return null

  return (
    <div className="container-xl py-4">
      <Link to="/clients" className="text-muted small text-decoration-none">
        <i className="bi bi-arrow-left me-1" />Clientes
      </Link>

      {/* Header */}
      <div className="card border-0 shadow-sm my-3">
        <div className="card-body d-flex gap-3 align-items-center">
          <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 52, height: 52 }}>
            <i className="bi bi-person fs-4 text-dark" />
          </div>
          <div>
            <h1 className="h5 fw-bold mb-1">{client.name}</h1>
            <div className="d-flex gap-3 flex-wrap">
              <a href={`tel:${client.phone}`} className="text-muted small text-decoration-none">
                <i className="bi bi-telephone me-1" />{client.phone}
              </a>
              {client.email && (
                <a href={`mailto:${client.email}`} className="text-muted small text-decoration-none">
                  <i className="bi bi-envelope me-1" />{client.email}
                </a>
              )}
            </div>
            <small className="text-muted">Cliente desde {fmtDate(client.createdAt)}</small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Motos */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold">
              <MotoIcon className="me-2 text-warning" />Motos ({client.bikes?.length || 0})
            </div>
            {!client.bikes?.length ? (
              <div className="text-center py-4 text-muted">
                <MotoIcon className="fs-1 d-block mb-2" />
                <p className="mb-0 small">Sin motos registradas</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {client.bikes.map((b) => (
                  <li key={b.id} className="list-group-item px-4 py-3">
                    <Link to={`/bikes/${b.id}`} className="text-decoration-none d-flex align-items-center gap-3">
                      <MotoIcon className="fs-4 text-warning" />
                      <div>
                        <div className="fw-bold font-monospace text-dark">{b.placa}</div>
                        <small className="text-muted">{b.brand} {b.model}{b.cylinder ? ` · ${b.cylinder}cc` : ''}</small>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Órdenes */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold">
              <i className="bi bi-clipboard-list me-2 text-warning" />Órdenes ({orders.length})
            </div>
            {!orders.length ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-clipboard-x fs-1 d-block mb-2" />
                <p className="mb-0 small">Sin órdenes registradas</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {orders.slice(0, 10).map((o) => (
                  <li key={o.id} className="list-group-item px-4 py-3">
                    <Link to={`/orders/${o.id}`} className="text-decoration-none d-flex justify-content-between align-items-center">
                      <div>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="font-monospace small text-muted">#{String(o.id).padStart(4, '0')}</span>
                          <span className="font-monospace small fw-bold text-dark">{o.bike?.placa}</span>
                        </div>
                        <small className="text-muted">{fmtDate(o.entryDate)}</small>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        <StatusBadge status={o.status} />
                        <span className="small fw-semibold text-dark">{fmtCOP(o.total)}</span>
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
