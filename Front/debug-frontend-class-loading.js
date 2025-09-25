// debug-frontend-class-loading.js

// Ce script doit être exécuté dans la console du navigateur pour tester le chargement des classes

async function testClassLoading() {
  console.log('=== TEST DE CHARGEMENT DES CLASSES ===');
  
  // 1. Vérifier si le token est présent
  const token = localStorage.getItem('daara_token');
  if (!token) {
    console.error('❌ Aucun token d\'authentification trouvé. Impossible de continuer.');
    return;
  }
  console.log('✅ Token trouvé:', token.substring(0, 15) + '...');
  
  // 2. Récupérer la liste des écoles
  console.log('\n--- 1. CHARGEMENT DES ÉCOLES ---');
  try {
    const schoolsResponse = await fetch('http://localhost:5000/api/school', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!schoolsResponse.ok) {
      throw new Error(`Erreur lors du chargement des écoles: ${schoolsResponse.status}`);
    }
    
    const schools = await schoolsResponse.json();
    console.log(`✅ ${schools.length} écoles récupérées:`, schools);
    
    // 3. Pour chaque école, tester le chargement des classes
    for (const school of schools) {
      const schoolId = school._id;
      console.log(`\n--- 2. CHARGEMENT DES CLASSES POUR L'ÉCOLE: ${school.name} (${schoolId}) ---`);
      
      try {
        const classesResponse = await fetch(`http://localhost:5000/api/classes/school/${schoolId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!classesResponse.ok) {
          throw new Error(`Erreur API: ${classesResponse.status}`);
        }
        
        const classes = await classesResponse.json();
        
        if (!Array.isArray(classes)) {
          console.error(`❌ Format de données inattendu pour les classes:`, classes);
        } else if (classes.length === 0) {
          console.warn(`⚠️ Aucune classe trouvée pour l'école ${school.name}`);
        } else {
          console.log(`✅ ${classes.length} classes trouvées pour l'école ${school.name}:`, classes);
        }
      } catch (error) {
        console.error(`❌ Erreur lors du chargement des classes pour l'école ${school.name}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de chargement des écoles:', error);
  }
}

// Exécuter le test
testClassLoading();
