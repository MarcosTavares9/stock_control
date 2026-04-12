export function isAbortError(error: unknown): boolean {
  if (!error) return false
  if (error instanceof DOMException && error.name === 'AbortError') return true

  const anyErr = error as { name?: unknown; code?: unknown } | null
  return anyErr?.name === 'AbortError' || anyErr?.code === 'ERR_CANCELED'
}

