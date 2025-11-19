// test-server.js - Minimal test server
const express = require('express');
const app = express();

app.use(express.json());

app.all('/', (req, res) => {
  console.log(`✅ Request received: ${req.method} ${req.url}`);
  res.json({ 
    message: 'SUCCESS!',
    method: req.method,
    url: req.url,
    body: req.body
  });
});

app.listen(5001, () => {
  console.log('🧪 Test server running on http://localhost:5001');
  console.log('Try: http://localhost:5001/test');
});