import * as yup from 'yup';
import i18next from 'i18next';
import watcher from './view.js';
import ru from './locales/ru.js';
import { handleError, getData, checkUpdate } from './utils.js';

const init = async () => {
  const time = 5000;

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

    loadingData: {
      status: 'waiting',
      error: null,
    },

    links: [],
    posts: [],
    feeds: [],

    uiState: {
      postId: null,
      visitedPostsId: [],
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
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
        return getData(url, watchedState);
      })
      .catch((err) => {
        handleError(watchedState, err);
      });
  });

  elements.posts.addEventListener('click', (e) => {
    watchedState.uiState.postId = e.target.dataset.id;
    watchedState.uiState.visitedPostsId.push(e.target.dataset.id);
  });

  checkUpdate(watchedState, time);
};

export default init;
