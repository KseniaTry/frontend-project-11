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
        loadingResult: {
          success: 'RSS успешно загружен',
          parseFailed: 'Ссылка не является RSS',
          loadingFailed: 'Ошибка загрузки RSS ленты'
        }
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
      posts: [],
      status: 'idle', // 'loading', 'success', 'failed', 'parseFailed'
      timers: {}
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
  updateUi(state)
  renderText(i18n)

  // валидация поля
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
    state.feed.status = 'idle'
    console.log('click')
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const { value } = state.formData

    // get form data использовать!!
    validate(state)
      .then(() => {
        state.formData.links.push(value)
        state.formData.status = 'valid'
        state.formData.value = '';
        state.formData.error = null
        console.log('vakid')
      })
      .then(() => {
        checkUpdates(value) // проверяем обновления только новой добавленной ссылки
        state.feed.status = 'success'
        state.formData.status = 'valid'
      })
      .catch((err) => {
        state.formData.error = err.message
        state.formData.status = 'invalid'
        console.log('invalid')
      })

    // checkUpdates('https://lorem-rss.hexlet.app/feed?unit=second&interval=30')
  })

  const getAllOriginsLink = (link) => {
    const normalized = encodeURIComponent(link)
    return `https://allorigins.hexlet.app/get?disableCache=true&url=${normalized}`
  }

  const parseXMLtoDOM = (xml) => {
    const parser = new DOMParser()
    const result = parser.parseFromString(xml, 'application/xml')
    console.log('parse')
    // Проверка на ошибку парсинга
    const error = result.querySelector('parsererror')
    if (error) {
      state.feed.status = 'parseFailed'
      state.formData.status = 'invalid'
      console.log(state.feed.status)
      throw new Error('parseError')
    }

    return result
  }


  function stopUpdates(link) {
    const id = state.feed.timers[link];
    if (id) {
      clearTimeout(id);
      delete state.feed.timers[link];
      // console.log(`Обновления для ${link} остановлены`);
    }
  }

  function checkUpdates(link) {
    const modifiedLink = getAllOriginsLink(link)
    console.log('check')

    clearTimeout(state.feed.timers[link])

    axios
      .get(modifiedLink)
      .then(response => {
        const xml = response.data.contents.trim()
        return parseXMLtoDOM(xml)
      })
      .then(dom => {
        console.log('add posts')
        addPostsToState(dom, state)
      })
      .catch(err => {
        console.error('Что-то пошло не так:', err)
        stopUpdates(link)
      }
      )

    const timerId = setTimeout(checkUpdates, 5000, link)
    state.feed.timers[link] = timerId;
    console.log(timerId)
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