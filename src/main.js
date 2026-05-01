import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { proxy, snapshot } from 'valtio/vanilla'
import updateUi from './render'
import * as yup from 'yup'
import { setLocale } from 'yup'
import initI18n from './texts'

const state = proxy({
  formData: {
    value: '',
    status: 'filling', // 'added', 'valid', 'invalid' чтобы при исходном состоянии было поле серое а не красное / зеленое
    error: null,
    links: []
  }
})

const initSetLocale = (i18n) => {
  setLocale({
    string: {
      url: () => i18n.t('errors.url'),
      required: () => i18n.t('errors.required'),
      notOneOf: () => i18n.t('errors.notOneOf')
    }
  })
}

const validate = async (state) => {
  const i18n = await initI18n()
  initSetLocale(i18n)
  const { value, links } = state.formData

  const schema = yup.string().url().required().notOneOf(links)

  await schema.validate(value, links, { abortEarly: false })
    .then(() => {
      state.formData.error = null
      state.formData.status = 'valid'
    })
    .catch((err) => {
      state.formData.error = err.message
      state.formData.status = 'invalid'
    })
}

const input = document.querySelector('[data-name="link-input"]')
const form = document.querySelector('[data-name="form"]')

input.addEventListener('input', (e) => {
  state.formData.value = e.target.value
  state.formData.status = 'filling'
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  try {
    await validate(state)

    const { status, value } = snapshot(state).formData

    if (status === 'valid') {
      state.formData.links.push(value)
      state.formData.status = 'added'
      console.log(state.formData.links)
    }
  } catch (err) {
    console.log(err)
  }
})

updateUi(state)
