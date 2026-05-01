import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import * as yup from 'yup'
import { proxy, snapshot } from 'valtio/vanilla'
import updateUi from './render'

const validate = async (value, links) => {
  const schema = yup.string()
    .url('Ссылка должна быть валидным URL')
    .required('Не должно быть пустым')
    .notOneOf(links, 'RSS уже существует')

  await schema.validate(value, links)
    .then(() => {
      state.formData.error = null
      state.formData.status = 'valid'
    })
    .catch((err) => {
      state.formData.error = err.message
      state.formData.status = 'invalid'
    })
}

const state = proxy({
  formData: {
    value: '',
    status: 'filling', // 'added', 'valid', 'invalid' чтобы при исходном состоянии было поле серое а не красное / зеленое
    error: null,
    links: []
  }
})

const input = document.querySelector('[data-name="link-input"]')
const form = document.querySelector('[data-name="form"]')

input.addEventListener('input', (e) => {
  state.formData.value = e.target.value
  state.formData.status = 'filling'
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  try {
    await validate(state.formData.value, state.formData.links)
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
