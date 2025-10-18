require('dotenv').config();
const mongoose = require('mongoose');

// Utiliser la même connexion que le serveur
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB Atlas');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const checkCloudEvaluations = async () => {
  await connectDB();
  
  try {
    // Définir le schéma Evaluation
    const evaluationSchema = new mongoose.Schema({}, { strict: false });
    const Evaluation = mongoose.model('Evaluation', evaluationSchema);
    
    console.log('🔍 Recherche des évaluations dans MongoDB Atlas...');
    
    // Récupérer toutes les évaluations
    const evaluations = await Evaluation.find({});
    console.log(`📊 Total évaluations trouvées: ${evaluations.length}`);
    
    if (evaluations.length > 0) {
      console.log('\n📋 Liste des évaluations:');
      evaluations.forEach((eval, index) => {
        console.log(`\n--- Évaluation ${index + 1} ---`);
        console.log(`ID: ${eval._id}`);
        console.log(`Titre: ${eval.title || 'N/A'}`);
        console.log(`Classe ID: ${eval.classId || 'N/A'}`);
        console.log(`Professeur ID: ${eval.teacherId || 'N/A'}`);
        console.log(`Type: ${eval.type || 'N/A'}`);
        console.log(`Statut: ${eval.status || 'N/A'}`);
        console.log(`Date création: ${eval.createdAt || 'N/A'}`);
        if (eval.stats) {
          console.log(`Stats:`, JSON.stringify(eval.stats, null, 2));
        } else {
          console.log('Stats: non définies');
        }
      });
      
      // Vérifier aussi les notes (grades)
      console.log('\n🔍 Vérification des notes...');
      const gradeSchema = new mongoose.Schema({}, { strict: false });
      const Grade = mongoose.model('Grade', gradeSchema);
      
      const grades = await Grade.find({});
      console.log(`📊 Total notes trouvées: ${grades.length}`);
      
      if (grades.length > 0) {
        console.log('📄 Exemple de note:');
        console.log(JSON.stringify(grades[0], null, 2));
      }
      
    } else {
      console.log('❌ Aucune évaluation trouvée dans MongoDB Atlas');
      
      // Lister les collections disponibles
      console.log('\n🗃️ Collections disponibles:');
      const collections = await mongoose.connection.db.listCollections().toArray();
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
};

checkCloudEvaluations();