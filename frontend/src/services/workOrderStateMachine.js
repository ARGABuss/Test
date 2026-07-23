export const VALID_STATUSES = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA']

const TRANSITIONS = {
  RECIBIDA:    ['DIAGNOSTICO', 'CANCELADA'],
  DIAGNOSTICO: ['EN_PROCESO',  'CANCELADA'],
  EN_PROCESO:  ['LISTA',       'CANCELADA'],
  LISTA:       ['ENTREGADA',   'CANCELADA'],
  ENTREGADA:   [],
  CANCELADA:   [],
}

export const STATUS_LABELS = {
  RECIBIDA:    'Recibida',
  DIAGNOSTICO: 'Diagnóstico',
  EN_PROCESO:  'En Proceso',
  LISTA:       'Lista',
  ENTREGADA:   'Entregada',
  CANCELADA:   'Cancelada',
}

export const STATUS_COLORS = {
  RECIBIDA:    'primary',
  DIAGNOSTICO: 'warning',
  EN_PROCESO:  'orange',
  LISTA:       'success',
  ENTREGADA:   'secondary',
  CANCELADA:   'danger',
}

export function getAllowedTransitions(status) {
  return TRANSITIONS[status] || []
}

export function isValidTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to)
}
