import onChange from 'on-change';

const render = (watchedState, elements, i18nextInstance) => {
  const { form, input, feedback } = elements;

  if (watchedState.form.status === 'filling') {
    feedback.textContent = '';
  }
  if (watchedState.form.status === 'valid') {
    input.classList.remove('is-invalid');
    feedback.textContent = i18nextInstance.t('success');
    form.reset();
    input.focus();
  }
  if (watchedState.form.status === 'invalid') {
    input.classList.add('is-invalid');
    switch (watchedState.form.errors) {
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
        throw new Error(`Unknown validationError: ${watchedState.form.errors}`);
    }
  }
};

const watcher = (initialState, elements, i18nextInstance) => onChange(initialState, (path) => {
  switch (path) {
    case 'form.status':
    case 'form.errors':
    case 'links':
      render(initialState, elements, i18nextInstance);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }

  return initialState;
});

export default watcher;
