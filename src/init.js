import * as yup from 'yup';
import i18next from 'i18next';
import watcher from './view.js';
import ru from './locales/ru.js';

const init = async () => {
  const i18nextInstance = i18next.createInstance();

  await i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

  yup.setLocale({
    mixed: {
      notOneOf: 'alreadyExists',
    },
    string: {
      required: 'empty',
      url: 'invalidUrl',
    },
  });

  const initialState = {
    form: {
      status: 'filling',
      error: null,
    },
    links: [],
    posts: [],
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const watchedState = watcher(initialState, elements, i18nextInstance);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');

    const schema = yup
      .string()
      .trim()
      .required()
      .url()
      .notOneOf(watchedState.links);

    schema.validate(data)
      .then((url) => {
        watchedState.form.status = 'valid';
        watchedState.links.push(url);
      })
      .catch((err) => {
        switch (err.name) {
          case 'ValidationError':
            watchedState.form.errors = err.message;
            watchedState.form.status = 'invalid';
            break;
          default:
            throw new Error(`Unknown err: ${err.name}!`);
        }
      });
  });
};

export default init;
