const resources = {
  ru: {
    translation: {
      title: 'RSS агрегатор',
      description: 'Начните читать RSS сегодня. Это легко, это красиво',
      errors: {
        url: 'Ссылка должна быть валидным URL',
        required: 'Не должно быть пустым',
        notOneOf: 'RSS уже существует',
      },
      label: 'Ссылка RSS',
      add: 'Добавить',
      example: 'Пример:',
      exampleLink: 'https://lorem-rss.hexlet.app/feed',
      feeds: 'Фиды',
      posts: 'Посты',
      loadingResult: {
        success: 'RSS успешно загружен',
        parseFailed: 'Ресурс не содержит валидный RSS',
        loadingFailed: 'Ошибка сети',
      },
      modal: {
        read: 'Читать полностью',
        close: 'Закрыть',
      }
    },
  },
}

export { resources }

