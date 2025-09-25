// refresh-token.js
// Ce script permet de rafraîchir le token JWT d'un utilisateur connecté

const fetch = require('node-fetch');
require('dotenv').config();

// Fonction pour rafraîchir le token
async function refreshToken(email, password) {
  try {
    console.log(`Tentative de reconnexion pour l'utilisateur ${email}...`);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Échec de la connexion: ${data.message}`);
      return null;
    }
    
    console.log(`Utilisateur ${data.user.name} connecté avec succès!`);
    console.log(`Rôle: ${data.user.role}`);
    console.log(`Token: ${data.token.substring(0, 15)}...`);
    
    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error.message);
    return null;
  }
}

// Lire les arguments de la ligne de commande
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Veuillez fournir un email et un mot de passe.');
  console.error('Usage: node refresh-token.js <email> <password>');
  process.exit(1);
}

// Rafraîchir le token
refreshToken(email, password)
  .then((result) => {
    if (result) {
      console.log('\n===== INSTRUCTIONS =====');
      console.log('Copiez et exécutez ces commandes dans la console de votre navigateur:');
      console.log('\n// Définir le nouveau token:');
      console.log(`localStorage.setItem('daara_token', '${result.token}');`);
      console.log('\n// Mettre à jour les données utilisateur:');
      console.log(`localStorage.setItem('daara_user', '${JSON.stringify(result.user).replace(/'/g, "\\'")}');`);
      console.log('\n// Vérifier le token:');
      console.log("console.log('Token défini:', localStorage.getItem('daara_token').substring(0, 15) + '...');");
      
      console.log('\nRafraîchissez ensuite la page pour utiliser le nouveau token.');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur:', error);
    process.exit(1);
  });
