const fetch = require('node-fetch');

async function testGenderFunctionality() {
  try {
    console.log('🔐 Test de l\'ajout du champ genre...');
    
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
    console.log('✅ Connexion réussie');
    
    const token = loginData.token;
    
    // 2. Créer un parent avec le champ genre
    console.log('\n👨‍👩‍👧‍👦 Test création parent avec genre...');
    
    const parentData = {
      name: 'Papa Test Genre',
      email: 'papa.test.genre@daara.test',
      phone: '+221 77 999 9999',
      gender: 'Masculin',
      address: 'Dakar Test',
      schoolId: '676863ed5e97b51ab5b5b577', // ID de l'école de test (remplacer par un vrai ID)
      status: 'Actif'
    };
    
    const parentResponse = await fetch('http://localhost:5000/api/users/parents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parentData)
    });
    
    if (parentResponse.ok) {
      const parentResult = await parentResponse.json();
      console.log('✅ Parent créé avec succès:', {
        name: parentResult.parent.name,
        email: parentResult.parent.email,
        role: parentResult.parent.role
      });
      console.log('🔑 Mot de passe temporaire:', parentResult.tempPassword);
    } else {
      const error = await parentResponse.text();
      console.log('❌ Erreur création parent:', error);
    }
    
    // 3. Créer un étudiant avec le champ genre
    console.log('\n🧑‍🎓 Test création étudiant avec genre...');
    
    const studentData = {
      name: 'Étudiante Test Genre',
      email: 'etudiante.test.genre@daara.test',
      phone: '+221 77 888 8888',
      gender: 'Féminin',
      address: 'Dakar Test',
      schoolId: '676863ed5e97b51ab5b5b577', // ID de l'école de test
      classId: '6ème', // Nom de la classe
      dateOfBirth: '2008-05-15',
      status: 'Actif'
    };
    
    const studentResponse = await fetch('http://localhost:5000/api/users/students', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });
    
    if (studentResponse.ok) {
      const studentResult = await studentResponse.json();
      console.log('✅ Étudiant créé avec succès:', {
        name: studentResult.student.name,
        email: studentResult.student.email,
        role: studentResult.student.role,
        class: studentResult.student.class
      });
      console.log('🔑 Mot de passe temporaire:', studentResult.tempPassword);
    } else {
      const error = await studentResponse.text();
      console.log('❌ Erreur création étudiant:', error);
    }
    
    // 4. Récupérer toutes les écoles pour obtenir un ID valide
    console.log('\n🏫 Récupération des écoles disponibles...');
    const schoolsResponse = await fetch('http://localhost:5000/api/schools', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (schoolsResponse.ok) {
      const schools = await schoolsResponse.json();
      console.log('✅ Écoles disponibles:');
      schools.forEach(school => {
        console.log(`  - ${school.name} (ID: ${school._id})`);
      });
      
      // Refaire le test avec un vrai ID d'école
      if (schools.length > 0) {
        const realSchoolId = schools[0]._id;
        console.log(`\n🔄 Nouveau test avec l'ID d'école valide: ${realSchoolId}`);
        
        const parentData2 = {
          ...parentData,
          email: 'papa.test.genre2@daara.test',
          schoolId: realSchoolId
        };
        
        const parentResponse2 = await fetch('http://localhost:5000/api/users/parents', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(parentData2)
        });
        
        if (parentResponse2.ok) {
          const result = await parentResponse2.json();
          console.log('✅ Parent créé avec ID d\'école valide:', result.parent.name);
        } else {
          const error = await parentResponse2.text();
          console.log('❌ Erreur avec ID valide:', error);
        }
      }
    } else {
      console.log('❌ Erreur récupération écoles');
    }
    
    console.log('\n🎉 Tests terminés !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testGenderFunctionality();