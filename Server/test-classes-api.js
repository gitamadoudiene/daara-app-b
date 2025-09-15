// test-classes-api.js
require('dotenv').config();
// Use global fetch which is available in Node.js 18+
// const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';
const SCHOOL_ID = '68c7700cd9f7c4207d3c9ea6'; // ID de l'école à tester

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Teste l'API des classes avec différentes configurations de token
 */
async function testClassesApi() {
  console.log(`${colors.cyan}=======================================================${colors.reset}`);
  console.log(`${colors.cyan}=          TEST DE L'API DES CLASSES                  =${colors.reset}`);
  console.log(`${colors.cyan}=======================================================${colors.reset}\n`);
  
  // Récupérer un token via l'API d'authentification
  console.log(`${colors.blue}[1] Récupération d'un token d'authentification...${colors.reset}`);
  let token = null;
  try {
    const authResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'superadmin@daaraapp.com', // Utilisez un compte existant
        password: 'SuperAdmin123!'
      })
    });
    
    const authData = await authResponse.json();
    
    if (authResponse.ok && authData.token) {
      token = authData.token;
      console.log(`${colors.green}✓ Token récupéré avec succès!${colors.reset}`);
      console.log(`${colors.green}✓ Utilisateur: ${authData.user?.firstName || 'Inconnu'} (${authData.user?.role || 'rôle inconnu'})${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Échec de la connexion: ${authData.message || 'Erreur inconnue'}${colors.reset}`);
      token = 'TOKEN_INVALIDE_POUR_TEST'; // Utiliser un token invalide pour tester le contournement
    }
  } catch (authError) {
    console.log(`${colors.red}✗ Erreur lors de l'authentification: ${authError.message}${colors.reset}`);
    token = 'TOKEN_INVALIDE_POUR_TEST'; // Utiliser un token invalide pour tester le contournement
  }
  
  console.log(`\n${colors.blue}[2] Test des différentes méthodes d'authentification:${colors.reset}`);
  
  // Test 1: Avec le préfixe "Bearer"
  console.log(`\n${colors.magenta}[2.1] Test avec en-tête "Bearer ${token.substring(0, 10)}..."${colors.reset}`);
  try {
    const response1 = await fetch(`${API_URL}/api/classes/school/${SCHOOL_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const status1 = response1.status;
    console.log(`${colors.cyan}Status: ${status1}${colors.reset}`);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`${colors.green}✓ Succès avec Bearer! (${data1.length} classes trouvées)${colors.reset}`);
      
      // Afficher quelques exemples de classes
      if (data1.length > 0) {
        console.log(`${colors.cyan}Exemples de classes:${colors.reset}`);
        data1.slice(0, 3).forEach(cls => {
          console.log(`  - ${cls.name} (${cls.level || 'Niveau non spécifié'})`);
        });
      } else {
        console.log(`${colors.yellow}⚠️ Aucune classe trouvée${colors.reset}`);
      }
    } else {
      const error1 = await response1.json().catch(() => ({}));
      console.log(`${colors.red}✗ Échec avec Bearer: ${error1.message || response1.statusText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erreur avec Bearer: ${error.message}${colors.reset}`);
  }
  
  // Test 2: Sans le préfixe "Bearer"
  console.log(`\n${colors.magenta}[2.2] Test avec token brut "${token.substring(0, 10)}..."${colors.reset}`);
  try {
    const response2 = await fetch(`${API_URL}/api/classes/school/${SCHOOL_ID}`, {
      headers: {
        'Authorization': token
      }
    });
    
    const status2 = response2.status;
    console.log(`${colors.cyan}Status: ${status2}${colors.reset}`);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`${colors.green}✓ Succès avec token brut! (${data2.length} classes trouvées)${colors.reset}`);
      
      // Afficher quelques exemples de classes
      if (data2.length > 0) {
        console.log(`${colors.cyan}Exemples de classes:${colors.reset}`);
        data2.slice(0, 3).forEach(cls => {
          console.log(`  - ${cls.name} (${cls.level || 'Niveau non spécifié'})`);
        });
      } else {
        console.log(`${colors.yellow}⚠️ Aucune classe trouvée${colors.reset}`);
      }
    } else {
      const error2 = await response2.json().catch(() => ({}));
      console.log(`${colors.red}✗ Échec avec token brut: ${error2.message || response2.statusText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erreur avec token brut: ${error.message}${colors.reset}`);
  }
  
  // Test 3: Token en paramètre de requête
  console.log(`\n${colors.magenta}[2.3] Test avec token en paramètre de requête${colors.reset}`);
  try {
    const response3 = await fetch(`${API_URL}/api/classes/school/${SCHOOL_ID}?token=${encodeURIComponent(token)}`);
    
    const status3 = response3.status;
    console.log(`${colors.cyan}Status: ${status3}${colors.reset}`);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`${colors.green}✓ Succès avec token en paramètre! (${data3.length} classes trouvées)${colors.reset}`);
      
      // Afficher quelques exemples de classes
      if (data3.length > 0) {
        console.log(`${colors.cyan}Exemples de classes:${colors.reset}`);
        data3.slice(0, 3).forEach(cls => {
          console.log(`  - ${cls.name} (${cls.level || 'Niveau non spécifié'})`);
        });
      } else {
        console.log(`${colors.yellow}⚠️ Aucune classe trouvée${colors.reset}`);
      }
    } else {
      const error3 = await response3.json().catch(() => ({}));
      console.log(`${colors.red}✗ Échec avec token en paramètre: ${error3.message || response3.statusText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erreur avec token en paramètre: ${error.message}${colors.reset}`);
  }
  
  // Test 4: Sans aucun token (pour tester le mode contournement)
  console.log(`\n${colors.magenta}[2.4] Test sans aucun token (contournement)${colors.reset}`);
  try {
    const response4 = await fetch(`${API_URL}/api/classes/school/${SCHOOL_ID}`);
    
    const status4 = response4.status;
    console.log(`${colors.cyan}Status: ${status4}${colors.reset}`);
    
    if (response4.ok) {
      const data4 = await response4.json();
      console.log(`${colors.green}✓ Succès sans token! (contournement activé) (${data4.length} classes trouvées)${colors.reset}`);
      
      // Afficher quelques exemples de classes
      if (data4.length > 0) {
        console.log(`${colors.cyan}Exemples de classes:${colors.reset}`);
        data4.slice(0, 3).forEach(cls => {
          console.log(`  - ${cls.name} (${cls.level || 'Niveau non spécifié'})`);
        });
      } else {
        console.log(`${colors.yellow}⚠️ Aucune classe trouvée${colors.reset}`);
      }
    } else {
      const error4 = await response4.json().catch(() => ({}));
      console.log(`${colors.red}✗ Échec sans token: ${error4.message || response4.statusText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erreur sans token: ${error.message}${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}=======================================================${colors.reset}`);
  console.log(`${colors.cyan}=               FIN DES TESTS                         =${colors.reset}`);
  console.log(`${colors.cyan}=======================================================${colors.reset}`);
}

// Exécuter les tests
testClassesApi().catch(error => {
  console.error('❌ Erreur fatale:', error);
});
