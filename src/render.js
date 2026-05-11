import { subscribe } from "valtio/vanilla"
import { Modal } from 'bootstrap';

const renderText = (i18n) => {
  document.querySelector('[data-name="title"]').textContent = i18n.t('title')
  document.querySelector('[data-name="description"]').textContent = i18n.t('description')
  document.querySelector('[data-name="add-link-label"]').textContent = i18n.t('label')
  document.querySelector('[data-name="add-link-input"]').placeholder = i18n.t('label')
  document.querySelector('[data-name="add-button"]').textContent = i18n.t('add')
  document.querySelector('[data-name="example-text"]').textContent = i18n.t('example')
  document.querySelector('[data-name="example-link"]').textContent = i18n.t('exampleLink')
}

const updateModal = (state, elements) => {
  const { posts } = state.feed
  const { activePostId } = state.userActivity
  const { modal } = elements

  if (activePostId) {
    const postData = posts.find((post) => post.id === activePostId)

    const title = modal.querySelector('.modal-title')
    const body = modal.querySelector('.modal-body')
    const readButton = modal.querySelector('[data-name="read"]')

    body.textContent = postData.description
    title.innerHTML = postData.title
    readButton.href = postData.link

    let modalInstance = Modal.getOrCreateInstance(modal)
    modalInstance.show();
  }
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

const createPostItem = (itemState) => {
  const item = document.createElement('div')
  const title = document.createElement('h3')
  const link = document.createElement('a')
  const watchButton = document.createElement('button')

  item.dataset.id = itemState.id
  link.href = itemState.link
  link.textContent = itemState.title
  link.className = 'text-decoration-none fw-bold text-dark'

  title.append(link)

  watchButton.className = 'btn btn-small border border-dark rounded p-3'
  watchButton.dataset.name = 'watch'
  watchButton.dataset.bsToggle = 'modal'
  watchButton.dataset.bsTarget = '#exampleModal'
  watchButton.textContent = 'Просмотр'

  item.append(title, watchButton)

  return item
}

const createFeedItem = (itemState) => {
  const item = document.createElement('div')
  const title = document.createElement('h3')
  const link = document.createElement('a')

  link.href = itemState.link
  link.textContent = itemState.title
  link.className = 'text-decoration-none fw-bold text-dark'

  title.append(link)
  item.append(title)

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
    const newFeed = createFeedItem(feed)
    newFeed.className = 'mb-3'
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
    const newPost = createPostItem(post)
    newPost.className = 'd-flex gap-3 justify-content-between align-items-center mb-3'
    postsContainer.append(newPost)
  })
}

const renderNewPosts = (state) => {
  const { newPosts } = state.feed
  const postsContainer = document.querySelector('[data-name="posts-container"]')

  newPosts.forEach((post) => {
    const newPost = createPostItem(post)
    newPost.className = 'd-flex gap-3 justify-content-between align-items-center mb-3'
    postsContainer.append(newPost)
  })
}

const renderRSS = (state, elements) => {
  const { status } = state.feed
  const { feedback } = elements

  switch (status) {
    case 'idle':
      break
    case 'loading':
      break
    case 'success':
      renderFeeds(state)
      renderPosts(state)
      feedback.textContent = 'RSS успешно загружен'
      break
    case 'failed':
      feedback.textContent = 'Ошибка сети'
      break
    case 'parseFailed':
      feedback.textContent = 'Ссылка не является RSS'
      break
    case 'updated':
      renderNewPosts(state)
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
    modal: document.getElementById('exampleModal')
  }

  subscribe(state.formData, () => {
    renderForm(state, elements)
  })

  subscribe(state.feed, () => {
    renderRSS(state, elements)
  })

  subscribe(state.userActivity, () => {
    updateModal(state, elements)
  })
}

export { renderText, updateUi }