// Test de la fonction getDefaultCoefficient avec les vraies données BD

console.log('🧪 TEST DU MATCHING MATIÈRE/CLASSE POUR COEFFICIENT');
console.log('================================================\n');

// Simuler les coefficients récupérés de la BD (format exact de la réponse API)
const mockCoefficients = [
  {
    _id: '68cf7d82dcd29dacb9cc95f5',
    subjectId: {
      _id: '68cf7d82dcd29dacb9cc95f5',
      name: 'Mathematique',
      code: 'MATH'
    },
    classLevel: 'Terminale_S2',
    coefficient: 6,
    schoolId: '68c7700cd9f7c4207d3c9ea6',
    academicYear: '2024-2025'
  },
  {
    _id: '68cf7d82dcd29dacb9cc95f6',
    subjectId: {
      _id: '68cf7d82dcd29dacb9cc95f6',
      name: 'Francais',
      code: 'FR'
    },
    classLevel: 'Terminale_S2',
    coefficient: 3,
    schoolId: '68c7700cd9f7c4207d3c9ea6',
    academicYear: '2024-2025'
  },
  {
    _id: '68cf7d82dcd29dacb9cc95f7',
    subjectId: {
      _id: '68cf7d82dcd29dacb9cc95f7',
      name: 'Informatique',
      code: 'INF'
    },
    classLevel: 'Terminale_S2',
    coefficient: 1,
    schoolId: '68c7700cd9f7c4207d3c9ea6',
    academicYear: '2024-2025'
  }
];

// Reproduire exactement la logique du hook
function getDefaultCoefficient(subjectId, classLevel, coefficients) {
  console.log('🔍 Recherche coefficient pour:', { subjectId, classLevel });
  
  // Mapping des noms de matières (EXACTEMENT comme dans le hook)
  const subjectMappings = {
    'Mathematique': ['math', 'mathematics', 'Mathématiques', 'maths', 'Math', 'Mathematique', 'MATH'],
    'Francais': ['french', 'francais', 'Français', 'français', 'FR'],
    'Anglais': ['english', 'anglais', 'Anglais', 'ENG'],
    'Histoire-Geographie': ['history', 'histoire', 'Histoire-Géographie', 'histoire-geo', 'HG'],
    'Physique-Chimie': ['physics', 'physique', 'Sciences Physiques', 'sciences-physiques', 'PC'],
    'Sciences de la Vie et de la Terre': ['biology', 'svt', 'Sciences de la Vie et de la Terre', 'biologie', 'SVT'],
    'Informatique': ['informatique', 'computer-science', 'IT', 'info', 'INF']
  };
  
  // Mapping des niveaux de classe
  const classLevelMappings = {
    'Terminale_S2': ['Terminale_S2', 'S2', 'Terminale S2', 'Term S2', 'Terminale S', 'TS2'],
    '1ere_S2': ['1ere_S2', '1ère_S2', 'S2', '1ère S2', 'Première S2', 'Première S', '1S2'],
    '2nde_S': ['2nde_S', 'Seconde S', '2nde S']
  };
  
  // Fonction pour vérifier si deux noms de matières correspondent
  const subjectsMatch = (coeffSubject, targetSubject) => {
    if (coeffSubject === targetSubject) return true;
    
    // Normaliser les comparaisons (ignorer casse et espaces)
    const normalizeSubject = (s) => s.toLowerCase().trim();
    if (normalizeSubject(coeffSubject) === normalizeSubject(targetSubject)) return true;
    
    // Vérifier les mappings dans les deux sens
    for (const [mainSubject, aliases] of Object.entries(subjectMappings)) {
      const normalizedAliases = aliases.map(normalizeSubject);
      const normalizedMain = normalizeSubject(mainSubject);
      const normalizedCoeff = normalizeSubject(coeffSubject);
      const normalizedTarget = normalizeSubject(targetSubject);
      
      // Si coeffSubject correspond au nom principal ou à un alias
      // ET targetSubject correspond aussi au nom principal ou à un alias
      const coeffMatchesGroup = normalizedCoeff === normalizedMain || normalizedAliases.includes(normalizedCoeff);
      const targetMatchesGroup = normalizedTarget === normalizedMain || normalizedAliases.includes(normalizedTarget);
      
      if (coeffMatchesGroup && targetMatchesGroup) {
        console.log(`✅ Match trouvé via mapping: ${coeffSubject} ↔ ${targetSubject} (groupe: ${mainSubject})`);
        return true;
      }
    }
    return false;
  };
  
  // Fonction pour vérifier si deux niveaux correspondent
  const classLevelsMatch = (coeffClassLevel, targetLevel) => {
    if (coeffClassLevel === targetLevel) return true;
    
    // Normaliser les comparaisons
    const normalizeClass = (s) => s.toLowerCase().trim();
    if (normalizeClass(coeffClassLevel) === normalizeClass(targetLevel)) return true;
    
    // Vérifier les mappings
    for (const [mainLevel, aliases] of Object.entries(classLevelMappings)) {
      const normalizedAliases = aliases.map(normalizeClass);
      if (normalizedAliases.includes(normalizeClass(coeffClassLevel)) && 
          normalizedAliases.includes(normalizeClass(targetLevel))) {
        return true;
      }
    }
    return false;
  };
  
  // Chercher le coefficient
  const coefficient = coefficients.find(c => {
    const coeffSubjectId = typeof c.subjectId === 'object' ? c.subjectId._id : c.subjectId;
    const coeffSubjectName = typeof c.subjectId === 'object' ? c.subjectId.name : coeffSubjectId;
    
    const subjectMatch = subjectsMatch(coeffSubjectId, subjectId) || 
                        subjectsMatch(coeffSubjectName, subjectId);
    const classMatch = classLevelsMatch(c.classLevel, classLevel);
    
    console.log('📋 Comparaison coefficient:', { 
      coeffSubjectId, 
      coeffSubjectName,
      targetSubjectId: subjectId, 
      coeffClassLevel: c.classLevel, 
      targetClassLevel: classLevel, 
      subjectMatch,
      classMatch,
      coefficientValue: c.coefficient,
      match: subjectMatch && classMatch
    });
    
    return subjectMatch && classMatch;
  });
  
  const result = coefficient ? coefficient.coefficient : 1;
  console.log('📋 Coefficient final trouvé:', result, 'pour', subjectId, 'en', classLevel);
  return result;
}

