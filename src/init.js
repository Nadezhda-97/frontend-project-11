import * as yup from 'yup';
import i18next from 'i18next';
import watcher from './view.js';
import ru from './locales/ru.js';
import sortedErrors from './locales/sortedErrors.js';
import { handleError, getData, checkUpdate } from './utils.js';

const time = 5000;

const validate = (value, feedLinks, watchedState) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(feedLinks);

  schema.validate(value)
    .then((url) => {
      watchedState.form.status = 'valid';
      return getData(url, watchedState);
    })
    .catch((err) => {
      handleError(watchedState, err);
    });
};

const init = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then(() => {
      yup.setLocale(sortedErrors);

      const initialState = {
        form: {
          status: 'filling',
          error: null,
        },

        loadingData: {
          status: 'waiting',
          error: null,
        },

        posts: [],
        feeds: [],

        uiState: {
          postId: null,
          visitedPostsId: new Set(),
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
        const uncheckedValue = formData.get('url');

        const feedLinks = watchedState.feeds.map((feed) => feed.link);
        validate(uncheckedValue, feedLinks, watchedState);
      });

      elements.posts.addEventListener('click', (e) => {
        watchedState.uiState.postId = e.target.dataset.id;
        watchedState.uiState.visitedPostsId.add(e.target.dataset.id);
      });

      checkUpdate(watchedState, time);
    });
};

export default init;
