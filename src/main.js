import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { proxy, snapshot } from 'valtio/vanilla'
import { renderText, updateUi } from './render'
import * as yup from 'yup'
import { setLocale } from 'yup'
import i18next from 'i18next'
import axios from 'axios'
import { renderRSS } from './render'
import { nanoid } from 'nanoid'

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
      links: [],
    },
    feed: {
      feeds: [],
      posts: []
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
    const { value, links } = state.formData
    // get form data использовать!!
    validate(state)
      .then(() => {
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

    // links.forEach((link) => {
    //   getUpdates(link)

    // })

    const k = getUpdates('https://lorem-rss.hexlet.app/feed')
  })

  updateUi(state)
  renderText(i18n)

  const getAllOriginsLink = (link) => {
    const normalized = encodeURIComponent(link)
    return `https://allorigins.hexlet.app/get?disableCache=true&url=${normalized}`
  }

  const parseXMLtoDOM = (xml) => {
    const parser = new DOMParser()
    const result = parser.parseFromString(xml, 'application/xml');
    return result
  }

  function getUpdates(link) {
    const modifiedLink = getAllOriginsLink(link)

    axios
      .get(modifiedLink)
      .then(response => {
        const xml = response.data.contents.trim()
        return parseXMLtoDOM(xml)
      })
      .then(dom => {
        addPostsToState(dom)
        console.log(dom)
        console.log(state.feed)
        renderRSS(state)
      })
      .catch(err => console.error('Что-то пошло не так:', err))
  }

  function addPostsToState(domEl) {
    const getData = (domEl, id) => {
      const title = domEl.querySelector('title').textContent
      const description = domEl.querySelector('description').textContent
      const link = domEl.querySelector('link').textContent
      const pubDate = domEl.querySelector('pubDate').textContent

      return {
        id,
        title,
        description,
        link,
        pubDate
      }
    }
    const id = nanoid()
    const newFeed = getData(domEl, id)
    state.feed.feeds.push(newFeed)

    const items = domEl.querySelectorAll('item')
    items.forEach((item) => {
      const newPost = getData(item, id)
      state.feed.posts.push(newPost)
    })
  }
}