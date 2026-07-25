export function formatTimestamp(date) {
  if (!(date instanceof Date)) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
}