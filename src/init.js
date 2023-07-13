import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';

import parse from './parse.js';
import watcher from './view.js';
import resources from './locales/locale.js';
import customMessages from './locales/customMessages.js';

const timeUpdate = 5000;
const timeWaiting = 10000;

const createProxy = (url) => {
  const proxy = new URL('/get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);
  return proxy.toString();
};

const handleError = (error) => {
  switch (error.name) {
    case 'AxiosError':
      return 'axiosError';
    case 'ParserError':
      return 'parserError';
    default:
      return 'unknownError';
  }
};

const validation = (url, urls) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(urls);

  return schema.validate(url)
    .then(() => null)
    .catch((error) => error);
};

const loadData = (url, watchedState) => {
  watchedState.loadingData.status = 'loading';
  watchedState.loadingData.error = null;

  const data = axios({
    method: 'get',
    url: createProxy(url),
    timeout: timeWaiting,
  })
    .then((response) => {
      const parsedRss = parse(response.data.contents);
      const { feed, posts } = parsedRss;
      feed.url = url;
      feed.id = _.uniqueId();

      posts.forEach((post) => {
        post.id = _.uniqueId();
        post.feedId = feed.id;
      });

      watchedState.loadingData.status = 'success';
      watchedState.loadingData.error = null;

      watchedState.feeds.push(feed);
      watchedState.posts.push(...posts);
    })
    .catch((error) => {
      watchedState.loadingData.error = handleError(error);
      watchedState.loadingData.status = 'failed';
    });

  return data;
};

const checkUpdate = (watchedState, time) => {
  const promises = watchedState.feeds.map((feed) => {
    const { url, id } = feed;
    const promise = axios.get(createProxy(url))
      .then((response) => {
        const data = parse(response.data.contents);
        const { posts } = data;

        const postsLinks = watchedState.posts.map((post) => post.link);
        const newPosts = posts.filter((post) => !postsLinks.includes(post.link));

        newPosts.forEach((newPost) => {
          newPost.id = _.uniqueId();
          newPost.feedId = id;
        });

        watchedState.posts.push(...newPosts);
      })
      .catch((error) => {
        console.log(error);
      });

    return promise;
  });

  return Promise
    .all(promises)
    .then(() => setTimeout(() => checkUpdate(watchedState, time), time));
};

const init = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      yup.setLocale(customMessages);

      const initialState = {
        form: {
          status: '',
          error: null,
        },

        loadingData: {
          status: '',
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
        const url = formData.get('url');

        const urls = watchedState.feeds.map((feed) => feed.url);

        validation(url, urls)
          .then((error) => {
            if (error) {
              watchedState.form.error = error.message;
              watchedState.form.status = 'invalid';
              return;
            }

            watchedState.form.status = 'valid';
            watchedState.form.error = null;
            loadData(url, watchedState);
          });
      });

      elements.posts.addEventListener('click', (e) => {
        watchedState.uiState.postId = e.target.dataset.id;
        watchedState.uiState.visitedPostsId.add(e.target.dataset.id);
      });

      setTimeout(() => checkUpdate(watchedState, timeUpdate), timeUpdate);
    });
};

export default init;
