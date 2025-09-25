// fix-auth-issues.js
// Script pour corriger les problèmes d'authentification dans l'API classes

// Importer les dépendances nécessaires
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Class = require('./models/Class');
const School = require('./models/School');

// Variables pour test
const TEST_SCHOOL_ID = process.argv[2]; // Premier argument : ID de l'école

if (!TEST_SCHOOL_ID) {
  console.error('Veuillez fournir un ID d\'école à tester');
  console.log('Usage: node fix-auth-issues.js <schoolId>');
  process.exit(1);
}

// Vérifier et corriger les problèmes
async function diagnoseAndFix() {
  console.log('='.repeat(60));
  console.log('DIAGNOSTIC ET CORRECTION DES PROBLÈMES D\'AUTHENTIFICATION');
  console.log('='.repeat(60));
  
  try {
    // 1. Connexion à MongoDB
    console.log('1. Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log('✅ Connecté à MongoDB avec succès');
    
    // 2. Vérifier le secret JWT
    console.log('\n2. Vérification du secret JWT...');
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET n\'est pas défini dans le fichier .env');
      console.log('Correction: Ajouter JWT_SECRET dans le fichier .env');
      process.exit(1);
    } else {
      console.log(`✅ JWT_SECRET est défini: ${process.env.JWT_SECRET.substring(0, 3)}...${process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 3)}`);
    }
    
    // 3. Vérifier que l'école existe
    console.log('\n3. Vérification de l\'école...');
    const school = await School.findById(TEST_SCHOOL_ID);
    if (!school) {
      console.error(`❌ Aucune école trouvée avec l'ID: ${TEST_SCHOOL_ID}`);
      console.log('Les écoles disponibles sont:');
      const schools = await School.find().select('_id name');
      schools.forEach(s => console.log(`- ${s._id}: ${s.name}`));
      process.exit(1);
    } else {
      console.log(`✅ École trouvée: ${school.name} (ID: ${school._id})`);
    }
    
    // 4. Vérifier les classes associées
    console.log('\n4. Vérification des classes associées...');
    const classes = await Class.find({ schoolId: TEST_SCHOOL_ID });
    console.log(`${classes.length} classes trouvées pour cette école:`);
    classes.forEach(c => console.log(`- ${c._id}: ${c.name}`));
    
    // 5. Créer un token JWT de test pour les super utilisateurs
    console.log('\n5. Création d\'un token de test pour super utilisateur...');
    const superUserToken = jwt.sign(
      { userId: 'test-super-user', role: 'super_user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log(`✅ Token de test créé: ${superUserToken.substring(0, 20)}...`);
    console.log('\nCopiez ce token et utilisez-le pour tester l\'API:');
    console.log('```');
    console.log(`Authorization: Bearer ${superUserToken}`);
    console.log('```');
    console.log('\nOu utilisez cette commande dans la console de votre navigateur:');
    console.log('```');
    console.log(`localStorage.setItem('daara_token', '${superUserToken}');`);
    console.log('```');
    
    // 6. Proposer une correction au middleware auth.js
    console.log('\n6. Instructions pour corriger le middleware d\'authentification:');
    console.log('Ouvrez le fichier Server/middleware/auth.js et assurez-vous qu\'il contient ce code:');
    console.log('\n```javascript');
    console.log(`const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let token;
  
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.header('Authorization');
  if (authHeader) {
    // Retirer le préfixe "Bearer " s'il existe
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  }
  
  // Vérifier si un token est présent
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Vérifier le token
    const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET);
    
    // Ajouter l'utilisateur décodé à l'objet de requête
    req.user = decoded;
    
    // Log pour débogage
    console.log(\`Utilisateur authentifié: \${decoded.userId}, rôle: \${decoded.role || 'non spécifié'}\`);
    
    next();
  } catch (err) {
    console.error('Erreur d\\'authentification:', err.message);
    res.status(401).json({ message: 'Token is not valid', details: err.message });
  }
};`);
    console.log('```');
    
    // 7. Proposer une correction au controller pour les classes
    console.log('\n7. Instructions pour corriger le contrôleur des classes:');
    console.log('Assurez-vous que dans le fichier Server/controllers/classController.js, la fonction getClassesBySchool ne contient pas de vérification restrictive de rôle.');
    
    console.log('\n='.repeat(60));
    console.log('DIAGNOSTIC TERMINÉ');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Une erreur est survenue lors du diagnostic:', error);
  } finally {
    // Fermer la connexion à MongoDB
    mongoose.connection.close();
  }
}

// Exécuter le diagnostic
diagnoseAndFix();
