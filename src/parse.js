const parse = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');
  if (doc.querySelector('parsererror')) {
    const error = new Error('failed parsing data');
    error.name = 'ParserError';
    throw error;
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

export default parse;
