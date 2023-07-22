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
      return 'networkError';
    case 'ParserError':
      return 'invalidRSS';
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
  watchedState.loadingData = { status: 'loading', error: null };

  return axios({
    method: 'get',
    url: createProxy(url),
    timeout: timeWaiting,
  })
    .then((response) => {
      const { feed, posts } = parse(response.data.contents);
      feed.url = url;
      feed.id = _.uniqueId();

      posts.forEach((post) => {
        post.id = _.uniqueId();
        post.feedId = feed.id;
      });

      watchedState.loadingData = { status: 'success', error: null };
      watchedState.feeds.push(feed);
      watchedState.posts.push(...posts);
    })
    .catch((error) => {
      watchedState.loadingData = { status: 'failed', error: handleError(error) };
    });
};

const checkUpdate = (watchedState, time) => {
  const promises = watchedState.feeds.map((feed) => {
    const { url, id } = feed;
    return axios.get(createProxy(url))
      .then((response) => {
        const { posts } = parse(response.data.contents);

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
  });

  return Promise
    .all(promises)
    .then(() => setTimeout(() => checkUpdate(watchedState, time), time));
};

const init = () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      yup.setLocale(customMessages);

      const initialState = {
        form: {
          isValid: null,
          error: null,
        },

        loadingData: {
          status: 'filling',
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
        submit: document.querySelector('[type="submit"]'),
        feedback: document.querySelector('.feedback'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
      };

      const watchedState = watcher(initialState, elements, i18nInstance);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');

        const urls = watchedState.feeds.map((feed) => feed.url);

        validation(url, urls)
          .then((error) => {
            if (error) {
              watchedState.form = { isValid: false, error: error.message };
              return;
            }

            watchedState.form = { isValid: true, error: null };
            loadData(url, watchedState);
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) {
          return;
        }

        watchedState.uiState.postId = id;
        watchedState.uiState.visitedPostsId.add(id);
      });

      setTimeout(() => checkUpdate(watchedState, timeUpdate), timeUpdate);
    });
};

export default init;
