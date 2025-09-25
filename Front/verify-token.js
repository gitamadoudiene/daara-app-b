/**
 * verify-token.js
 * Script à exécuter dans la console du navigateur pour vérifier l'état du token JWT
 */

(function() {
  console.clear();
  console.log('%c===== VÉRIFICATION DU TOKEN JWT =====', 'color: blue; font-weight: bold; font-size: 16px;');
  
  // Récupérer le token et l'utilisateur stockés
  const token = localStorage.getItem('daara_token');
  const userStr = localStorage.getItem('daara_user');
  
  // Vérifier si le token existe
  if (!token) {
    console.error('%cAucun token trouvé dans localStorage!', 'color: red; font-weight: bold;');
    console.log('Vous devez vous connecter pour obtenir un nouveau token.');
    return;
  }
  
  console.log('%c✓ Token trouvé!', 'color: green; font-weight: bold;');
  console.log(`Token (début): ${token.substring(0, 20)}...`);
  
  // Vérifier si le token est bien formaté
  if (!/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token)) {
    console.warn('%c⚠️ Le token ne semble pas être au format JWT valide!', 'color: orange; font-weight: bold;');
  }
  
  // Vérifier l'utilisateur
  let user = null;
  
  try {
    if (userStr) {
      user = JSON.parse(userStr);
      console.log('%c✓ Données utilisateur trouvées:', 'color: green; font-weight: bold;');
      console.log(`Nom: ${user.name || 'Non spécifié'}`);
      console.log(`Email: ${user.email || 'Non spécifié'}`);
      console.log(`Rôle: ${user.role || 'Non spécifié'}`);
    } else {
      console.warn('%c⚠️ Aucune donnée utilisateur trouvée!', 'color: orange; font-weight: bold;');
    }
  } catch (e) {
    console.error('%cErreur lors de la lecture des données utilisateur:', 'color: red;', e);
  }
  
  // Tester le token avec une requête API simple
  console.log('\n%cTest du token avec l\'API...', 'color: blue; font-weight: bold;');
  
  fetch('http://localhost:5000/api/school', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('%c✓ Le token fonctionne correctement avec l\'API!', 'color: green; font-weight: bold;');
      return response.json();
    } else {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
  })
  .then(data => {
    console.log(`Données reçues: ${data.length} écoles`);
  })
  .catch(error => {
    console.error('%c✗ Le token a été rejeté par l\'API!', 'color: red; font-weight: bold;');
    console.error('Détails:', error);
    
    console.log('\n%cActions recommandées:', 'color: blue; font-weight: bold;');
    console.log('1. Se déconnecter');
    console.log('2. Effacer le localStorage');
    console.log('3. Se reconnecter pour obtenir un nouveau token');
    
    console.log('\nCommandes pour nettoyer le localStorage:');
    console.log('%clocalStorage.removeItem("daara_token");', 'color: purple;');
    console.log('%clocalStorage.removeItem("daara_user");', 'color: purple;');
  });
})();
