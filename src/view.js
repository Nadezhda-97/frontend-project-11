const render = (initialState, elements) => {
  const { feedback } = elements;
  feedback.textContent = '';

  switch (initialState.form.status) {
    case 'valid': {
      feedback.textContent = 'RSS успешно загружен';
      break;
    }
    case 'invalid': {
      feedback.textContent = 'error';
      break;
    }
    default: {
      throw new Error(`Unknown status: ${initialState.form.status}`);
    }
  }
};

export default render;
