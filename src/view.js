import onChange from 'on-change';

const renderForm = (watchedState, elements, i18nextInstance) => {
  const { input, feedback } = elements;

  if (watchedState.form.status === 'filling') {
    feedback.textContent = '';
  }

  if (watchedState.form.status === 'invalid') {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');

    switch (watchedState.form.error) {
      case 'empty':
        feedback.textContent = i18nextInstance.t('error.empty');
        break;
      case 'invalidUrl':
        feedback.textContent = i18nextInstance.t('error.invalidUrl');
        break;
      case 'alreadyExists':
        feedback.textContent = i18nextInstance.t('error.alreadyExists');
        break;
      default:
        throw new Error(`Unknown validationError: ${watchedState.form.error}`);
    }
  }
};

const renderLoadingData = (watchedState, elements, i18nextInstance) => {
  const { form, input, feedback } = elements;

  if (watchedState.loadingData.status === 'success') {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18nextInstance.t('success');
    form.reset();
    input.focus();
  }

  if (watchedState.loadingData.status === 'failed') {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');

    switch (watchedState.loadingData.error) {
      case 'axiosError':
        feedback.textContent = i18nextInstance.t('error.networkError');
        break;
      case 'parserError':
        feedback.textContent = i18nextInstance.t('error.invalidRSS');
        break;
      default:
        throw new Error(`Unknown dataLoading error: ${watchedState.loadingData.error}`);
    }
  }
};

const renderPosts = (watchedState, elements, i18nextInstance) => {
  const { posts } = elements;
  posts.textContent = '';

  const div1 = document.createElement('div');
  div1.classList.add('card', 'border-0');
  posts.append(div1);

  const div2 = document.createElement('div');
  div2.classList.add('card-body');
  div1.prepend(div2);

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t('posts');
  div2.append(h2);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div1.append(ul);

  const items = watchedState.posts;
  items.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.setAttribute('href', item.link);
    a.setAttribute('data-id', item.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = item.title;

    li.append(a);
    ul.prepend(li);
  });
};

const renderFeeds = (watchedState, elements, i18nextInstance) => {
  const { feeds } = elements;
  feeds.textContent = '';

  const div1 = document.createElement('div');
  div1.classList.add('card', 'border-0');
  feeds.append(div1);

  const div2 = document.createElement('div');
  div2.classList.add('card-body');
  div1.prepend(div2);

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t('feeds');
  div2.append(h2);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div1.append(ul);

  const items = watchedState.feeds;
  items.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = item.title;
    li.prepend(h3);

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = item.description;
    li.append(p);

    ul.prepend(li);
  });
};

const watcher = (initialState, elements, i18nextInstance) => onChange(initialState, (path) => {
  switch (path) {
    case 'form.status':
    case 'form.error':
    case 'links':
      renderForm(initialState, elements, i18nextInstance);
      break;
    case 'loadingData.status':
    case 'loadingData.error':
      renderLoadingData(initialState, elements, i18nextInstance);
      break;
    case 'feeds':
    case 'posts':
      renderFeeds(initialState, elements, i18nextInstance);
      renderPosts(initialState, elements, i18nextInstance);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }

  return initialState;
});

export default watcher;
