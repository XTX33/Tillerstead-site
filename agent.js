/**
 * SEO: Form tracking surfaces engagement metrics that guide targeted local content updates.
 * Accessibility: Validation focuses on required fields so assistive tech announces issues clearly.
 * Performance: Lightweight, modular functions avoid blocking the main thread and enable offline caching via a Service Worker.
 * Safety: Uses only browser-native APIs and posts analytics to a stub endpoint without storing credentials.
 */
(() => {
  const analyticsUrl = 'https://analytics.example.com/collect'
  const state = { initialized: false }

  const serializeForm = (formEl) => {
    const data = {}
    Array.from(formEl.elements).forEach((field) => {
      if (field.name && !field.disabled && field.type !== 'submit') {
        data[field.name] = field.value.trim()
      }
    })
    return data
  }

  const setFeedback = (formEl, message, isError = false) => {
    const feedback = formEl.querySelector('[data-agent-feedback]')
    if (feedback) {
      feedback.textContent = message
      feedback.dataset.state = isError ? 'error' : 'success'
    }
  }

  const validateForm = (formEl) => {
    let isValid = true
    let firstInvalid = null
    Array.from(formEl.elements).forEach((field) => {
      if (field.required && !field.value.trim()) {
        isValid = false
        if (!firstInvalid) {
          firstInvalid = field
        }
      }
    })
    if (firstInvalid) {
      firstInvalid.focus()
      setFeedback(formEl, 'Please complete all required fields.', true)
    }
    return isValid
  }

  const track = (event, payload = {}) => {
    const body = JSON.stringify({
      event,
      payload,
      timestamp: new Date().toISOString()
    })

    return fetch(analyticsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'omit',
      cache: 'no-store'
    }).catch(() => {})
  }

  const registerSW = () => {
    if (!('serviceWorker' in navigator)) {
      return
    }
    const swUrl = new URL('agent-sw.js', window.location.href)
    navigator.serviceWorker.register(swUrl.href).catch(() => {})
  }

  const bindForm = () => {
    const form = document.querySelector('[data-agent-form]')
    if (!form) {
      return
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      if (!validateForm(form)) {
        return
      }
      const payload = serializeForm(form)
      track('consultation_request', payload)
      setFeedback(form, 'Thanks! We will reach out within one business day.')
      form.reset()
    })
  }

  const init = () => {
    if (state.initialized) {
      return
    }
    state.initialized = true
    bindForm()
  }

  window.NJContractorAgent = {
    init,
    track,
    validateForm,
    registerSW
  }
})()
