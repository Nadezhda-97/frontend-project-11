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
  const newUrl = new URL(url);
  return `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(newUrl)}`;
};

const handleError = (watchedState, error) => {
  switch (error.name) {
    case 'AxiosError':
      watchedState.loadingData.error = 'axiosError';
      watchedState.loadingData.status = 'failed';
      watchedState.form.status = '';
      watchedState.form.error = null;
      break;
    case 'Error':
      if (error.message === 'ParserError') {
        watchedState.loadingData.error = 'parserError';
        watchedState.loadingData.status = 'failed';
        watchedState.form.status = '';
        watchedState.form.error = null;
      }
      break;
    default:
      throw new Error(`Unknown errorName: ${error}!`);
  }
};

const getData = (url, watchedState) => {
  const data = axios({
    method: 'get',
    url: createProxy(url),
    timeout: timeWaiting,
  })
    .then((response) => {
      const parsedRss = parse(response.data.contents);
      const { feed, posts } = parsedRss;
      feed.link = url;
      feed.id = _.uniqueId();
      watchedState.feeds.push(feed);

      posts.forEach((post) => {
        post.id = _.uniqueId();
        post.feedId = feed.id;
      });

      watchedState.posts.push(...posts);
      watchedState.loadingData.error = null;
      watchedState.loadingData.status = 'success';

      watchedState.form.status = '';
      watchedState.form.error = null;
    })
    .catch((err) => {
      handleError(watchedState, err);
    });

  return data;
};

const checkUpdate = (watchedState, time) => {
  const promises = watchedState.feeds.map((feed) => {
    const { link } = feed;
    const promise = axios.get(createProxy(link))
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

const validation = (url, feedLinks) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(feedLinks);

  return schema.validate(url)
    .then(() => null)
    .catch((err) => err);
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

        const feedLinks = watchedState.feeds.map((feed) => feed.link);

        validation(url, feedLinks)
          .then((error) => {
            if (error !== null) {
              watchedState.form.error = error.message;
              watchedState.form.status = 'invalid';

              watchedState.loadingData.status = '';
              watchedState.loadingData.error = null;
              return;
            }

            watchedState.form.status = 'valid';
            watchedState.form.error = null;

            watchedState.loadingData.status = '';
            watchedState.loadingData.error = null;

            getData(url, watchedState);
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
