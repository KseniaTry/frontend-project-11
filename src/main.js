import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { proxy, snapshot } from 'valtio/vanilla'
import { renderText, updateUi } from './render'
import * as yup from 'yup'
import { setLocale } from 'yup'
import initI18n from './texts'

const state = proxy({
  formData: {
    value: '',
    status: 'filling', // 'valid', 'invalid' чтобы при исходном состоянии было поле серое а не красное / зеленое
    error: null,
    links: []
  }
})

const initSetLocale = (i18n) => {
  setLocale({
    mixed: {
      required: () => i18n.t('errors.required'),
      notOneOf: () => i18n.t('errors.notOneOf')
    },
    string: {
      url: () => i18n.t('errors.url')
    }
  })
}

const i18n = await initI18n()
initSetLocale(i18n)

const validate = (state) => {
  const { value, links } = state.formData
  const schema = yup.string().url().required().notOneOf(links)
  return schema.validate(value)
}

const input = document.querySelector('[data-name="add-link-input"]')
const form = document.querySelector('[data-name="form"]')

input.addEventListener('input', (e) => {
  state.formData.value = e.target.value
  state.formData.status = 'filling'
})

form.addEventListener('submit', (e) => {
  e.preventDefault()

  validate(state)
    .then(() => {
      const { value } = state.formData
      state.formData.links.push(value)
      state.formData.status = 'valid'
      state.formData.value = '';
      state.formData.error = null
    })
    .catch((err) => {
      initSetLocale(i18n)
      state.formData.error = err.message
      state.formData.status = 'invalid'
    })
})

updateUi(state)
renderText(i18n)