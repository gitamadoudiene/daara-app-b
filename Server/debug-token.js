// debug-token.js
// Ce script vérifie si un token JWT est valide et affiche son contenu

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Le token à vérifier (passé en argument de ligne de commande)
const token = process.argv[2];

if (!token) {
  console.error('Veuillez fournir un token JWT en argument.');
  console.error('Usage: node debug-token.js <token>');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('VÉRIFICATION DE TOKEN JWT');
console.log('='.repeat(60));
console.log(`Token fourni: ${token.substring(0, 15)}...`);

try {
  // Vérifier si JWT_SECRET est défini
  if (!process.env.JWT_SECRET) {
    console.error('\n❌ ERREUR: JWT_SECRET non défini dans les variables d\'environnement!');
    console.error('Assurez-vous que le fichier .env contient JWT_SECRET=votre_secret');
    process.exit(1);
  }
  
  // Vérifier et décoder le token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  console.log('\n✅ Le token est VALIDE!');
  console.log('\nInformations contenues dans le token:');
  console.log('-'.repeat(40));
  
  // Afficher les informations du token de manière formatée
  Object.entries(decoded).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  // Vérifier l'expiration
  if (decoded.exp) {
    const expirationDate = new Date(decoded.exp * 1000);
    const now = new Date();
    const timeRemaining = expirationDate.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log('\nInformations d\'expiration:');
    console.log('-'.repeat(40));
    console.log(`Date d'expiration: ${expirationDate.toLocaleString()}`);
    
    if (timeRemaining > 0) {
      console.log(`Temps restant: ~${hoursRemaining}h ${minutesRemaining}min`);
      console.log('✅ Le token n\'est PAS expiré');
    } else {
      console.log('❌ Le token est EXPIRÉ!');
      console.log(`Expiré depuis: ${Math.abs(hoursRemaining)}h ${Math.abs(minutesRemaining)}min`);
    }
  }
  
} catch (error) {
  console.error('\n❌ Le token est INVALIDE!');
  console.error(`Erreur: ${error.message}`);
  
  if (error.name === 'TokenExpiredError') {
    const decodedWithoutVerification = jwt.decode(token);
    console.log('\nLe token a expiré mais voici son contenu (sans vérification):');
    console.log(decodedWithoutVerification);
    
    if (decodedWithoutVerification && decodedWithoutVerification.exp) {
      const expDate = new Date(decodedWithoutVerification.exp * 1000);
      console.log(`Date d'expiration: ${expDate.toLocaleString()}`);
    }
  }
}

console.log('\n='.repeat(60));
