import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { proxy, snapshot } from 'valtio/vanilla'
import { renderText, updateUi } from './render'
import * as yup from 'yup'
import { setLocale } from 'yup'
import i18next from 'i18next'
import axios from 'axios'
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
        exampleLink: 'https://lorem-rss.hexlet.app/feed',
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
      status: 'filling', // 'valid', 'invalid', 'updating', 'finished'
      error: null,
      links: [],
    },
    feed: {
      feeds: [],
      posts: [],
      isUpdated: false
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
    //   // https://lorem-rss.hexlet.app/feed?unit=second&interval=30
    //   checkUpdates(link)
    // })

    checkUpdates('https://lorem-rss.hexlet.app/feed?unit=second&interval=30')
  })

  updateUi(state)
  renderText(i18n)


  const getAllOriginsLink = (link) => {
    const normalized = encodeURIComponent(link)
    return `https://allorigins.hexlet.app/get?disableCache=true&url=${normalized}`
  }

  const parseXMLtoDOM = (xml) => {
    const parser = new DOMParser()
    const result = parser.parseFromString(xml, 'application/xml')

    // Проверка на ошибку парсинга
    const error = result.querySelector('parsererror')
    if (error) {
      throw new Error('parseError')
    }

    return result
  }

  function checkUpdates(link) {
    const modifiedLink = getAllOriginsLink(link)

    axios
      .get(modifiedLink)
      .then(response => {
        const xml = response.data.contents.trim()
        return parseXMLtoDOM(xml)
      })
      .then(dom => {
        addPostsToState(dom, state)
        state.feed.isUpdated = true
        console.log(state.feed.isUpdated)
      })
      .then(() => state.feed.isUpdated = false)
      .catch(err => console.error('Что-то пошло не так:', err))

    console.log(state.feed.isUpdated)
    setTimeout(checkUpdates, 5000, link)
  }

  function addPostsToState(domEl, state) {
    const { feeds } = state.feed

    // обновляет данные из стейта (feeds posts)
    const updateData = (domEl, id, data) => {
      const link = domEl.querySelector('link').textContent
      const isLinkExist = data.some((item) => item.link === link);

      if (!isLinkExist) {
        const newItem = {
          id,
          link,
          title: domEl.querySelector('title')?.textContent,
          description: domEl.querySelector('description')?.textContent,
          pubDate: domEl.querySelector('pubDate')?.textContent,
        };
        return [...data, newItem]
      }

      return data
    }

    const id = nanoid()
    // обновляем фиды
    const newFeeds = updateData(domEl, id, feeds)
    state.feed.feeds = newFeeds

    // обновляем посты
    const items = domEl.querySelectorAll('item')

    items.forEach((item) => {
      const { posts } = state.feed
      const newPosts = updateData(item, id, posts)
      state.feed.posts = newPosts
    })
  }
}