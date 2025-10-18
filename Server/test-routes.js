// Route de test pour diagnostiquer les problèmes de sauvegarde des notes
const express = require('express');
const router = express.Router();

router.post('/test-grades', (req, res) => {
  console.log('=== TEST GRADES ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  res.json({
    success: true,
    message: 'Test reçu',
    data: {
      headersReceived: Object.keys(req.headers).length,
      bodyReceived: req.body,
      userReceived: req.user ? 'OUI' : 'NON'
    }
  });
});

module.exports = router;