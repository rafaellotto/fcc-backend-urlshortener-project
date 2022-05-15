require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const express = require('express');
const validUrl = require('valid-url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

let urls = new Set();

app.post('/api/shorturl', (req, res) => {
  const errorMessage = { error: 'invalid url' };

  // Get url from input
  let url = new URL(req.body.url);

  // Test the url's domain
  dns.lookup(url.hostname, (err) => {
    // If the url is not valid, show error message
    if (
      !validUrl.isUri(url.origin) ||
      (err && err.code === 'ENOTFOUND')
    ) {
      return res.json(errorMessage);
    }

    // Url is valid, so add it to the set
    urls.add(req.body.url);

    // Show success message
    res.json({
      "original_url": req.body.url,
      "short_url": [...urls].indexOf(req.body.url) + 1,
    });
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  let url = [...urls][req.params.id - 1];

  if (url === undefined) {
    return res.json({ "error": "Short url not found" });
  }

  res.redirect(url);
});

app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}`);
});
