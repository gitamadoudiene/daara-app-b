const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Class = require('./models/Class');
const SubjectCoefficient = require('./models/SubjectCoefficient');

// Connexion à MongoDB (utilise la même config que le serveur)
const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://amadoudiene20:4uLa5_zVAZmcG.H@cluster0.yyqsw.mongodb.net/daaraappbd';
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connexion à la base de données établie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
};

const analyzeAllData = async () => {
  console.log('🔍 ANALYSE COMPLÈTE DES DONNÉES BD');
  console.log('='.repeat(50));
  
  try {
    // 1. Récupérer TOUTES les matières
    console.log('\n📚 TOUTES LES MATIÈRES EN BD:');
    console.log('-'.repeat(30));
    const subjects = await Subject.find({});
    subjects.forEach((subject, index) => {
      console.log(`${index + 1}. "${subject.name}" (code: ${subject.code || 'N/A'}, ID: ${subject._id})`);
    });
    
    // 2. Récupérer TOUTES les classes avec leurs niveaux
    console.log('\n🎓 TOUS LES NIVEAUX DE CLASSE EN BD:');
    console.log('-'.repeat(35));
    const classes = await Class.find({});
    const uniqueLevels = [...new Set(classes.map(cls => cls.level))].sort();
    uniqueLevels.forEach((level, index) => {
      const classesWithLevel = classes.filter(cls => cls.level === level);
      console.log(`${index + 1}. "${level}" (${classesWithLevel.length} classe(s))`);
      classesWithLevel.forEach(cls => {
        console.log(`   - ${cls.name} (ID: ${cls._id})`);
      });
    });
    
    // 3. Récupérer TOUS les coefficients pour voir toutes les combinaisons
    console.log('\n📊 TOUTES LES COMBINAISONS MATIÈRE/NIVEAU AVEC COEFFICIENTS:');
    console.log('-'.repeat(60));
    const coefficients = await SubjectCoefficient.find({}).populate('subjectId');
    
    if (coefficients.length === 0) {
      console.log('⚠️ Aucun coefficient trouvé en BD');
    } else {
      coefficients.forEach((coeff, index) => {
        const subjectName = coeff.subjectId ? coeff.subjectId.name : 'Matière inconnue';
        console.log(`${index + 1}. "${subjectName}" + "${coeff.classLevel}" = Coefficient ${coeff.coefficient}`);
        console.log(`   - Matière ID: ${coeff.subjectId ? coeff.subjectId._id : 'N/A'}`);
        console.log(`   - École: ${coeff.schoolId}`);
        console.log(`   - Année: ${coeff.academicYear || 'N/A'}`);
        console.log('');
      });
    }
    
    // 4. Générer les mappings automatiquement
    console.log('\n🔧 MAPPINGS GÉNÉRÉS AUTOMATIQUEMENT:');
    console.log('-'.repeat(40));
    
    console.log('\n// Mappings de matières à utiliser dans useSchoolDefaults.ts:');
    console.log('const subjectMappings = {');
    subjects.forEach(subject => {
      // Créer des variantes possibles pour chaque matière
      const variations = [
        subject.name, // Nom exact BD
        subject.name.toLowerCase(),
        subject.name.charAt(0).toUpperCase() + subject.name.slice(1).toLowerCase(),
        subject.code || subject.name.toUpperCase(),
      ];
      
      // Ajouter des variantes spécifiques connues
      if (subject.name.toLowerCase().includes('math')) {
        variations.push('Mathématiques', 'Math', 'Maths', 'mathematics', 'MATH');
      }
      if (subject.name.toLowerCase().includes('franc') || subject.name.toLowerCase().includes('fr')) {
        variations.push('Français', 'français', 'French', 'FR');
      }
      if (subject.name.toLowerCase().includes('angl')) {
        variations.push('Anglais', 'English', 'ENG');
      }
      if (subject.name.toLowerCase().includes('hist')) {
        variations.push('Histoire-Géographie', 'Histoire', 'HG');
      }
      if (subject.name.toLowerCase().includes('info')) {
        variations.push('Informatique', 'IT', 'Computer Science', 'INF');
      }
      
      // Enlever les doublons
      const uniqueVariations = [...new Set(variations)];
      console.log(`  '${subject.name}': ${JSON.stringify(uniqueVariations)},`);
    });
    console.log('};');
    
    console.log('\n// Mappings de niveaux de classe à utiliser dans useSchoolDefaults.ts:');
    console.log('const classLevelMappings = {');
    uniqueLevels.forEach(level => {
      // Créer des variantes possibles pour chaque niveau
      const variations = [
        level, // Nom exact BD
        level.replace('_', ' '), // Remplacer underscore par espace
        level.replace('_', ''), // Enlever underscore
      ];
      
      // Ajouter des variantes spécifiques
      if (level.includes('Terminale')) {
        variations.push('Term', 'T', level.replace('Terminale_', 'T'));
      }
      if (level.includes('Premiere') || level.includes('1ere')) {
        variations.push('Première', '1ère', '1ere', level.replace('Premiere_', '1'));
      }
      if (level.includes('Seconde') || level.includes('2nde')) {
        variations.push('2nde', '2nd', 'Seconde');
      }
      if (level.includes('S2') || level.includes('S1')) {
        const section = level.includes('S2') ? 'S2' : 'S1';
        variations.push(section, `Section ${section}`);
      }
      
      // Enlever les doublons
      const uniqueVariations = [...new Set(variations)];
      console.log(`  '${level}': ${JSON.stringify(uniqueVariations)},`);
    });
    console.log('};');
    
    console.log('\n✅ Analyse complète terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
};

const main = async () => {
  await connectDB();
  await analyzeAllData();
  await mongoose.disconnect();
  console.log('\n🔚 Connexion fermée');
};

main();