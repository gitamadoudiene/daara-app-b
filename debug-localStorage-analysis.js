// Script pour analyser le localStorage et comprendre le problème de synchronisation

console.log('🔍 ANALYSE DU LOCALSTORAGE ET SYNCHRONISATION');
console.log('============================================\n');

// Simuler les données localStorage comme elles apparaissent dans le navigateur
const simulatedLocalStorage = {
  'school-coefficients': JSON.stringify([
    {
      subjectName: 'Math',
      className: 'Terminale S',
      coefficient: 6,
      semester: '2ème semestre',
      academicYear: '2024-2025'
    },
    {
      subjectName: 'Math', 
      className: 'Première S',
      coefficient: 4,
      semester: '1er semestre',
      academicYear: '2024-2025'
    },
    {
      subjectName: 'Français',
      className: 'Terminale S', 
      coefficient: 3,
      semester: '2ème semestre',
      academicYear: '2024-2025'
    }
  ]),
  'school-default-semester': '2ème semestre',
  'school-default-academic-year': '2024-2025'
};

console.log('📦 DONNÉES SIMULÉES DU LOCALSTORAGE:');
console.log('------------------------------------');
Object.keys(simulatedLocalStorage).forEach(key => {
  console.log(`🔑 ${key}:`);
  try {
    const parsed = JSON.parse(simulatedLocalStorage[key]);
    console.log('   ', JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log('   ', simulatedLocalStorage[key]);
  }
  console.log('');
});

// Simuler la fonction getDefaultCoefficient du hook
function getDefaultCoefficient(subjectName, className, coefficients) {
  console.log(`🎯 RECHERCHE COEFFICIENT POUR: ${subjectName} - ${className}`);
  
  const found = coefficients.find(coef => 
    coef.subjectName === subjectName && 
    coef.className === className
  );
  
  console.log('   Résultat trouvé:', found);
  return found ? found.coefficient : 1;
}

// Test avec les données localStorage
console.log('🧪 TEST DE LA FONCTION getDefaultCoefficient:');
console.log('--------------------------------------------');

const coefficientsFromLS = JSON.parse(simulatedLocalStorage['school-coefficients']);

console.log('Test 1: Math - Terminale S');
const result1 = getDefaultCoefficient('Math', 'Terminale S', coefficientsFromLS);
console.log(`   Coefficient retourné: ${result1} (attendu: 6)\n`);

console.log('Test 2: Math - Première S');
const result2 = getDefaultCoefficient('Math', 'Première S', coefficientsFromLS);
console.log(`   Coefficient retourné: ${result2} (attendu: 4)\n`);

console.log('Test 3: Français - Terminale S');
const result3 = getDefaultCoefficient('Français', 'Terminale S', coefficientsFromLS);
console.log(`   Coefficient retourné: ${result3} (attendu: 3)\n`);

console.log('Test 4: Matière inexistante');
const result4 = getDefaultCoefficient('Physique', 'Terminale S', coefficientsFromLS);
console.log(`   Coefficient retourné: ${result4} (attendu: 1 - valeur par défaut)\n`);

// Analyser le problème potentiel
console.log('🔍 ANALYSE DES PROBLÈMES POTENTIELS:');
console.log('------------------------------------');

console.log('1. Problème de noms exacts:');
console.log('   - Les noms de matières doivent correspondre EXACTEMENT');
console.log('   - "Math" ≠ "Mathématiques" ≠ "Mathematics"');
console.log('   - "Terminale S" ≠ "TS" ≠ "Terminale Scientifique"\n');

console.log('2. Problème de casse:');
console.log('   - "math" ≠ "Math" ≠ "MATH"');
console.log('   - JavaScript est sensible à la casse\n');

console.log('3. Problème d\'espaces:');
console.log('   - "Math " ≠ "Math" (espace en fin)');
console.log('   - " Math" ≠ "Math" (espace au début)\n');

console.log('4. Synchronisation BD vs localStorage:');
console.log('   - Les données sont UNIQUEMENT dans localStorage');
console.log('   - L\'API ne retourne rien car BD vide');
console.log('   - Le hook ne trouve pas les bonnes données\n');

console.log('💡 SOLUTIONS RECOMMANDÉES:');
console.log('---------------------------');
console.log('1. Forcer la sauvegarde en BD depuis l\'interface admin');
console.log('2. Vérifier les noms exacts utilisés dans l\'interface teacher');
console.log('3. Ajouter une normalisation des chaînes (trim, toLowerCase)');
console.log('4. Implémenter un fallback localStorage si BD vide');
console.log('5. Ajouter des logs détaillés dans le hook pour debug');