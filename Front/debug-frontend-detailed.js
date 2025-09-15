// Ce fichier est un script de test pour déboguer le chargement des classes dans le composant UserOverview
// À exécuter dans la console du navigateur

(async function() {
  console.log("=== DÉBOGAGE DÉTAILLÉ DU CHARGEMENT DES CLASSES ===");
  
  // 1. Vérifier le token
  const token = localStorage.getItem('daara_token');
  if (!token) {
    console.error("❌ Aucun token trouvé dans localStorage. Authentification impossible.");
    return;
  }
  console.log("✅ Token trouvé:", token.substring(0, 10) + "...");
  
  // 2. Récupérer les écoles disponibles
  try {
    console.log("\n=== ÉTAPE 1: RÉCUPÉRATION DES ÉCOLES ===");
    const schoolsResponse = await fetch('http://localhost:5000/api/school', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!schoolsResponse.ok) {
      console.error(`❌ Échec de récupération des écoles: ${schoolsResponse.status}`);
      return;
    }
    
    const schools = await schoolsResponse.json();
    console.log(`✅ ${schools.length} écoles récupérées:`, schools);
    
    // 3. Choisir la première école pour le test
    if (schools.length === 0) {
      console.error("❌ Aucune école disponible pour le test.");
      return;
    }
    
    const testSchool = schools[0];
    console.log(`\n=== ÉTAPE 2: TEST AVEC L'ÉCOLE "${testSchool.name}" (ID: ${testSchool._id}) ===`);
    
    // 4. Récupérer les classes pour cette école
    const classesUrl = `http://localhost:5000/api/classes/school/${testSchool._id}`;
    console.log("URL de récupération des classes:", classesUrl);
    
    const classesResponse = await fetch(classesUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log("Statut de la réponse:", classesResponse.status);
    
    if (!classesResponse.ok) {
      console.error(`❌ Échec de récupération des classes: ${classesResponse.status}`);
      const errorText = await classesResponse.text();
      console.error("Détails de l'erreur:", errorText);
      return;
    }
    
    // 5. Examiner en détail la structure des données reçues
    const classes = await classesResponse.json();
    console.log(`✅ Données reçues de l'API:`, classes);
    
    // Vérifier le format des données
    console.log("\n=== ÉTAPE 3: ANALYSE DE LA STRUCTURE DES DONNÉES ===");
    if (!Array.isArray(classes)) {
      console.error("❌ Les données ne sont pas un tableau!");
      console.log("Type de données:", typeof classes);
      return;
    }
    
    console.log(`✅ ${classes.length} classes trouvées`);
    
    if (classes.length > 0) {
      // Examiner la structure du premier élément
      const firstClass = classes[0];
      console.log("Structure du premier élément:", firstClass);
      console.log("Propriétés disponibles:", Object.keys(firstClass));
      
      // Vérifier si les noms de classes sont accessibles
      console.log("\n=== ÉTAPE 4: EXTRACTION DES NOMS DE CLASSES ===");
      
      try {
        const classNames = classes.map(cls => {
          if (typeof cls === 'object' && cls !== null) {
            if (cls.name) {
              return `✅ ${cls.name}`;
            } else {
              console.warn(`⚠️ Objet de classe sans propriété 'name':`, cls);
              return `❌ [Sans nom] (ID: ${cls._id || 'inconnu'})`;
            }
          } else if (typeof cls === 'string') {
            return `✅ ${cls}`;
          } else {
            console.warn(`⚠️ Format inattendu:`, cls);
            return `❌ [Format inconnu] (${typeof cls})`;
          }
        });
        
        console.log("Noms de classes extraits:", classNames);
      } catch (error) {
        console.error("❌ Erreur lors de l'extraction des noms de classes:", error);
      }
    }
    
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
})();
