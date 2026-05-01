import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { proxy, snapshot } from 'valtio/vanilla'
import { renderText, updateUi } from './render'
import * as yup from 'yup'
import { setLocale } from 'yup'
import i18next from 'i18next'

const i18n = i18next.createInstance();

i18n.init({
  lng: 'ru',
  resources: {
    ru: {
      translation: {
        title: 'RSS агрегатор',
        description: 'Начните читать RSS сегодня. Это легко, это красиво',
        errors: {
          url: 'Ссылка должна быть валидным URL',
          required: 'Не должно быть пустым',
          notOneOf: 'RSS уже существует'
        },
        label: 'Ссылка RSS',
        add: 'Добавить',
        example: 'Пример:',
        exampleLink: 'https://lorem-rss.hexlet.app/feed'
      }
    }
  }
})
  .then(() => {
    initApp()
  })
  .catch((err) => console.log(err))


function initApp() {
  const state = proxy({
    formData: {
      value: '',
      status: 'filling', // 'valid', 'invalid'
      error: null,
      links: []
    }
  })

  // для использования i18n как словаря для отображения текста ошибок
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
  // инициация один раз
  initSetLocale(i18n)

  // валидация поля
  const validate = (state) => {
    const { value, links } = snapshot(state).formData
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
}