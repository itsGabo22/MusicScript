fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBF-7ZaWmrd3MbOXx2bDtwq0ZAc2P7xJZo')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
