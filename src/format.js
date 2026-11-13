export function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const gradients = [
  ['#6366f1', '#a855f7'],
  ['#0ea5e9', '#6366f1'],
  ['#f97316', '#ec4899'],
  ['#10b981', '#0ea5e9'],
  ['#f43f5e', '#f59e0b'],
  ['#8b5cf6', '#ec4899'],
]

/** Background for an event cover: the uploaded image, or a colorful gradient fallback. */
export function coverStyle(event) {
  if (event.image_url) return { backgroundImage: `url("${event.image_url}")` }
  const [a, b] = gradients[event.id % gradients.length]
  return { backgroundImage: `linear-gradient(135deg, ${a}, ${b})` }
}

export function initials(title = '') {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

export function dateParts(value) {
  const d = new Date(value)
  return {
    day: d.getDate(),
    month: d.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
  }
}

export const statusText = {
  pending: 'Waiting for approval',
  approved: 'Approved',
  rejected: 'Rejected',
}
