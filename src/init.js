import * as yup from 'yup';
import watcher from './view.js';

const init = () => {
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

  const watchedState = watcher(initialState, elements);

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
      .catch(() => {
        watchedState.form.status = 'invalid';
      });
  });
};

export default init;
