const http = require('http');

async function testClassesAPI() {
  try {
    console.log('🔍 Test de l\'API des classes...');
    
    // L'ID de l'école Les Pedagogues d'après les tests précédents
    const schoolId = '68c7700cd9f7c4207d3c9ea6';
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/school/${schoolId}`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer dummy-token',
        'Content-Type': 'application/json'
      }
    };
    
    console.log(`📡 GET http://localhost:5000${options.path}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const classes = JSON.parse(data);
          console.log(`✅ ${classes.length} classes récupérées`);
          
          // Examiner chaque classe
          classes.forEach((cls, index) => {
            console.log(`\n📚 Classe ${index + 1}: ${cls.name}`);
            console.log(`   - ID: ${cls._id}`);
            console.log(`   - resTeacher:`, cls.resTeacher);
            
            if (cls.resTeacher) {
              console.log(`   - resTeacher.name: ${cls.resTeacher.name || 'undefined'}`);
              console.log(`   - resTeacher.firstName: ${cls.resTeacher.firstName || 'undefined'}`);
              console.log(`   - resTeacher.lastName: ${cls.resTeacher.lastName || 'undefined'}`);
            }
          });
          
          process.exit(0);
        } catch (parseError) {
          console.error('❌ Erreur parsing JSON:', parseError.message);
          console.error('Réponse brute:', data);
          process.exit(1);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erreur requête:', error.message);
      process.exit(1);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testClassesAPI();