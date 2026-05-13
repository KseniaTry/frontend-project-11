import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { proxy, snapshot } from 'valtio/vanilla'
import { updateUi } from './render'
import * as yup from 'yup'
import { setLocale } from 'yup'
import i18next from 'i18next'
import axios from 'axios'
import { nanoid } from 'nanoid'
import { resources } from './resources'

const renderInitError = (err) => {
  const feedback = document.getElementById('feedback')

  if (feedback) {
    feedback.classList.remove('text-success')
    feedback.classList.add('text-danger')
    feedback.textContent = 'Ошибка инициализации приложения. Пожалуйста, перезагрузите страницу'
  }

  throw err
}

function initApp() {
  const i18n = i18next.createInstance()

  i18n.init({
    lng: 'ru',
    resources: resources,
  })
    .then(() => {
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
          status: 'idle', // 'loading', 'success', 'failed', 'parseFailed', 'updated'
          timers: {},
          newPosts: [],
        },
        userActivity: {
          visitedPostIds: new Set(),
          activePostId: '',
        },
      })

      // для использования i18n как словаря для отображения текста ошибок
      const initSetLocale = (i18n) => {
        setLocale({
          mixed: {
            required: () => i18n.t('errors.required'),
            notOneOf: () => i18n.t('errors.notOneOf'),
          },
          string: {
            url: () => i18n.t('errors.url'),
          },
        })
      }
      // инициация один раз
      initSetLocale(i18n)
      updateUi(state, i18n)

      // валидация поля
      const validate = (state) => {
        const { value, links } = state.formData
        const schema = yup.string().url().required().notOneOf(links)
        return schema.validate(value)
      }

      // обработчики
      const input = document.querySelector('[data-name="add-link-input"]')
      const form = document.querySelector('[data-name="form"]')
      const postsContainer = document.querySelector('[data-name="posts-container"]')

      input.addEventListener('input', (e) => {
        const value = e.target.value
        state.formData.value = value
        state.formData.status = 'filling'
        state.feed.status = 'idle'
      })

      postsContainer.addEventListener('click', (e) => {
        const targetDatasetName = e.target.dataset.name

        if (targetDatasetName === 'watch') {
          const post = e.target.closest('li')
          const postId = post.dataset.id
          state.userActivity.visitedPostIds.add(postId)
          state.userActivity.activePostId = postId
        }
      })

      form.addEventListener('submit', (e) => {
        e.preventDefault()
        const { value } = state.formData

        // get form data использовать!!
        validate(state)
          .then(() => {
            // console.log('1. Валидация пройдена');
            state.formData.links.push(value)
            state.formData.status = 'valid'
            state.formData.value = ''
            state.formData.error = null
            return getData(value)
          })
          .then(() => {
            // console.log('2. Данные получены');
            checkUpdates(value, state)
          })
          .catch((err) => {
            // console.log('3. Ошибка поймана:', err.message);
            state.formData.error = err.message
            state.formData.status = 'invalid'
          })
      })

      // парсинг
      const getAllOriginsLink = (link) => {
        const normalized = encodeURIComponent(link)
        return `https://allorigins.hexlet.app/get?disableCache=true&url=${normalized}`
      }

      const parseXMLtoDOM = (xml) => {
        const parser = new DOMParser()
        const result = parser.parseFromString(xml, 'application/xml')

        // Проверка на ошибку парсинга
        const err = result.querySelector('parsererror')
        if (err) {
          throw new Error('parseError')
        }

        return result
      }

      function stopUpdates(link) {
        const id = state.feed.timers[link]
        if (id) {
          clearTimeout(id)
          delete state.feed.timers[link]
        }
      }

      // добавляем фиды и посты в стейт если была добавлена новая ссылка
      function getData(link) {
        const modifiedLink = getAllOriginsLink(link)

        return axios
          .get(modifiedLink)
          .then((response) => {
            const xml = response.data.contents.trim()
            return parseXMLtoDOM(xml)
          })
          .then((dom) => {
            addDataToState(dom) // добавляем фиды и посты в стейт (так как добавлена новая ссылка)
            state.formData.status = 'valid'
            state.feed.status = 'success'
          })
          .catch((err) => {
            if (err.message === 'parseError') {
              state.feed.status = 'parseFailed'
            }
            else {
              state.feed.status = 'failed'
            }

            state.formData.status = 'invalid'
          })
      }

      // проверяем обновление каждые 5 сек
      function checkUpdates(link, state) {
        const modifiedLink = getAllOriginsLink(link)
        clearTimeout(state.feed.timers[link])

        axios
          .get(modifiedLink)
          .then((response) => {
            const xml = response.data.contents.trim()
            return parseXMLtoDOM(xml)
          })
          .then((dom) => {
            const { posts } = snapshot(state.feed)
            return updatePosts(dom, state, posts)
          })
          .then(() => {
            const { newPosts } = state.feed
            if (newPosts.length !== 0) {
              state.feed.status = 'updated'
            }
          })
          .catch((err) => {
            if (err.message === 'parseError') {
              state.feed.status = 'parseFailed'
            }
            else {
              state.feed.status = 'failed'
            }
            state.formData.status = 'invalid'
            stopUpdates(link)
          })
          .finally(() => {
            const timerId = setTimeout(() => checkUpdates(link, state), 5000)
            state.feed.timers[link] = timerId
          })
      }

      // добавление фидов и постов в стейт (первоначально при добавлении новой ссылки в поток)
      function addDataToState(domEl) {
        const id = nanoid()
        const newFeed = {
          id,
          link: domEl.querySelector('link')?.textContent,
          title: domEl.querySelector('title')?.textContent,
          description: domEl.querySelector('description')?.textContent,
          pubDate: domEl.querySelector('pubDate')?.textContent,
        }

        state.feed.feeds.push(newFeed)

        const posts = domEl.querySelectorAll('item')
        posts.forEach((post) => {
          const newPost = {
            id: nanoid(),
            feedId: id,
            link: post.querySelector('link')?.textContent,
            title: post.querySelector('title')?.textContent,
            description: post.querySelector('description')?.textContent,
            pubDate: post.querySelector('pubDate')?.textContent,
          }
          state.feed.posts.push(newPost)
        })
      }

      // обновление постов существующей ленты с периодичностью 5 сек
      function updatePosts(domEl, state, oldPosts) {
        const { feeds } = state.feed
        const feedLink = domEl.querySelector('link').textContent
        const items = domEl.querySelectorAll('item')
        const feedId = feeds.find(feed => feed.link === feedLink).id

        items.forEach((item) => {
          const link = item.querySelector('link')?.textContent
          const isLinkExist = oldPosts.some(oldPost => oldPost.link === link)

          if (!isLinkExist) {
            const newPost = {
              id: nanoid(),
              feedId: feedId,
              link,
              title: item.querySelector('title')?.textContent,
              description: item.querySelector('description')?.textContent,
              pubDate: item.querySelector('pubDate')?.textContent,
            }

            state.feed.newPosts.push(newPost)
            state.feed.posts.push(newPost)
          }
        })
      }
    })
    .catch(err => renderInitError(err))
}

initApp()
