// utils/authHelper.js

/**
 * Vérifie si un token d'authentification valide existe
 * @returns {boolean} true si un token existe, false sinon
 */
export function hasValidToken() {
  const token = localStorage.getItem('daara_token');
  return !!token;
}

/**
 * Récupère le token d'authentification stocké
 * @returns {string|null} Le token JWT ou null s'il n'existe pas
 */
export function getAuthToken() {
  return localStorage.getItem('daara_token');
}

/**
 * Nettoie un token pour éviter les problèmes de format
 * @param {string} token - Le token à nettoyer
 * @returns {string} Le token nettoyé
 */
export function cleanToken(token) {
  if (!token) return '';
  return token.trim();
}

/**
 * Ajoute le token d'authentification aux en-têtes de la requête
 * @param {Object} headers - Les en-têtes existants
 * @returns {Object} Les en-têtes avec l'authentification ajoutée
 */
export function addAuthHeader(headers = {}) {
  const token = getAuthToken();
  if (token) {
    // Nettoyer le token avant de l'utiliser
    const cleanedToken = cleanToken(token);
    return {
      ...headers,
      'Authorization': `Bearer ${cleanedToken}`
    };
  }
  return headers;
}

/**
 * Effectue une requête authentifiée vers l'API avec plusieurs tentatives en cas d'échec
 * Cette fonction est conçue pour être robuste et gérer tous les cas d'erreur courants
 * 
 * @param {string} url - L'URL de l'API
 * @param {Object} options - Les options de fetch (méthode, corps, etc.)
 * @returns {Promise} La promesse de la requête fetch
 */
export async function authenticatedFetch(url, options = {}) {
  console.log(`🔄 Requête authentifiée vers: ${url}`);
  
  // Récupération du token
  let token = getAuthToken();
  
  // Si pas de token, essayer de continuer quand même pour les APIs qui permettent l'accès anonyme
  if (!token) {
    console.warn("⚠️ Attention: Tentative de requête authentifiée sans token disponible");
    console.log("💡 Tentative de requête non authentifiée...");
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      console.log(`📊 Réponse API (sans auth): ${response.status} ${response.statusText}`);
      return response;
    } catch (noAuthError) {
      console.error('❌ Erreur lors de la requête non authentifiée:', noAuthError.message);
      throw new Error(`Échec de la requête sans authentification: ${noAuthError.message}`);
    }
  }
  
  // Nettoyer le token
  token = cleanToken(token);
  console.log(`🔑 Token utilisé (début): ${token.substring(0, 10)}...`);
  
  // STRATÉGIE 1: Essai avec "Bearer {token}"
  try {
    console.log("🔄 Tentative #1: Avec préfixe 'Bearer'");
    const authHeader = `Bearer ${token}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers
      }
    });
    
    console.log(`📊 Réponse API (Bearer): ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      return response; // Succès avec Bearer
    }
    
    // Si 401, essayer les autres stratégies
    if (response.status === 401) {
      console.warn('⚠️ Échec avec Bearer (401) - Tentative suivante...');
    } else {
      // Pour les autres codes d'erreur, retourner directement la réponse
      return response;
    }
  } catch (bearerError) {
    console.error('❌ Erreur lors de la requête avec Bearer:', bearerError.message);
    // Continuer avec la stratégie suivante
  }
  
  // STRATÉGIE 2: Essai avec le token seul (sans "Bearer")
  try {
    console.log("🔄 Tentative #2: Sans préfixe 'Bearer'");
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token, // Token seul sans "Bearer"
        ...options.headers
      }
    });
    
    console.log(`📊 Réponse API (Token seul): ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      return response; // Succès avec token seul
    }
    
    // Si toujours pas ok, essayer la dernière stratégie
    if (response.status === 401) {
      console.warn('⚠️ Échec sans Bearer (401) - Tentative suivante...');
    } else {
      return response; // Pour les autres codes d'erreur
    }
  } catch (tokenOnlyError) {
    console.error('❌ Erreur lors de la requête avec token seul:', tokenOnlyError.message);
    // Continuer avec la dernière stratégie
  }
  
  // STRATÉGIE 3: Paramètre de requête (dernier recours)
  try {
    console.log("🔄 Tentative #3: Token dans l'URL");
    
    // Ajouter le token comme paramètre de requête
    const separator = url.includes('?') ? '&' : '?';
    const urlWithToken = `${url}${separator}token=${encodeURIComponent(token)}`;
    
    const response = await fetch(urlWithToken, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    console.log(`📊 Réponse API (URL token): ${response.status} ${response.statusText}`);
    
    // Si 401 après 3 tentatives, le token est probablement invalide ou expiré
    if (response.status === 401) {
      console.error('❌ Toutes les tentatives d\'authentification ont échoué (401)');
      console.warn('⚠️ Token probablement invalide ou expiré, effacement des données d\'authentification...');
      
      // Effacer les données d'authentification
      localStorage.removeItem('daara_token');
      localStorage.removeItem('daara_user');
      
      // Rediriger vers la page de connexion dans 3 secondes
      console.log('🔄 Redirection vers la page de connexion dans 3 secondes...');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
    
    return response;
  } catch (urlTokenError) {
    console.error('❌ Erreur lors de la requête avec token dans l\'URL:', urlTokenError.message);
    throw new Error(`Échec de toutes les tentatives d'authentification: ${urlTokenError.message}`);
  }
}
