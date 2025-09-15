// test-api-classes.js
const schoolId = '68c7700cd9f7c4207d3c9ea6'; // ID de l'école "Les Pedagogues"

async function testFetchClasses() {
  try {
    console.log(`Tentative de récupération des classes pour l'école ID: ${schoolId}`);
    
    // Récupérer le token du localStorage
    // Note: Ce script est conçu pour être exécuté dans un navigateur via la console
    const token = localStorage.getItem('daara_token');
    if (!token) {
      throw new Error('Aucun token trouvé dans localStorage');
    }
    
    console.log('Token trouvé:', token.substring(0, 15) + '...');
    
    // Effectuer la requête API
    const response = await fetch(`http://localhost:5000/api/classes/school/${schoolId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Statut de la réponse:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Données reçues:', data);
    
    if (Array.isArray(data)) {
      console.log(`${data.length} classes trouvées:`);
      data.forEach(cls => {
        console.log(`- Nom: ${cls.name}, Niveau: ${cls.level}`);
      });
    } else {
      console.error('Format de données inattendu:', data);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter le test
testFetchClasses();
