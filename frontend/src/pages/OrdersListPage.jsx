import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersService } from '../services/api'
import { VALID_STATUSES, STATUS_LABELS } from '../services/workOrderStateMachine'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'

const fmtDate = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtCOP  = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v))

export default function OrdersListPage() {
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [plateInput,   setPlateInput]   = useState('')
  const [plateFilter,  setPlateFilter]  = useState('')
  const [page,         setPage]         = useState(1)
  const [meta,         setMeta]         = useState({ total: 0, totalPages: 1 })
  const [refreshKey,   setRefreshKey]   = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError('')
      try {
        const params = { page, pageSize: 10 }
        if (statusFilter) params.status = statusFilter
        if (plateFilter)  params.plate  = plateFilter
        const res = await ordersService.getAll(params)
        if (!cancelled) {
          setOrders(res.data.data.data)
          setMeta({ total: res.data.data.total, totalPages: res.data.data.totalPages })
        }
      } catch (e) { if (!cancelled) setError(e.message) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [page, statusFilter, plateFilter, refreshKey])


  return (
    <div className="container-xl py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h4 fw-bold mb-0"><i className="bi bi-clipboard-list me-2 text-warning" />Órdenes de Trabajo</h1>
          <small className="text-muted">{meta.total} órdenes en total</small>
        </div>
        <Link to="/orders/new" className="btn btn-warning fw-semibold">
          <i className="bi bi-plus-circle me-1" />Nueva Orden
        </Link>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <input
                  className="form-control font-monospace text-uppercase"
                  placeholder="Filtrar por placa…"
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setPlateFilter(plateInput.trim()); setPage(1) } }}
                />
                <button className="btn btn-warning" onClick={() => { setPlateFilter(plateInput.trim()); setPage(1) }}>
                  <i className="bi bi-search" />
                </button>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="">Todos los estados</option>
                {VALID_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="col-auto d-flex gap-2">
              {(statusFilter || plateFilter) && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => { setStatusFilter(''); setPlateFilter(''); setPlateInput(''); setPage(1) }}>
                  Limpiar
                </button>
              )}
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setRefreshKey(k => k + 1)}>
                <i className="bi bi-arrow-clockwise" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="mb-3"><AlertMessage type="error" message={error} onClose={() => setError('')} /></div>}

      {/* Table */}
      <div className="card border-0 shadow-sm">
        {loading ? <LoadingSpinner text="Cargando órdenes…" /> : orders.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-clipboard-x fs-1 d-block mb-2" />
            <p className="fw-semibold">No hay órdenes de trabajo</p>
            <small>{statusFilter || plateFilter ? 'Intenta con otros filtros' : 'Crea la primera orden'}</small>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Placa</th>
                    <th>Moto</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th className="text-end">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="text-muted font-monospace small">#{String(o.id).padStart(4, '0')}</td>
                      <td className="font-monospace fw-bold">{o.moto?.placa}</td>
                      <td className="text-muted">{o.moto?.brand} {o.moto?.model}</td>
                      <td>
                        <div className="fw-semibold">{o.moto?.cliente?.name}</div>
                        <small className="text-muted">{o.moto?.cliente?.phone}</small>
                      </td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="text-muted small">{fmtDate(o.entryDate)}</td>
                      <td className="text-end fw-semibold">{fmtCOP(o.total)}</td>
                      <td>
                        <Link to={`/orders/${o.id}`} className="btn btn-outline-secondary btn-sm">
                          <i className="bi bi-eye me-1" />Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="card-footer d-flex justify-content-center">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)}>‹</button>
                  </li>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                    </li>
                  ))}
                  <li className={`page-item ${page >= meta.totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)}>›</button>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