// Tests avec les scénarios réels
console.log('🧪 TEST 1: Mathématiques + Terminale_S2 (attendu: 6)');
console.log('='.repeat(50));
const result1 = getDefaultCoefficient('Mathématiques', 'Terminale_S2', mockCoefficients);
console.log(`\n🎯 RÉSULTAT: ${result1} ${result1 === 6 ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

console.log('🧪 TEST 2: Français + Terminale_S2 (attendu: 3)');
console.log('='.repeat(50));
const result2 = getDefaultCoefficient('Français', 'Terminale_S2', mockCoefficients);
console.log(`\n🎯 RÉSULTAT: ${result2} ${result2 === 3 ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

console.log('🧪 TEST 3: Informatique + Terminale_S2 (attendu: 1)');
console.log('='.repeat(50));
const result3 = getDefaultCoefficient('Informatique', 'Terminale_S2', mockCoefficients);
console.log(`\n🎯 RÉSULTAT: ${result3} ${result3 === 1 ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

console.log('🧪 TEST 4: Matière inexistante + Terminale_S2 (attendu: 1)');
console.log('='.repeat(50));
const result4 = getDefaultCoefficient('Physique', 'Terminale_S2', mockCoefficients);
console.log(`\n🎯 RÉSULTAT: ${result4} ${result4 === 1 ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

console.log('📊 RÉSUMÉ DES TESTS:');
console.log('==================');
console.log(`✅ Test 1 (Mathématiques): ${result1 === 6 ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
console.log(`✅ Test 2 (Français): ${result2 === 3 ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
console.log(`✅ Test 3 (Informatique): ${result3 === 1 ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
console.log(`✅ Test 4 (Inexistant): ${result4 === 1 ? 'RÉUSSI' : 'ÉCHOUÉ'}`);

const allPassed = result1 === 6 && result2 === 3 && result3 === 1 && result4 === 1;
console.log(`\n🎯 STATUT GLOBAL: ${allPassed ? '✅ TOUS LES TESTS RÉUSSIS' : '❌ CERTAINS TESTS ONT ÉCHOUÉ'}`);