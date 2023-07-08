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
    case 'ValidationError':
      return error.message;
    case 'AxiosError':
      return 'axiosError';
    default:
      if (error.message === 'ParserError') {
        return 'parserError';
      }

      return 'unknownError';
  }
};

const validation = (url, feedUrls) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(feedUrls);

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
    const { url } = feed;
    const promise = axios.get(createProxy(url))
      .then((response) => {
        const data = parse(response.data.contents);
        const { posts } = data;

        const postsLinks = watchedState.posts.map((post) => post.link);
        const newPosts = posts.filter((newPost) => !postsLinks.includes(newPost.link));

        if (newPosts.length !== 0) {
          newPosts.forEach((newPost) => {
            newPost.id = _.uniqueId();
            newPost.feedId = feed.id;
          });
        } else {
          return;
        }

        watchedState.posts.push(...newPosts);
      })
      .catch((error) => {
        throw new Error(`Error of check update: ${error}`);
      });

    return promise;
  });

  Promise
    .all(promises)
    .finally(() => setTimeout(() => checkUpdate(watchedState, time), time));
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

        const feedUrls = watchedState.feeds.map((feed) => feed.url);

        validation(url, feedUrls)
          .then((error) => {
            if (error) {
              watchedState.form.error = handleError(error);
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

      checkUpdate(watchedState, timeUpdate);
    });
};

export default init;
