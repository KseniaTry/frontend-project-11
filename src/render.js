import { subscribe } from "valtio/vanilla"

const renderText = (i18n) => {
  document.querySelector('[data-name="title"]').textContent = i18n.t('title')
  document.querySelector('[data-name="description"]').textContent = i18n.t('description')
  document.querySelector('[data-name="add-link-label"]').textContent = i18n.t('label')
  document.querySelector('[data-name="add-link-input"]').placeholder = i18n.t('label')
  document.querySelector('[data-name="add-button"]').textContent = i18n.t('add')
  document.querySelector('[data-name="example-text"]').textContent = i18n.t('example')
  document.querySelector('[data-name="example-link"]').textContent = i18n.t('exampleLink')
}

const updateUi = (state) => {
  const updateUi = () => {
    const input = document.querySelector('[data-name="add-link-input"]')
    const form = document.querySelector('[data-name="form"]')
    const feedback = document.querySelector('#feedback')

    const { status, error } = state.formData

    switch (status) {
      case 'valid':
        input.classList.remove('is-invalid')
        // input.classList.add('is-valid')
        feedback.textContent = ''
        input.focus()
        form.reset()
        break
      case 'invalid':
        input.classList.remove('is-valid')
        input.classList.add('is-invalid')
        feedback.textContent = error
        break
      case 'filling':
        input.focus()
        break
      default: break
    }
  }

  subscribe(state, updateUi)
}

export { renderText, updateUi }