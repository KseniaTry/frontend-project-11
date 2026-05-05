import { subscribe } from "valtio/vanilla"

const renderText = (i18n) => {
  document.querySelector('[data-name="title"]').textContent = i18n.t('title')
  document.querySelector('[data-name="description"]').textContent = i18n.t('description')
  document.querySelector('[data-name="add-link-label"]').textContent = i18n.t('label')
  document.querySelector('[data-name="add-link-input"]').placeholder = i18n.t('label')
  document.querySelector('[data-name="add-button"]').textContent = i18n.t('add')
  document.querySelector('[data-name="example-text"]').textContent = i18n.t('example')
  document.querySelector('[data-name="example-link"]').textContent = i18n.t('exampleLink')
}

const renderRSSContainer = () => {
  const rssContainer = document.querySelector('[data-name="rss-container"]')

  if (rssContainer) {
    return
  }
  const container = document.createElement('div')
  const row = document.createElement('div')
  const postsCol = document.createElement('div')
  const feedsCol = document.createElement('div')

  container.classList.add('container-fluid', 'p-5')
  container.dataset.name = 'rss-container'
  row.classList.add('row', 'g-3')
  postsCol.classList.add('col-md-8', 'p-2')
  feedsCol.classList.add('col-md-4', 'p-2')

  postsCol.dataset.name = 'posts-container'
  feedsCol.dataset.name = 'feeds-container'

  const app = document.querySelector('#app')

  row.append(postsCol, feedsCol)
  container.append(row)
  app.append(container)
}

const renderForm = (state, elements) => {
  const { status, error } = state.formData
  const { input, feedback, form } = elements

  switch (status) {
    case 'valid':
      input.classList.remove('is-invalid')
      input.classList.add('is-valid')
      feedback.classList.add('text-success')
      feedback.classList.remove('text-danger')
      feedback.textContent = ''
      input.focus()
      form.reset()
      renderRSSContainer()
      break
    case 'invalid':
      input.classList.remove('is-valid')
      input.classList.add('is-invalid')
      feedback.textContent = error
      feedback.classList.add('text-danger')
      feedback.classList.remove('text-success')
      break
    case 'filling':
      // input.focus()
      input.classList.remove('is-invalid')
      input.classList.remove('is-valid')
      feedback.classList.remove('text-danger', 'text-success')
      feedback.textContent = ''
      break
    default: break
  }
}

const createItem = (itemState) => {
  const item = document.createElement('div')
  const title = document.createElement('h3')
  const description = document.createElement('p')
  const link = document.createElement('a')

  link.href = itemState.link
  link.textContent = itemState.title
  description.textContent = itemState.description
  title.append(link)
  item.append(title, description)

  return item
}

const renderFeeds = (state) => {
  const feedsContainer = document.querySelector('[data-name="feeds-container"]')
  feedsContainer.innerHTML = ''
  const feedsTitle = document.createElement('h2')
  feedsTitle.textContent = 'Фиды'
  feedsContainer.append(feedsTitle)

  const { feeds } = state.feed

  feeds.forEach((feed) => {
    const newFeed = createItem(feed)
    newFeed.className = 'border rounded p-3 bg-dark shadow-sm text-white'
    feedsContainer.append(newFeed)
  })
}

const renderPosts = (state) => {
  const postsContainer = document.querySelector('[data-name="posts-container"]')
  postsContainer.innerHTML = ''
  const postsTitle = document.createElement('h2')
  postsTitle.textContent = 'Посты'
  postsContainer.append(postsTitle)

  const { posts } = state.feed

  posts.forEach((post) => {
    const newPost = createItem(post)
    newPost.className = 'd-flex gap-3 border rounded p-3 bg-light shadow-sm'
    postsContainer.append(newPost)
  })
}

const renderRSS = (state, elements) => {
  const { status } = state.feed
  const { feedback, form } = elements

  switch (status) {
    case 'idle':
      break
    case 'loading':
      break
    case 'success':
      feedback.textContent = 'RSS успешно загружен'
      // feedback.classList.replace('text-danger', 'text-success');
      renderFeeds(state)
      renderPosts(state)
      // form.reset()
      break
    case 'failed':
      break
    case 'parseFailed':
      // feedback.classList.replace('text-success', 'text-danger');
      feedback.textContent = 'Ссылка не является RSS'
      break
    default:
      break
  }
}

const updateUi = (state) => {
  const elements = {
    input: document.querySelector('[data-name="add-link-input"]'),
    form: document.querySelector('[data-name="form"]'),
    feedback: document.querySelector('#feedback'),
  }

  subscribe(state, () => {
    renderForm(state, elements)
    renderRSS(state, elements)
  })
}

export { renderText, updateUi }