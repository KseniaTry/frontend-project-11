import i18next from 'i18next'

export default async () => {
  const i18n = i18next.createInstance();

  await i18n.init({
    lng: 'ru',
    resources: {
      ru: {
        translation: {
          title: 'RSS агрегатор',
          description: 'Начните читать RSS сегодня. Это легко, это красиво',
          errors: {
            url: 'Ссылка должна быть валидным URL',
            empty: 'Не должно быть пустым',
            notOneOf: 'RSS уже существует'
          },
          label: 'Ссылка RSS',
          add: 'Добавить',
          example: 'Пример:',
          exampleLink: 'https://lorem-rss.hexlet.app/feed'
        }
      }
    }
  });

  return i18n;
};
