export default function AlertMessage({ type = 'info', message, onClose }) {
  const map = { error: 'danger', success: 'success', info: 'info' }
  return (
    <div className={`alert alert-${map[type]} d-flex align-items-center justify-content-between mb-0`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button type="button" className="btn-close ms-3" onClick={onClose} />
      )}
    </div>
  )
}
