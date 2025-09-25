const fetch = require('node-fetch');

async function testSuperUserAPI() {
  try {
    console.log('🔐 Test de connexion super utilisateur...');
    
    // 1. Se connecter en tant que super utilisateur
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'superuser@daara.com', 
        password: 'password' 
      })
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.error('❌ Échec de connexion:', error);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie:', {
      name: loginData.user.name,
      role: loginData.user.role,
      email: loginData.user.email
    });
    
    const token = loginData.token;
    
    // 2. Récupérer toutes les écoles
    console.log('\n🏫 Récupération des écoles...');
    const schoolsResponse = await fetch('http://localhost:5000/api/schools', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!schoolsResponse.ok) {
      const error = await schoolsResponse.text();
      console.error('❌ Échec récupération écoles:', error);
      return;
    }
    
    const schools = await schoolsResponse.json();
    console.log('✅ Écoles récupérées:', schools.map(s => ({ id: s._id, name: s.name })));
    
    // 3. Récupérer toutes les classes de la première école
    if (schools.length > 0) {
      const schoolId = schools[0]._id;
      console.log(`\n📚 Récupération des classes pour l'école: ${schools[0].name} (${schoolId})`);
      
      const classesResponse = await fetch(`http://localhost:5000/api/classes/school/${schoolId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!classesResponse.ok) {
        const error = await classesResponse.text();
        console.error('❌ Échec récupération classes:', error);
        return;
      }
      
      const classes = await classesResponse.json();
      console.log('✅ Classes récupérées:', classes.map(c => ({ id: c._id, name: c.name, level: c.level })));
    }
    
    // 4. Récupérer toutes les classes (endpoint global)
    console.log('\n📚 Récupération de toutes les classes...');
    const allClassesResponse = await fetch('http://localhost:5000/api/classes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!allClassesResponse.ok) {
      const error = await allClassesResponse.text();
      console.error('❌ Échec récupération toutes les classes:', error);
    } else {
      const allClasses = await allClassesResponse.json();
      console.log('✅ Toutes les classes récupérées:', allClasses.map(c => ({ id: c._id, name: c.name, level: c.level, school: c.schoolId })));
    }
    
    console.log('\n🎉 Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testSuperUserAPI();