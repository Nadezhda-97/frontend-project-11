import onChange from 'on-change';

const render = (value, elements) => {
  const { feedback } = elements;

  if (value === 'filling') {
    feedback.textContent = '';
  }
  if (value === 'valid') {
    feedback.textContent = 'RSS успешно загружен';
  }
  if (value === 'invalid') {
    feedback.textContent = 'error';
  }
};

const watcher = (initialState, elements) => onChange(initialState, (path, value) => {
  switch (path) {
    case 'form.status':
      render(value, elements);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }

  return initialState;
});

export default watcher;
