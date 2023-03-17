import onChange from 'on-change';

const render = (initialState, elements) => {
  const { form, input, feedback } = elements;
  feedback.textContent = '';
};

export default (initialState, elements) => onChange(initialState, render(initialState, elements));
