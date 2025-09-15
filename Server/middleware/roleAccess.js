// roleAccess.js - middleware pour gérer les permissions basées sur les rôles

/**
 * Middleware qui vérifie si l'utilisateur a un rôle autorisé
 * @param {string|string[]} roles - Un ou plusieurs rôles autorisés
 * @returns {function} Middleware Express
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // S'assurer que roles est un tableau
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Vérifier si l'utilisateur est défini (middleware auth doit être appelé avant)
    if (!req.user) {
      console.error('Middleware checkRole: req.user non défini. Le middleware auth doit être appelé avant.');
      return res.status(500).json({ message: 'Erreur serveur dans la vérification des droits' });
    }
    
    console.log(`Vérification des droits: rôle utilisateur=${req.user.role}, rôles autorisés=[${allowedRoles.join(', ')}]`);
    
    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (allowedRoles.includes(req.user.role)) {
      console.log('Accès autorisé');
      return next();
    }
    
    // Accès refusé
    console.error(`Accès refusé pour l'utilisateur avec le rôle ${req.user.role}`);
    return res.status(403).json({ 
      message: 'Accès refusé: vous n\'avez pas les permissions requises pour cette ressource' 
    });
  };
};

module.exports = { checkRole };
