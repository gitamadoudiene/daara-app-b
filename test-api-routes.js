// Test rapide de l'API après correction des routes

console.log('🧪 TEST API APRÈS CORRECTION DES ROUTES');
console.log('='.repeat(45));

const testAPI = async () => {
  try {
    console.log('\n📥 TEST GET /api/school/defaults/current');
    console.log('-'.repeat(40));
    
    // Test sans authentification d'abord pour voir si la route existe
    const response = await fetch('http://localhost:5000/api/school/defaults/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.status === 404) {
      console.log('❌ Route toujours non trouvée (404)');
      console.log('💡 Vérifiez l\'ordre des routes dans routes/school.js');
    } else if (response.status === 401) {
      console.log('✅ Route trouvée ! (401 = Authentification requise - c\'est normal)');
      console.log('💡 La route existe, il faut juste un token valide');
    } else {
      console.log('📊 Réponse reçue, status:', response.status);
      const data = await response.text();
      console.log('Data:', data);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('💡 Vérifiez que le serveur tourne sur http://localhost:5000');
  }
};

testAPI();