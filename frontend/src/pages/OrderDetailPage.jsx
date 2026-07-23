import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ordersService } from '../services/api'
import { STATUS_LABELS, getAllowedTransitions } from '../services/workOrderStateMachine'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'
import MotoIcon from '../components/MotoIcon'

const fmtDate = (d) => new Date(d).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const fmtCOP  = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v))

const STATUS_FLOW = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA']
const DEFAULT_ITEM = { type: 'MANO_OBRA', description: '', count: 1, unitValue: '' }

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order,          setOrder]          = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState('')
  const [selStatus,      setSelStatus]      = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showAddItem,    setShowAddItem]    = useState(false)
  const [itemForm,       setItemForm]       = useState(DEFAULT_ITEM)
  const [addingItem,     setAddingItem]     = useState(false)
  const [deletingId,     setDeletingId]     = useState(null)

  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError('')
      try {
        const res = await ordersService.getById(id)
        if (!cancelled) { setOrder(res.data.data); setSelStatus('') }
      } catch (e) { if (!cancelled) setError(e.message) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [id, refreshKey])

  async function updateStatus() {
    setUpdatingStatus(true); setError('')
    try {
      await ordersService.updateStatus(id, selStatus)
      setSuccess(`Estado actualizado a "${STATUS_LABELS[selStatus]}"`)
      refresh()
    } catch (e) { setError(e.message) }
    finally { setUpdatingStatus(false) }
  }

  async function addItem() {
    if (!itemForm.description.trim()) { setError('La descripción es requerida'); return }
    const uv = parseFloat(itemForm.unitValue)
    if (isNaN(uv) || uv < 0) { setError('El valor unitario debe ser ≥ 0'); return }
    setAddingItem(true); setError('')
    try {
      await ordersService.addItem(id, { type: itemForm.type, description: itemForm.description.trim(), count: itemForm.count, unitValue: uv })
      setItemForm(DEFAULT_ITEM); setShowAddItem(false)
      setSuccess('Ítem agregado')
      refresh()
    } catch (e) { setError(e.message) }
    finally { setAddingItem(false) }
  }

  async function deleteItem(itemId) {
    if (!window.confirm('¿Eliminar este ítem?')) return
    setDeletingId(itemId); setError('')
    try {
      await ordersService.deleteItem(itemId)
      setSuccess('Ítem eliminado')
      refresh()
    } catch (e) { setError(e.message) }
    finally { setDeletingId(null) }
  }

  if (loading) return <div className="container py-5"><LoadingSpinner text="Cargando orden…" /></div>

  const canEdit = order && order.status !== 'ENTREGADA' && order.status !== 'CANCELADA'
  const transitions = order ? getAllowedTransitions(order.status) : []

  return (
    <div className="container-xl py-4">
      <Link to="/" className="text-muted small text-decoration-none">
        <i className="bi bi-arrow-left me-1" />Volver a órdenes
      </Link>

      {!order ? (
        <AlertMessage type="error" message={error || 'Orden no encontrada'} />
      ) : (
        <>
          {error   && <div className="mt-3"><AlertMessage type="error"   message={error}   onClose={() => setError('')} /></div>}
          {success && <div className="mt-3"><AlertMessage type="success" message={success} onClose={() => setSuccess('')} /></div>}

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mt-3 mb-4 flex-wrap gap-2">
            <div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <h1 className="h4 fw-bold mb-0">Orden #{String(order.id).padStart(4, '0')}</h1>
                <StatusBadge status={order.status} size="lg" />
              </div>
              <small className="text-muted">Ingresada el {fmtDate(order.entryDate)}</small>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={refresh}>
              <i className="bi bi-arrow-clockwise me-1" />Refrescar
            </button>
          </div>

          <div className="row g-4">
            {/* Left column */}
            <div className="col-12 col-lg-8">
              {/* Fault */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <p className="text-muted small fw-semibold text-uppercase mb-1">Descripción de la Falla</p>
                  <p className="mb-0">{order.faultDescription}</p>
                </div>
              </div>

              {/* Items */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">
                    Ítems <span className="badge bg-secondary ms-1">{order.items?.length || 0}</span>
                  </h5>
                  {canEdit && (
                    <button className="btn btn-warning btn-sm" onClick={() => setShowAddItem(!showAddItem)}>
                      {showAddItem ? '× Cancelar' : '+ Agregar ítem'}
                    </button>
                  )}
                </div>

                {/* Add item form */}
                {showAddItem && (
                  <div className="card-body border-bottom bg-light">
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Tipo *</label>
                        <select className="form-select form-select-sm" value={itemForm.type} onChange={(e) => setItemForm((p) => ({ ...p, type: e.target.value }))}>
                          <option value="MANO_OBRA">🔧 Mano de Obra</option>
                          <option value="REPUESTO">📦 Repuesto</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Descripción *</label>
                        <input className="form-control form-control-sm" placeholder="Descripción" value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Cantidad *</label>
                        <input className="form-control form-control-sm" type="number" min={1} value={itemForm.count} onChange={(e) => setItemForm((p) => ({ ...p, count: parseInt(e.target.value) || 1 }))} />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Valor unitario (COP) *</label>
                        <input className="form-control form-control-sm" type="number" min={0} placeholder="0" value={itemForm.unitValue} onChange={(e) => setItemForm((p) => ({ ...p, unitValue: e.target.value }))} />
                      </div>
                    </div>
                    {itemForm.description && itemForm.unitValue && (
                      <p className="small text-muted mt-2 mb-0">Subtotal: <strong>{fmtCOP(parseFloat(itemForm.unitValue || 0) * itemForm.count)}</strong></p>
                    )}
                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => { setShowAddItem(false); setItemForm(DEFAULT_ITEM) }}>Cancelar</button>
                      <button className="btn btn-warning btn-sm flex-grow-1" onClick={addItem} disabled={addingItem}>
                        {addingItem ? <span className="spinner-border spinner-border-sm me-1" /> : null}Guardar ítem
                      </button>
                    </div>
                  </div>
                )}

                {!order.items?.length ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-box fs-1 d-block mb-2" />
                    <p className="mb-0">No hay ítems registrados</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th className="text-center">Cant.</th>
                          <th className="text-end">V. Unit.</th>
                          <th className="text-end">Subtotal</th>
                          {canEdit && <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <span className={`badge ${item.type === 'MANO_OBRA' ? 'bg-primary' : 'bg-purple text-white'}`}
                                style={{ background: item.type === 'REPUESTO' ? '#7e22ce' : undefined }}>
                                {item.type === 'MANO_OBRA' ? '🔧 M.Obra' : '📦 Repuesto'}
                              </span>
                            </td>
                            <td>{item.description}</td>
                            <td className="text-center">{item.count}</td>
                            <td className="text-end">{fmtCOP(item.unitValue)}</td>
                            <td className="text-end fw-semibold">{fmtCOP(parseFloat(item.unitValue) * item.count)}</td>
                            {canEdit && (
                              <td className="text-center">
                                <button className="btn btn-link text-danger p-0" onClick={() => deleteItem(item.id)} disabled={deletingId === item.id}>
                                  <i className="bi bi-trash" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan={canEdit ? 4 : 4} className="text-end fw-bold">TOTAL</td>
                          <td className="text-end fw-bold text-warning fs-5">{fmtCOP(order.total)}</td>
                          {canEdit && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="col-12 col-lg-4 d-flex flex-column gap-3">
              {/* Status */}
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-muted small fw-semibold text-uppercase mb-2">Estado</p>
                  <StatusBadge status={order.status} size="lg" />

                  {/* Flow */}
                  <div className="mt-3 d-flex flex-column gap-2">
                    {STATUS_FLOW.map((s) => {
                      const sIdx = STATUS_FLOW.indexOf(s)
                      const cIdx = STATUS_FLOW.indexOf(order.status)
                      const isPast = sIdx < cIdx && order.status !== 'CANCELADA'
                      const isCurr = order.status === s
                      return (
                        <div key={s} className="d-flex align-items-center gap-2">
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isCurr ? '#f97316' : isPast ? '#22c55e' : '#e2e8f0', flexShrink: 0 }} />
                          <span className={`small ${isCurr ? 'fw-bold text-warning' : isPast ? 'text-success' : 'text-muted'}`}>
                            {STATUS_LABELS[s]}
                          </span>
                          {isCurr && <i className="bi bi-caret-left-fill text-warning small" />}
                        </div>
                      )
                    })}
                    {order.status === 'CANCELADA' && (
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                        <span className="small fw-bold text-danger">Cancelada</span>
                      </div>
                    )}
                  </div>

                  {transitions.length > 0 && (
                    <div className="mt-3">
                      <label className="form-label small fw-semibold">Cambiar a:</label>
                      <select className="form-select form-select-sm mb-2" value={selStatus} onChange={(e) => setSelStatus(e.target.value)}>
                        <option value="">Seleccionar estado…</option>
                        {transitions.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      <button className="btn btn-warning btn-sm w-100" onClick={updateStatus} disabled={!selStatus || updatingStatus}>
                        {updatingStatus ? <span className="spinner-border spinner-border-sm me-1" /> : null}Actualizar Estado
                      </button>
                    </div>
                  )}
                  {transitions.length === 0 && (
                    <p className="small text-muted mt-2 mb-0">
                      {order.status === 'ENTREGADA' ? '✅ Orden finalizada' : '❌ Orden cancelada'}
                    </p>
                  )}
                </div>
              </div>

              {/* Bike */}
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-muted small fw-semibold text-uppercase mb-2">Moto</p>
                  <div className="d-flex gap-3 align-items-center">
                    <MotoIcon className="fs-2 text-warning" />
                    <div>
                      <div className="fw-bold font-monospace fs-5">{order.bike?.placa}</div>
                      <div className="text-muted small">{order.bike?.brand} {order.bike?.model}</div>
                      {order.bike?.cylinder && <div className="text-muted small">{order.bike.cylinder}cc</div>}
                    </div>
                  </div>
                  <Link to={`/bikes/${order.bike?.id}`} className="small text-warning text-decoration-none d-block mt-2">
                    Ver historial →
                  </Link>
                </div>
              </div>

              {/* Client */}
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-muted small fw-semibold text-uppercase mb-2">Cliente</p>
                  <div className="fw-bold">{order.bike?.client?.name}</div>
                  <a href={`tel:${order.bike?.client?.phone}`} className="text-muted small text-decoration-none d-block">
                    <i className="bi bi-telephone me-1" />{order.bike?.client?.phone}
                  </a>
                  {order.bike?.client?.email && (
                    <a href={`mailto:${order.bike.client.email}`} className="text-muted small text-decoration-none d-block">
                      <i className="bi bi-envelope me-1" />{order.bike.client.email}
                    </a>
                  )}
                  <Link to={`/clients/${order.bike?.client?.id}`} className="small text-warning text-decoration-none d-block mt-2">
                    Ver perfil →
                  </Link>
                </div>
              </div>

              {/* Total */}
              <div className="card border-0 text-white" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <div className="card-body">
                  <p className="small mb-1 opacity-75">Total de la Orden</p>
                  <p className="fs-3 fw-bold mb-1">{fmtCOP(order.total)}</p>
                  <small className="opacity-75">{order.items?.length || 0} ítem{order.items?.length !== 1 ? 's' : ''}</small>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
