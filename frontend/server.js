const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static files from /app root
app.use(express.static('/app', {
  extensions: ['html'],
  index: 'index.html'
}));

// Fallback to index.html for any unknown routes
app.use((req, res) => {
  res.sendFile('/app/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend static server running on http://0.0.0.0:${PORT}`);
});
