import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clientsService, bikesService, ordersService } from '../services/api'
import AlertMessage from '../components/AlertMessage'

const STATUS_STEPS = {
  search:          0,
  'register-client': 1,
  'register-bike':   2,
  order:             3,
}

export default function NewOrderPage() {
  const navigate = useNavigate()
  const [step,         setStep]         = useState('search')
  const [plateQuery,   setPlateQuery]   = useState('')
  const [searching,    setSearching]    = useState(false)
  const [foundBike,    setFoundBike]    = useState(null)
  const [notFound,     setNotFound]     = useState(false)
  const [error,        setError]        = useState('')
  const [clientForm,   setClientForm]   = useState({ name: '', phone: '', email: '' })
  const [newClientId,  setNewClientId]  = useState(null)
  const [savingClient, setSavingClient] = useState(false)
  const [bikeForm,     setBikeForm]     = useState({ placa: '', brand: '', model: '', cylinder: '' })
  const [newBikeId,    setNewBikeId]    = useState(null)
  const [savingBike,   setSavingBike]   = useState(false)
  const [fault,        setFault]        = useState('')
  const [savingOrder,  setSavingOrder]  = useState(false)

  const activeBikeId = foundBike?.id ?? newBikeId

  async function searchBike() {
    if (!plateQuery.trim()) return
    if (plateQuery.length < 6){
        setError("La placa no esta completa")
        return
    }
    setSearching(true); setError('')
    try {
      const res = await bikesService.getAll(plateQuery.trim().toUpperCase())
      const exact = res.data.data.find((b) => b.placa === plateQuery.trim().toUpperCase())
      if (exact) { setFoundBike(exact); setStep('order') }
      else { setNotFound(true); setBikeForm((p) => ({ ...p, placa: plateQuery.trim().toUpperCase() })); setStep('register-client') }
    } catch (e) { setError(e.message) }
    finally { setSearching(false) }
  }

  async function saveClient() {
    setSavingClient(true); setError('')
    try {
      const res = await clientsService.create({ name: clientForm.name.trim(), phone: clientForm.phone.trim(), email: clientForm.email || null })
      setNewClientId(res.data.data.id)
      setStep('register-bike')
    } catch (e) { setError(e.message) }
    finally { setSavingClient(false) }
  }

  async function saveBike() {
    setSavingBike(true); setError('')
    try {
      const res = await bikesService.create({
        placa: bikeForm.placa,
        brand: bikeForm.brand.trim(),
        model: bikeForm.model.trim(),
        cylinder: bikeForm.cylinder ? parseInt(bikeForm.cylinder) : null,
        clientId: newClientId,
      })
      setNewBikeId(res.data.data.id)
      setStep('order')
    } catch (e) { setError(e.message) }
    finally { setSavingBike(false) }
  }

  async function createOrder() {
    if (!fault.trim()) { setError('La descripción de la falla es requerida'); return }
    setSavingOrder(true); setError('')
    try {
      const res = await ordersService.create({ BikeId: activeBikeId, faultDescription: fault.trim() })
      setTimeout(() => navigate(`/orders/${res.data.data.id}`), 1000)
    } catch (e) { setError(e.message) }
    finally { setSavingOrder(false) }
  }

  const steps = notFound
    ? ['Buscar Moto', 'Cliente', 'Moto', 'Orden']
    : ['Buscar Moto', 'Orden']
  const currentStep = notFound ? STATUS_STEPS[step] : (step === 'search' ? 0 : 1)

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="py-4">
        <Link to="/" className="text-muted small text-decoration-none">
          <i className="bi bi-arrow-left me-1" />Volver a órdenes
        </Link>

        <h1 className="h4 fw-bold mt-3 mb-4">
          <i className="bi bi-clipboard-plus me-2 text-warning" />Nueva Orden de Trabajo
        </h1>

        {/* Stepper */}
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          {steps.map((s, i) => (
            <div key={i} className="d-flex align-items-center gap-2">
              <span className={`badge rounded-pill px-3 py-2 ${i === currentStep ? 'bg-warning text-dark' : i < currentStep ? 'bg-success' : 'bg-secondary'}`}>
                {i < currentStep ? <i className="bi bi-check me-1" /> : null}{s}
              </span>
              {i < steps.length - 1 && <i className="bi bi-chevron-right text-muted small" />}
            </div>
          ))}
        </div>

        {error && <div className="mb-3"><AlertMessage type="error" message={error} onClose={() => setError('')} /></div>}

        {/* STEP: Search */}
        {step === 'search' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-1">Buscar moto por placa</h5>
              <p className="text-muted small mb-3">Si no existe, registraremos cliente y moto.</p>
              <div className="input-group">
                <input
                  className="form-control font-monospace text-uppercase"
                  placeholder="Ej. ABC123"
                  value={plateQuery}
                  onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && searchBike()}
                  maxLength={10}
                  minLength={6}
                />
                <button className="btn btn-warning" onClick={searchBike} disabled={searching || !plateQuery.trim()}>
                  {searching ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Register Client */}
        {step === 'register-client' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="alert alert-warning py-2 small">
                Moto <strong>{bikeForm.placa}</strong> no encontrada. Registra el cliente primero.
              </div>
              <h5 className="fw-bold mb-3">Datos del cliente</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre *</label>
                <input className="form-control" placeholder="Nombre completo" value={clientForm.name} onChange={(e) => setClientForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Teléfono *</label>
                <input className="form-control" placeholder="Teléfono" value={clientForm.phone} onChange={(e) => setClientForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email (opcional)</label>
                <input className="form-control" type="email" placeholder="correo@email.com" value={clientForm.email} onChange={(e) => setClientForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={() => { setStep('search'); setNotFound(false) }}>← Atrás</button>
                <button className="btn btn-warning fw-semibold flex-grow-1" onClick={saveClient} disabled={savingClient || !clientForm.name || !clientForm.phone}>
                  {savingClient ? <span className="spinner-border spinner-border-sm me-2" /> : null}Guardar cliente →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Register Bike */}
        {step === 'register-bike' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Datos de la moto</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Placa *</label>
                <input className="form-control font-monospace text-uppercase" placeholder="ABC123" value={bikeForm.placa} maxLength={10} onChange={(e) => setBikeForm((p) => ({ ...p, placa: e.target.value.toUpperCase() }))} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold">Marca *</label>
                  <input className="form-control" placeholder="Honda, Yamaha…" value={bikeForm.brand} onChange={(e) => setBikeForm((p) => ({ ...p, brand: e.target.value }))} />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold">Modelo *</label>
                  <input className="form-control" placeholder="CB190, FZ25…" value={bikeForm.model} onChange={(e) => setBikeForm((p) => ({ ...p, model: e.target.value }))} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Cilindraje cc (opcional)</label>
                <input className="form-control" type="number" placeholder="150" min={1} value={bikeForm.cylinder} onChange={(e) => setBikeForm((p) => ({ ...p, cylinder: e.target.value }))} />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setStep('register-client')}>← Atrás</button>
                <button className="btn btn-warning fw-semibold flex-grow-1" onClick={saveBike} disabled={savingBike || !bikeForm.placa || !bikeForm.brand || !bikeForm.model}>
                  {savingBike ? <span className="spinner-border spinner-border-sm me-2" /> : null}Guardar moto →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Create Order */}
        {step === 'order' && (
          <div>
            <div className={`card border-0 shadow-sm mb-3 ${newBikeId ? 'border-success' : ''}`}>
              <div className="card-body d-flex gap-3 align-items-center">
                <i className="bi bi-bicycle fs-1 text-warning" />
                <div>
                  <div className="fw-bold font-monospace fs-5">{foundBike?.placa || bikeForm.placa}</div>
                  <div className="text-muted">{foundBike?.brand || bikeForm.brand} {foundBike?.model || bikeForm.model}</div>
                  <small className="text-muted">{foundBike?.client?.name || clientForm.name} · {foundBike?.client?.phone || clientForm.phone}</small>
                </div>
                {newBikeId && <span className="badge bg-success ms-auto">Registrada</span>}
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Descripción de la falla</h5>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Problema reportado *</label>
                  <textarea className="form-control" rows={4} placeholder="Describe la falla o el servicio requerido…" value={fault} onChange={(e) => setFault(e.target.value)} />
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => { if (notFound) setStep('register-bike'); else { setStep('search'); setFoundBike(null) } }}>← Atrás</button>
                  <button className="btn btn-warning fw-semibold flex-grow-1" onClick={createOrder} disabled={savingOrder || !fault.trim()}>
                    {savingOrder ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-circle me-2" />}Crear Orden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
