// fix-auth-issues-comprehensive.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');
const Class = require('./models/Class');

// Cette fonction va tester tous les aspects de l'authentification et de l'accès aux ressources
async function diagnoseAndFixAuthIssues() {
  try {
    console.log('=== DIAGNOSTIC COMPLET DU SYSTÈME D\'AUTHENTIFICATION ===');

    // 1. Connexion à la base de données
    console.log('\n🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // 2. Vérification de la configuration JWT
    console.log('\n🔄 Vérification de la configuration JWT...');
    if (!process.env.JWT_SECRET) {
      console.error('❌ ERREUR CRITIQUE: JWT_SECRET non défini dans les variables d\'environnement!');
      process.exit(1);
    } else {
      console.log(`✅ JWT_SECRET correctement configuré (${process.env.JWT_SECRET.substring(0, 3)}...)`);
    }

    // 3. Récupération d'un utilisateur SuperUser pour les tests
    console.log('\n🔄 Recherche d\'un utilisateur SuperUser...');
    const superUser = await User.findOne({ role: 'superuser' });
    
    if (!superUser) {
      console.error('❌ Aucun utilisateur SuperUser trouvé dans la base de données!');
      console.log('⚠️ Création d\'un utilisateur SuperUser pour les tests...');
      
      // Créer un superuser de test si nécessaire
      const newSuperUser = new User({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@daaraapp.com',
        password: await bcrypt.hash('SuperAdmin123!', 10),
        role: 'superuser'
      });
      
      await newSuperUser.save();
      console.log('✅ SuperUser de test créé avec succès');
      superUser = newSuperUser;
    } else {
      console.log(`✅ Utilisateur SuperUser trouvé: ${superUser.firstName} ${superUser.lastName} (${superUser.email})`);
    }

    // 4. Génération d'un token JWT pour cet utilisateur
    console.log('\n🔄 Génération d\'un token JWT pour le SuperUser...');
    const payload = {
      userId: superUser._id,
      role: superUser.role
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log(`✅ Token JWT généré: ${token.substring(0, 20)}...`);
    
    // 5. Vérification du token généré
    console.log('\n🔄 Vérification du token généré...');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token vérifié avec succès');
      console.log(`📊 Informations du token: ID utilisateur=${decoded.userId}, rôle=${decoded.role}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification du token: ${error.message}`);
      process.exit(1);
    }
    
    // 6. Recherche d'une école pour les tests
    console.log('\n🔄 Recherche d\'une école pour les tests...');
    let school = await School.findOne();
    
    if (!school) {
      console.log('⚠️ Aucune école trouvée dans la base de données');
      console.log('⚠️ Création d\'une école de test...');
      
      const newSchool = new School({
        name: "École de Test",
        address: "123 Rue Test",
        phone: "+221 77 000 0000",
        email: "test@ecole.com",
        director: "Directeur Test",
        createdYear: "2025",
        type: "Public",
        status: "Actif"
      });
      
      school = await newSchool.save();
      console.log(`✅ École de test créée avec ID: ${school._id}`);
    } else {
      console.log(`✅ École trouvée: ${school.name} (ID: ${school._id})`);
    }
    
    // 7. Recherche des classes pour cette école
    console.log('\n🔄 Recherche des classes pour cette école...');
    
    const classes = await Class.find({ schoolId: school._id });
    
    if (classes.length === 0) {
      console.log('⚠️ Aucune classe trouvée pour cette école');
      console.log('⚠️ Création d\'une classe de test...');
      
      const newClass = new Class({
        name: "Classe de Test",
        level: "CM2",
        section: "A",
        schoolId: school._id,
        academicYear: "2025-2026"
      });
      
      await newClass.save();
      console.log('✅ Classe de test créée avec succès');
    } else {
      console.log(`✅ ${classes.length} classes trouvées pour cette école`);
      classes.slice(0, 3).forEach(c => {
        console.log(`   - ${c.name} (ID: ${c._id})`);
      });
    }
    
    // 8. Test manuel de l'endpoint avec le token généré
    console.log('\n📋 INSTRUCTIONS POUR TESTER L\'API MANUELLEMENT:');
    console.log('1. Utilisez le token suivant dans vos requêtes API:');
    console.log(`\n${token}\n`);
    console.log('2. Exemple de commande curl:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/classes/school/${school._id}`);
    console.log('\n3. Pour utiliser ce token dans le frontend:');
    console.log('   a. Ouvrez la console du navigateur');
    console.log('   b. Exécutez la commande:');
    console.log(`      localStorage.setItem('daara_token', '${token}')`);
    console.log('   c. Actualisez la page et testez à nouveau');
    
    // 9. Instructions pour vérifier le code d'auth
    console.log('\n🔍 SUGGESTIONS DE CORRECTION:');
    console.log('1. Assurez-vous que le middleware auth.js fonctionne correctement:');
    console.log('   - Il doit accepter les tokens avec et sans préfixe "Bearer"');
    console.log('   - Il doit tracer les erreurs de manière détaillée');
    
    console.log('\n2. Vérifiez les routes dans le fichier routes/class.js:');
    console.log('   - Assurez-vous que la route GET /api/classes/school/:schoolId est protégée par le middleware auth mais pas par des restrictions de rôle');
    
    console.log('\n3. Vérifiez le controller classController.js:');
    console.log('   - La fonction getClassesBySchool doit fonctionner pour tous les rôles');
    console.log('   - Elle ne doit pas contenir de vérification de rôle restrictive');
    
    console.log('\n4. Dans le frontend:');
    console.log('   - Assurez-vous que le token est bien récupéré de localStorage');
    console.log('   - Assurez-vous que l\'en-tête Authorization est correctement formé');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    console.log('=== FIN DU DIAGNOSTIC ===');
  }
}

diagnoseAndFixAuthIssues();
