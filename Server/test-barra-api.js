const jwt = require('jsonwebtoken');

async function testBarraAPI() {
  try {
    console.log('🧪 Test de l\'API pour Barra Fall\n');

    // 1. Générer un token JWT pour Barra Fall
    const barraUser = {
      userId: '68ec65f2b6e5f7921bdb3de6', // ID de Barra Fall créé par le script - utiliser userId
      email: 'barra.fall@lespedagogues.sn',
      role: 'teacher',
      name: 'Barra Fall'
    };

    const JWT_SECRET = 'ab889318661490a77dd8e19df5251503';
    const token = jwt.sign(barraUser, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('🔑 Token JWT généré pour Barra Fall');
    console.log('📋 Données utilisateur:', barraUser);
    console.log('🎫 Token:', token.substring(0, 50) + '...\n');

    // 2. Tester l'API /api/teachers/classes
    console.log('📡 Test de l\'API /api/teachers/classes...');
    
    try {
      const response = await fetch('http://localhost:5000/api/teachers/classes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('📊 Statut de la réponse:', response.status);
      console.log('📋 Réponse complète:', JSON.stringify(data, null, 2));

      if (data.success && data.data.length > 0) {
        console.log('\n✅ SUCCESS! Barra Fall peut voir ses classes:');
        data.data.forEach((cls, index) => {
          console.log(`  ${index + 1}. ${cls.name} (${cls.level} ${cls.section || ''})`);
          console.log(`     École: ${cls.schoolName || 'N/A'}`);
          console.log(`     Matières: ${cls.subjects?.map(s => s.name).join(', ') || 'Aucune'}`);
          console.log(`     Nombre d'étudiants: ${cls.studentCount || 0}`);
        });
      } else {
        console.log('\n❌ PROBLEM: Barra Fall ne voit aucune classe');
        console.log('Message:', data.message || 'Aucun message');
      }

    } catch (apiError) {
      console.error('❌ Erreur lors de l\'appel API:', apiError.message);
      console.log('\n🔍 Vérifiez que le serveur est démarré sur http://localhost:5000');
    }

    // 3. Tester l'API /api/teachers/subjects
    console.log('\n📡 Test de l\'API /api/teachers/subjects...');
    
    try {
      const subjectsResponse = await fetch('http://localhost:5000/api/teachers/subjects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const subjectsData = await subjectsResponse.json();
      
      console.log('📊 Statut de la réponse:', subjectsResponse.status);
      console.log('📋 Matières:', subjectsData.data);

      if (subjectsData.success && subjectsData.data.length > 0) {
        console.log('✅ Matières récupérées avec succès:', subjectsData.data.join(', '));
      } else {
        console.log('❌ Aucune matière trouvée pour Barra Fall');
      }

    } catch (subjectsError) {
      console.error('❌ Erreur lors de l\'appel API subjects:', subjectsError.message);
    }

    // 4. Instructions pour l'interface utilisateur
    console.log('\n🎯 Instructions pour tester dans l\'interface:');
    console.log('1. Connectez-vous avec:');
    console.log('   Email: barra.fall@lespedagogues.sn');
    console.log('   Mot de passe: barrafall123');
    console.log('2. Allez dans "Notes & Évaluations"');
    console.log('3. Cliquez sur "Nouvelle Évaluation"');
    console.log('4. Vous devriez voir "Terminale S" dans la liste des classes');
    console.log('5. Vous devriez voir "Mathématiques" dans la liste des matières');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Si le module est exécuté directement
if (require.main === module) {
  testBarraAPI();
}

module.exports = { testBarraAPI };