import onChange from 'on-change';

const renderForm = (value, elements, i18nInstance) => {
  const { isValid, error } = value;
  const { input, feedback } = elements;

  if (isValid === false) {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t(`error.${error}`);
  } else {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
  }
};

const renderLoadingData = (value, elements, i18nInstance) => {
  const { status, error } = value;
  const {
    form,
    input,
    submit,
    feedback,
  } = elements;

  if (status === 'loading') {
    input.setAttribute('readonly', 'readonly');
    submit.setAttribute('disabled', 'disabled');
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.remove('text-success');
    feedback.textContent = i18nInstance.t('loading');
  }

  if (status === 'success') {
    input.removeAttribute('readonly');
    submit.removeAttribute('disabled');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18nInstance.t('success');
    form.reset();
    input.focus();
  }

  if (status === 'failed') {
    input.removeAttribute('readonly');
    submit.removeAttribute('disabled');
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t(`error.${error}`);
  }
};

const createContainer = (i18nInstance, contentType) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  card.prepend(cardBody);

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nInstance.t(contentType);
  cardBody.append(cardTitle);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  return { card, listGroup };
};

const renderPosts = (watchedState, elements, i18nInstance) => {
  const contentType = 'posts';
  const { posts } = elements;
  posts.textContent = '';

  const { card, listGroup } = createContainer(i18nInstance, contentType);
  posts.append(card);

  watchedState.posts.forEach((post) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const link = document.createElement('a');
    link.setAttribute('href', post.link);
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;

    if (watchedState.uiState.visitedPostsId.has(post.id)) {
      link.classList.add('fw-normal');
    } else {
      link.classList.add('fw-bold');
    }

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('target', '_blank');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nInstance.t('button');

    listItem.append(link);
    listItem.append(button);
    listGroup.prepend(listItem);
  });

  card.append(listGroup);
};

const renderFeeds = (watchedState, elements, i18nInstance) => {
  const contentType = 'feeds';
  const { feeds } = elements;
  feeds.textContent = '';

  const { card, listGroup } = createContainer(i18nInstance, contentType);
  feeds.append(card);

  watchedState.feeds.forEach((feed) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;
    listItem.prepend(title);

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;
    listItem.append(description);

    listGroup.prepend(listItem);
  });

  card.append(listGroup);
};

const renderModalWindow = (watchedState, postId) => {
  const currentPost = watchedState.posts.find((post) => post.id === postId);

  const modalTitle = document.querySelector('.modal-title');
  modalTitle.textContent = currentPost.title;

  const modalBody = document.querySelector('.modal-body');
  modalBody.textContent = currentPost.description;

  const fullArticle = document.querySelector('.full-article');
  fullArticle.setAttribute('href', currentPost.link);
};

export default (initialState, elements, i18nInstance) => onChange(initialState, (path, value) => {
  switch (path) {
    case 'form':
      renderForm(value, elements, i18nInstance);
      break;
    case 'loadingData':
      renderLoadingData(value, elements, i18nInstance);
      break;
    case 'feeds':
      renderFeeds(initialState, elements, i18nInstance);
      break;
    case 'posts':
    case 'uiState.visitedPostsId':
      renderPosts(initialState, elements, i18nInstance);
      break;
    case 'uiState.postId':
      renderModalWindow(initialState, value);
      break;
    default:
      break;
  }

  return initialState;
});
