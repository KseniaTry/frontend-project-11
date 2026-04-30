import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import * as yup from 'yup'
import { proxy, subscribe, snapshot } from 'valtio/vanilla'

let schema = yup.object({
  website: yup
    .string()
    .url('Ссылка должна быть валидным URL')
    .required('Не должно быть пустым')
});

const validate = async (value) => {
  await schema.validate(value)
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
const feedback = document.querySelector('#feedback')

const updateUi = () => {
  const { status, error } = snapshot(state).formData

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
    case 'filling':
      input.focus()
    default: break
  }

}

subscribe(state, updateUi)

input.addEventListener('input', (e) => {
  state.formData.value = e.target.value
  state.formData.status = 'filling'
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  try {
    await validate({ website: state.formData.value })

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

updateUi()
