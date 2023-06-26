import onChange from 'on-change';

const renderForm = (watchedState, elements, i18nextInstance) => {
  const { input, feedback } = elements;

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

  if (watchedState.form.status === 'valid') {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
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

    if (watchedState.uiState.visitedPostsId.has(item.id)) {
      a.classList.add('fw-normal');
    } else {
      a.classList.add('fw-bold');
    }

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', item.id);
    button.setAttribute('target', '_blank');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nextInstance.t('button');

    li.append(a);
    li.append(button);
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

const renderModalWindow = (watchedState) => {
  const currentPost = watchedState.posts.find((post) => post.id === watchedState.uiState.postId);

  const modalTitle = document.querySelector('.modal-title');
  modalTitle.textContent = currentPost.title;

  const modalBody = document.querySelector('.modal-body');
  modalBody.textContent = currentPost.description;

  const fullArticle = document.querySelector('.full-article');
  fullArticle.setAttribute('href', currentPost.link);
};

const watcher = (initialState, elements, i18nextInstance) => onChange(initialState, (path) => {
  switch (path) {
    case 'form.status':
    case 'form.error':
      renderForm(initialState, elements, i18nextInstance);
      break;
    case 'loadingData.status':
    case 'loadingData.error':
      renderLoadingData(initialState, elements, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(initialState, elements, i18nextInstance);
      break;
    case 'posts':
    case 'uiState.visitedPostsId':
      renderPosts(initialState, elements, i18nextInstance);
      break;
    case 'uiState.postId':
      renderModalWindow(initialState);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }

  return initialState;
});

export default watcher;
