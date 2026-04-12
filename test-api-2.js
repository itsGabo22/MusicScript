fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBF-7ZaWmrd3MbOXx2bDtwq0ZAc2P7xJZo')
  .then(res => res.json())
  .then(data => console.log(data.models?.map(m => m.name).filter(n => n.includes('gemini'))))
  .catch(console.error);
