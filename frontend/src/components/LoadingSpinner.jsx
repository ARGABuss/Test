export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 py-5 text-secondary">
      <div className="spinner-border spinner-border-sm text-warning" role="status" />
      <span>{text}</span>
    </div>
  )
}
