import * as yup from 'yup';
import watcher from './view.js';

const init = () => {
  const initialState = {
    form: {
      status: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const watchedState = watcher(initialState, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');

    const links = watchedState.feeds.map((feed) => feed.url);
    const schema = yup.string().required().url().notOneOf(links);
    schema.validate(data)
      .then(() => {
        watchedState.form.status = 'valid';
      })
      .catch((error) => {
        watchedState.form.status = 'invalid';
        watchedState.form.error = error;
      });
  });
};

export default init;
