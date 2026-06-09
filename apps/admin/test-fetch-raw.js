fetch("http://localhost:3000/api/analytics?days=30")
  .then(res => res.text())
  .then(data => console.log(data))
  .catch(console.error);
