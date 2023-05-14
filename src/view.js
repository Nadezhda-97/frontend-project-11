import onChange from 'on-change';

const render = (value, elements) => {
  const { form, input, feedback } = elements;

  if (value === 'filling') {
    feedback.textContent = '';
  }
  if (value === 'valid') {
    input.classList.remove('is-invalid');
    feedback.textContent = 'RSS успешно загружен';
    form.reset();
    input.focus();
  }
  if (value === 'invalid') {
    input.classList.add('is-invalid');
    feedback.textContent = 'error';
  }
};

const watcher = (initialState, elements) => onChange(initialState, (path, value) => {
  switch (path) {
    case 'form.status':
    case 'links':
      render(value, elements);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }

  return initialState;
});

export default watcher;
