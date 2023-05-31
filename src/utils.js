import axios from 'axios';
import _ from 'lodash';

const handleError = (watchedState, error) => {
  switch (error.name) {
    case 'ValidationError':
      watchedState.form.error = error.message;
      watchedState.form.status = 'invalid';
      break;
    case 'AxiosError':
      watchedState.loadingData.error = 'axiosError';
      watchedState.loadingData.status = 'failed';
      break;
    case 'Error':
      if (error.message === 'ParserError') {
        watchedState.loadingData.error = 'parserError';
        watchedState.loadingData.status = 'failed';
      }
      break;
    default:
      throw new Error(`Unknown errorName: ${error}!`);
  }
};

const parse = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('ParserError');
  }

  const feed = {
    title: doc.querySelector('title').textContent,
    description: doc.querySelector('description').textContent,
  };

  const posts = [];
  const items = doc.querySelectorAll('item');
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;

    posts.push({ title, link, description });
  });

  return { feed, posts };
};

const getData = (url, watchedState) => {
  const data = axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
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
      watchedState.loadingData.status = 'success';
    })
    .catch((err) => {
      handleError(watchedState, err);
    });

  return data;
};

const checkUpdate = (watchedState, time) => {
  const promises = watchedState.feeds.map((feed) => {
    const { link } = feed;
    const promise = axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
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

export { handleError, getData, checkUpdate };
