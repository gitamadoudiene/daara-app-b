const axios = require('axios');

async function testCoefficientsAPI() {
  try {
    console.log('🧪 Test direct de l\'API coefficients...');
    
    // D'abord, testons sans token pour voir la réponse
    console.log('\n1️⃣ Test sans authentification:');
    try {
      const response = await axios.get('http://localhost:5000/api/coefficients');
      console.log('✅ Réponse reçue:', response.data);
    } catch (error) {
      console.log('❌ Erreur (attendue):', error.response?.status, error.response?.data?.message);
    }
    
    // Maintenant testons avec un token (nous devons d'abord nous connecter)
    console.log('\n2️⃣ Test avec authentification...');
    
    // Login pour récupérer un token
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@lespedagogues.sn', // Utiliser les credentials que vous connaissez
        password: 'admin123'
      });
      
      const token = loginResponse.data.token;
      console.log('🔑 Token reçu:', token.substring(0, 50) + '...');
      
      // Maintenant tester l'API coefficients avec le token
      const coeffResponse = await axios.get('http://localhost:5000/api/coefficients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Coefficients reçus de l\'API:');
      console.log('📊 Status:', coeffResponse.status);
      console.log('📊 Data:', JSON.stringify(coeffResponse.data, null, 2));
      
    } catch (authError) {
      console.log('❌ Erreur d\'authentification:', authError.response?.data);
      console.log('💡 Essayons avec d\'autres credentials...');
      
      // Essayer avec d'autres credentials
      const credentials = [
        { email: 'adminpeds@lespedagogues.sn', password: 'adminpeds123' },
        { email: 'test@lespedagogues.sn', password: 'test123' }
      ];
      
      for (const cred of credentials) {
        try {
          console.log(`🔐 Essai avec ${cred.email}...`);
          const loginResp = await axios.post('http://localhost:5000/api/auth/login', cred);
          const token = loginResp.data.token;
          
          const coeffResp = await axios.get('http://localhost:5000/api/coefficients', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`✅ Succès avec ${cred.email}:`);
          console.log('📊 Data:', JSON.stringify(coeffResp.data, null, 2));
          break;
          
        } catch (err) {
          console.log(`❌ Échec avec ${cred.email}`);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur globale:', error.message);
  }
}

testCoefficientsAPI();