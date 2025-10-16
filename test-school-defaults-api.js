// Test de l'API des paramètres par défaut de l'école

console.log('🧪 TEST API PARAMÈTRES PAR DÉFAUT ÉCOLE');
console.log('='.repeat(40));

// Simuler un appel API avec un token d'authentification
const testSchoolDefaultsAPI = async () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQzNDIyOWY2OTQ0ZTNmZjA4MWIzODgiLCJyb2xlIjoidGVhY2hlciIsInNjaG9vbElkIjoiNjhjNzcwMGNkOWY3YzQyMDdkM2M5ZWE2IiwiaWF0IjoxNzYwNTgxODM5LCJleHAiOjE3NjA2NjgyMzl9.'; // Token du log serveur
  
  try {
    console.log('\n📥 TEST GET /api/school/defaults/current');
    console.log('-'.repeat(40));
    
    const response = await fetch('http://localhost:5000/api/school/defaults/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ API GET fonctionne !');
      console.log(`📊 École: ${data.data.schoolName}`);
      console.log(`📊 Semestre par défaut: ${data.data.defaultSemester}`);
      console.log(`📊 Année académique: ${data.data.defaultAcademicYear}`);
      
      // Test PUT - Mettre à jour les paramètres
      console.log('\n📤 TEST PUT /api/school/defaults/current');
      console.log('-'.repeat(40));
      
      const putResponse = await fetch('http://localhost:5000/api/school/defaults/current', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          defaultSemester: 2,
          defaultAcademicYear: '2025-2026'
        })
      });
      
      console.log('Status:', putResponse.status);
      const putData = await putResponse.json();
      console.log('Response:', JSON.stringify(putData, null, 2));
      
      if (putData.success) {
        console.log('\n✅ API PUT fonctionne !');
        console.log(`📊 Nouveau semestre: ${putData.data.defaultSemester}`);
        console.log(`📊 Nouvelle année: ${putData.data.defaultAcademicYear}`);
      } else {
        console.log('\n❌ API PUT échoué');
      }
    } else {
      console.log('\n❌ API GET échoué');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error.message);
    console.log('\n💡 Assurez-vous que le serveur est lancé sur http://localhost:5000');
  }
};

testSchoolDefaultsAPI();