function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function log(level, event, fields = {}) {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  }

  const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info'
  console[method](`[observability] ${event}`, payload)
}

export async function observeApiCall(name, call) {
  const startedAt = now()
  log('info', 'api_call_started', { name })

  try {
    const response = await call()
    const durationMs = Math.round(now() - startedAt)
    log('info', 'api_call_finished', {
      name,
      duration_ms: durationMs,
      status: response?.status,
      request_id: response?.headers?.['x-request-id'],
      backend_duration_ms: response?.headers?.['x-response-time-ms'],
    })
    return response
  } catch (error) {
    const durationMs = Math.round(now() - startedAt)
    log('error', 'api_call_failed', {
      name,
      duration_ms: durationMs,
      status: error?.response?.status,
      request_id: error?.response?.headers?.['x-request-id'],
      message: error?.message,
    })
    throw error
  }
}

export function installBrowserObservability() {
  window.addEventListener('error', event => {
    log('error', 'browser_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', event => {
    log('error', 'unhandled_rejection', {
      reason: event.reason?.message || String(event.reason),
    })
  })
}
