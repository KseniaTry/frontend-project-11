import { subscribe } from "valtio/vanilla"

export default (state) => {
  const updateUi = () => {
    const input = document.querySelector('[data-name="link-input"]')
    const form = document.querySelector('[data-name="form"]')
    const feedback = document.querySelector('#feedback')

    const { status, error } = state.formData

    switch (status) {
      case 'valid':
        input.classList.remove('is-invalid')
        input.classList.add('is-valid')
        feedback.textContent = ''
        break
      case 'invalid':
        input.classList.remove('is-valid')
        input.classList.add('is-invalid')
        feedback.textContent = error
        break
      case 'added':
        input.classList.remove('is-valid')
        input.focus()
        form.reset()
        break
      case 'filling':
        input.focus()
        break
      default: break
    }
  }

  subscribe(state, updateUi)
}