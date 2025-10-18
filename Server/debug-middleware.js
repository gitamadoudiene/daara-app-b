const express = require('express');
const app = express();

// Middleware pour capturer toutes les requêtes POST vers /grades
app.use((req, res, next) => {
  if (req.method === 'POST' && req.url.includes('grades')) {
    console.log('=== REQUÊTE GRADES INTERCEPTÉE ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
  }
  next();
});

module.exports = app;