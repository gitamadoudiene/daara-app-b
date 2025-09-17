const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification SECURISE
 * Authentification JWT standard sans contournement
 */
module.exports = (req, res, next) => {
  console.log(`🔐 AUTH MIDDLEWARE: ${req.method} ${req.originalUrl}`);
  
  // 1. Recuperer le token depuis l'en-tete Authorization
  const authHeader = req.header('Authorization');
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
    console.log(`✓ Token trouve: ${token.substring(0, 15)}...`);
  }
  
  // 2. Verifier la presence du token
  if (!token) {
    console.error('❌ Aucun token d\'authentification trouve');
    return res.status(401).json({
      message: 'Token d\'authentification requis',
      error: 'auth_required'
    });
  }
  
  // 3. Verifier et decoder le token
  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET manquant dans l\'environnement');
      return res.status(500).json({ message: 'Erreur de configuration du serveur' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log(`✅ Utilisateur authentifie: ID=${decoded.userId}, Role=${decoded.role}`);
    next();
  } catch (error) {
    console.error('❌ Token invalide:', error.message);
    return res.status(401).json({
      message: 'Token invalide ou expire',
      error: 'invalid_token'
    });
  }
};
