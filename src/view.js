import onChange from 'on-change';

const render = (initialState, elements) => {
  const { feedback } = elements;

  if (initialState.form.status === 'valid') {
    feedback.textContent = 'RSS успешно загружен';
  } else {
    feedback.textContent = 'error';
  }
};

export default (initialState, elements) => onChange(initialState, render(initialState, elements));
