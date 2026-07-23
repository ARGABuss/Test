import { STATUS_LABELS, STATUS_COLORS } from '../services/workOrderStateMachine'

export default function StatusBadge({ status, size = 'sm' }) {
  const label = STATUS_LABELS[status] || status
  const color = STATUS_COLORS[status] || 'secondary'
  const fs = size === 'lg' ? 'fs-6' : 'small'
  const textDark = ['warning'].includes(color) ? 'text-dark' : ''

  return (
    <span className={`badge bg-${color} ${textDark} ${fs}`}>
      {label}
    </span>
  )
}
