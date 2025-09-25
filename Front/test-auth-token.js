// test-auth-token.js

// Cette fonction vérifie si un token JWT est stocké dans le localStorage
// et tente de l'utiliser pour accéder à une API protégée
async function testAuthToken() {
  try {
    // 1. Vérifier si un token existe dans le localStorage
    const token = localStorage.getItem('daara_token');
    if (!token) {
      console.error('❌ Aucun token JWT trouvé dans localStorage');
      return false;
    }
    
    console.log('✅ Token trouvé dans localStorage:', token.substring(0, 15) + '...');
    
    // 2. Tenter d'utiliser ce token pour accéder à l'API des matières
    console.log('Tentative d\'appel API avec le token...');
    
    const response = await fetch('http://localhost:5000/api/classes/subjects', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ Échec de l'appel API: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        console.error('Le token semble invalide ou expiré. Essayez de vous reconnecter.');
      }
      
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API accessible avec succès! Données reçues:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'authentification:', error);
    return false;
  }
}

// Exécuter le test
console.log('--- Test du token d\'authentification ---');
testAuthToken().then(success => {
  console.log('--- Résultat du test:', success ? 'SUCCÈS' : 'ÉCHEC', '---');
});

// Cette fonction peut être exécutée dans la console du navigateur pour vérifier
// si le token d'authentification est correctement stocké et valide
