import { subscribe } from 'valtio/vanilla'
import { Modal } from 'bootstrap'

const renderText = (i18n) => {
  document.querySelector('[data-name="title"]').textContent = i18n.t('title')
  document.querySelector('[data-name="description"]').textContent = i18n.t('description')
  document.querySelector('[data-name="add-link-label"]').textContent = i18n.t('label')
  document.querySelector('[data-name="add-link-input"]').placeholder = i18n.t('label')
  document.querySelector('[data-name="add-button"]').textContent = i18n.t('add')
  document.querySelector('[data-name="example-text"]').textContent = i18n.t('example')
  document.querySelector('[data-name="example-link"]').textContent = i18n.t('exampleLink')
  document.querySelector('[data-name="read"]').textContent = i18n.t('modal.read')
  document.querySelector('[data-name="close"]').textContent = i18n.t('modal.close')
}

const updateModal = (state, elements) => {
  const { posts } = state.feed
  const { activePostId } = state.userActivity
  const { modal } = elements

  if (activePostId) {
    const postData = posts.find(post => post.id === activePostId)

    const title = modal.querySelector('.modal-title')
    const body = modal.querySelector('.modal-body')
    const readButton = modal.querySelector('[data-name="read"]')

    body.textContent = postData.description
    title.innerHTML = postData.title
    readButton.href = postData.link

    let modalInstance = Modal.getOrCreateInstance(modal)
    modalInstance.show()
  }
}

const updateVisitedPosts = (state, elements) => {
  const { visitedPostIds } = state.userActivity
  const { postsContainer } = elements

  const allPosts = postsContainer.querySelectorAll('[data-name="post-item"]')

  allPosts.forEach((post) => {
    const postId = post.dataset.id
    const isVisited = visitedPostIds.has(postId)
    if (isVisited) {
      const link = post.querySelector('a')
      link.classList.add('fw-normal')
      link.classList.remove('fw-bold')
    }
  })
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
  const item = document.createElement('li')
  const title = document.createElement('h3')
  const link = document.createElement('a')
  const watchButton = document.createElement('button')

  item.dataset.name = 'post-item'
  item.dataset.id = itemState.id
  link.href = itemState.link
  link.textContent = itemState.title
  link.className = 'text-decoration-none fw-bold text-dark link-secondary'
  title.className = 'h5'

  title.append(link)

  watchButton.className = 'btn btn-small border border-dark rounded'
  watchButton.dataset.name = 'watch'
  watchButton.dataset.bsToggle = 'modal'
  watchButton.dataset.bsTarget = '#modal'
  watchButton.textContent = 'Просмотр'

  item.append(title, watchButton)

  return item
}

const createFeedItem = (itemState) => {
  const item = document.createElement('li')
  const title = document.createElement('h3')
  const link = document.createElement('a')
  const description = document.createElement('p')

  link.href = itemState.link
  link.textContent = itemState.title
  link.className = 'text-decoration-none fw-bold text-dark'
  description.textContent = itemState.description

  title.append(link)
  item.append(title, description)

  return item
}

const renderFeeds = (state, i18n) => {
  const feedsContainer = document.querySelector('[data-name="feeds-container"]')
  feedsContainer.innerHTML = ''
  const feedsTitle = document.createElement('h2')
  const list = document.createElement('ul')
  list.dataset.name = 'feeds-list'
  list.className = 'list-unstyled'
  feedsTitle.textContent = i18n.t('feeds')
  feedsTitle.className = 'mb-4'
  feedsContainer.append(feedsTitle, list)

  const { feeds } = state.feed

  feeds.forEach((feed) => {
    const newFeed = createFeedItem(feed)
    newFeed.className = 'mb-3'
    list.append(newFeed)
  })
}

const renderPosts = (state, i18n) => {
  const postsContainer = document.querySelector('[data-name="posts-container"]')
  postsContainer.innerHTML = ''
  const postsTitle = document.createElement('h2')
  const list = document.createElement('ul')
  list.dataset.name = 'posts-list'
  list.className = 'list-unstyled'
  postsTitle.textContent = i18n.t('posts')
  postsTitle.className = 'mb-4'
  postsContainer.append(postsTitle, list)

  const { posts } = state.feed

  posts.forEach((post) => {
    const newPost = createPostItem(post)
    newPost.className = 'd-flex gap-3 justify-content-between align-items-center mb-3'
    list.append(newPost)
  })
}

const renderNewPosts = (state) => {
  const { newPosts } = state.feed
  const postsList = document.querySelector('[data-name="posts-list"]')

  newPosts.forEach((post) => {
    const newPost = createPostItem(post)
    newPost.className = 'd-flex gap-3 justify-content-between align-items-center mb-3'
    postsList.append(newPost)
  })
}

const renderRSS = (state, elements, i18n) => {
  const { status } = state.feed
  const { feedback } = elements

  switch (status) {
    case 'idle':
      feedback.textContent = ''
      break
    case 'loading':
      break
    case 'success':
      renderFeeds(state, i18n)
      renderPosts(state, i18n)
      feedback.textContent = i18n.t('loadingResult.success') // 'RSS успешно загружен'
      break
    case 'failed':
      feedback.textContent = i18n.t('loadingResult.loadingFailed') // 'Ошибка сети'
      break
    case 'parseFailed':
      feedback.textContent = i18n.t('loadingResult.parseFailed') // 'Ресурс не содержит валидный RSS'
      break
    case 'updated':
      renderNewPosts(state)
      break
    default:
      break
  }
}

const updateUi = (state, i18n) => {
  const elements = {
    input: document.querySelector('[data-name="add-link-input"]'),
    form: document.querySelector('[data-name="form"]'),
    feedback: document.querySelector('#feedback'),
    modal: document.getElementById('modal'),
    postsContainer: document.querySelector('[data-name="posts-container"]'),
  }

  renderText(i18n)

  subscribe(state.formData, () => {
    renderForm(state, elements)
  })

  subscribe(state.feed, () => {
    renderRSS(state, elements, i18n)
  })

  subscribe(state.userActivity, () => {
    updateModal(state, elements)
    updateVisitedPosts(state, elements)
  })
}

export { renderText, updateUi }
