import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

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

  const watchedState = onChange(initialState, render(initialState, elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');

    const urls = watchedState.links.map((link) => link.url);
    const schema = yup.string().required().url().notOneOf(urls);
    schema.validate(data)
      .then((url) => {
        watchedState.form.status = 'valid';
        watchedState.links.push(url);
      })
      .catch((error) => {
        watchedState.form.status = 'invalid';
        watchedState.form.error = error.message;
      });
  });
};

export default init;
