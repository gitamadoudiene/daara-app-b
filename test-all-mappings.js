// Test COMPLET des mappings avec TOUTES les combinaisons de la BD

console.log('🧪 TEST COMPLET DES MAPPINGS - TOUTES LES COMBINAISONS BD');
console.log('='.repeat(60));

// Simuler TOUS les coefficients récupérés de la BD (format exact)
const allCoefficients = [
  // Mathématiques
  { _id: '1', subjectId: { _id: '68cf7d82dcd29dacb9cc95f5', name: 'Mathematique', code: 'MATH' }, classLevel: '6eme', coefficient: 4, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '2', subjectId: { _id: '68cf7d82dcd29dacb9cc95f5', name: 'Mathematique', code: 'MATH' }, classLevel: '5eme', coefficient: 4, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '3', subjectId: { _id: '68cf7d82dcd29dacb9cc95f5', name: 'Mathematique', code: 'MATH' }, classLevel: '4eme', coefficient: 4, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '4', subjectId: { _id: '68cf7d82dcd29dacb9cc95f5', name: 'Mathematique', code: 'MATH' }, classLevel: '3eme', coefficient: 4, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '13', subjectId: { _id: '68cf7d82dcd29dacb9cc95f5', name: 'Mathematique', code: 'MATH' }, classLevel: 'Terminale_S2', coefficient: 6, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  
  // Français
  { _id: '5', subjectId: { _id: '68cf81a5dcd29dacb9cc95fc', name: 'Français', code: 'FR' }, classLevel: '6eme', coefficient: 3, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '6', subjectId: { _id: '68cf81a5dcd29dacb9cc95fc', name: 'Français', code: 'FR' }, classLevel: '5eme', coefficient: 3, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '7', subjectId: { _id: '68cf81a5dcd29dacb9cc95fc', name: 'Français', code: 'FR' }, classLevel: '4eme', coefficient: 3, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '8', subjectId: { _id: '68cf81a5dcd29dacb9cc95fc', name: 'Français', code: 'FR' }, classLevel: '3eme', coefficient: 3, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  
  // Informatique
  { _id: '9', subjectId: { _id: '68cf8367dcd29dacb9cc9650', name: 'Informatique', code: 'INF' }, classLevel: '6eme', coefficient: 1, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '10', subjectId: { _id: '68cf8367dcd29dacb9cc9650', name: 'Informatique', code: 'INF' }, classLevel: '5eme', coefficient: 1, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '11', subjectId: { _id: '68cf8367dcd29dacb9cc9650', name: 'Informatique', code: 'INF' }, classLevel: '4eme', coefficient: 1, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' },
  { _id: '12', subjectId: { _id: '68cf8367dcd29dacb9cc9650', name: 'Informatique', code: 'INF' }, classLevel: '3eme', coefficient: 1, schoolId: '68c7700cd9f7c4207d3c9ea6', academicYear: '2025-2026' }
];

// Reproduire la logique du hook avec les NOUVEAUX mappings complets
function getDefaultCoefficient(subjectId, classLevel, coefficients) {
  console.log('🔍 Recherche coefficient pour:', { subjectId, classLevel });
  
  // MAPPINGS COMPLETS (exactement comme dans le hook mis à jour)
  const subjectMappings = {
    'Philosophie': ["Philosophie", "philosophie", "PHILO", "Philo"],
    'Mathematique': ["Mathematique", "mathematique", "MATH", "Mathématiques", "Math", "Maths", "mathematics"],
    'Français': ["Français", "français", "FR", "French", "Francais"],
    'Physique-Chimie': ["Physique-Chimie", "physique-chimie", "Physique-chimie", "PC", "Physique", "Chimie"],
    'Sciences de la Vie et de la Terre': ["Sciences de la Vie et de la Terre", "sciences de la vie et de la terre", "Sciences de la vie et de la terre", "SVT", "Biologie"],
    'Histoire-Géographie': ["Histoire-Géographie", "histoire-géographie", "Histoire-géographie", "HG", "Histoire", "Géographie"],
    'Anglais': ["Anglais", "anglais", "ENG", "English"],
    'Espagnol': ["Espagnol", "espagnol", "ESP", "Spanish"],
    'Allemand': ["Allemand", "allemand", "ALL", "German"],
    'Arabe': ["Arabe", "arabe", "ARB", "Arabic"],
    'Langues Nationales': ["Langues Nationales", "langues nationales", "Langues nationales", "LN"],
    'Éducation Civique et Morale': ["Éducation Civique et Morale", "éducation civique et morale", "Éducation civique et morale", "ECM", "Education Civique"],
    'Éducation religieuse': ["Éducation religieuse", "éducation religieuse", "ER", "Education Religieuse"],
    'Technologie': ["Technologie", "technologie", "TEC", "Technology"],
    'Informatique': ["Informatique", "informatique", "INF", "IT", "Computer Science", "Info"],
    'Éducation Artistique': ["Éducation Artistique", "éducation artistique", "Éducation artistique", "EA", "Arts"],
    'Éducation Physique et Sportive': ["Éducation Physique et Sportive", "éducation physique et sportive", "Éducation physique et sportive", "EPS", "Sport"],
    'Economie': ["Economie", "economie", "ECO", "Economics", "Économie"],
    'Comptabilité': ["Comptabilité", "comptabilité", "COMPTA", "Accounting"],
    'Gestion': ["Gestion", "gestion", "GES", "Management"],
    'Droit': ["Droit", "droit", "DROIT", "Law"],
    'Sciences Industrielles': ["Sciences Industrielles", "sciences industrielles", "Sciences industrielles", "SI"],
    'Économie Familiale et Sociale': ["Économie Familiale et Sociale", "économie familiale et sociale", "Économie familiale et sociale", "ECOFAM"],
    'Programmation web': ["Programmation web", "programmation web", "PROG", "Web Programming", "Programming"],
    'Russe': ["Russe", "russe", "RUSSE", "Russian"],
    'Intelligence Artificiel': ["Intelligence Artificiel", "intelligence artificiel", "Intelligence artificiel", "IA", "AI", "Intelligence Artificielle"]
  };
  
  const classLevelMappings = {
    '3eme': ["3eme", "3ème", "Troisième", "3e", "3"],
    '4eme': ["4eme", "4ème", "Quatrième", "4e", "4"],
    '5eme': ["5eme", "5ème", "Cinquième", "5e", "5"],
    '6eme': ["6eme", "6ème", "Sixième", "6e", "6"],
    'Terminal_L': ["Terminal_L", "Terminal L", "TerminalL", "Terminale L", "TL", "Term L"],
    'Terminal_S': ["Terminal_S", "Terminal S", "TerminalS", "Terminale S", "TS", "Term S"],
    'Terminale_S2': ["Terminale_S2", "Terminale S2", "TerminaleS2", "Term", "T", "TS2", "S2", "Section S2", "Terminale_S2"]
  };
  
  // Logique de matching améliorée
  const subjectsMatch = (coeffSubject, targetSubject) => {
    if (coeffSubject === targetSubject) return true;
    
    const normalizeSubject = (s) => s.toLowerCase().trim();
    if (normalizeSubject(coeffSubject) === normalizeSubject(targetSubject)) return true;
    
    for (const [mainSubject, aliases] of Object.entries(subjectMappings)) {
      const normalizedAliases = aliases.map(normalizeSubject);
      const normalizedMain = normalizeSubject(mainSubject);
      const normalizedCoeff = normalizeSubject(coeffSubject);
      const normalizedTarget = normalizeSubject(targetSubject);
      
      const coeffMatchesGroup = normalizedCoeff === normalizedMain || normalizedAliases.includes(normalizedCoeff);
      const targetMatchesGroup = normalizedTarget === normalizedMain || normalizedAliases.includes(normalizedTarget);
      
      if (coeffMatchesGroup && targetMatchesGroup) {
        return true;
      }
    }
    return false;
  };
  
  const classLevelsMatch = (coeffClassLevel, targetLevel) => {
    if (coeffClassLevel === targetLevel) return true;
    
    const normalizeClass = (s) => s.toLowerCase().trim();
    if (normalizeClass(coeffClassLevel) === normalizeClass(targetLevel)) return true;
    
    for (const [mainLevel, aliases] of Object.entries(classLevelMappings)) {
      const normalizedAliases = aliases.map(normalizeClass);
      if (normalizedAliases.includes(normalizeClass(coeffClassLevel)) && 
          normalizedAliases.includes(normalizeClass(targetLevel))) {
        return true;
      }
    }
    return false;
  };
  
  const coefficient = coefficients.find(c => {
    const coeffSubjectName = typeof c.subjectId === 'object' ? c.subjectId.name : c.subjectId;
    const subjectMatch = subjectsMatch(coeffSubjectName, subjectId);
    const classMatch = classLevelsMatch(c.classLevel, classLevel);
    return subjectMatch && classMatch;
  });
  
  return coefficient ? coefficient.coefficient : 1;
}

// Tests avec TOUTES les variantes possibles
const testCases = [
  // Tests Mathématiques avec différentes variantes
  { subject: 'Mathématiques', class: 'Terminale_S2', expected: 6, description: 'Math variante française + niveau exact' },
  { subject: 'Math', class: 'Terminale S2', expected: 6, description: 'Math abrégé + niveau avec espace' },
  { subject: 'mathematics', class: 'TS2', expected: 6, description: 'Math anglais + niveau abrégé' },
  { subject: 'Mathematique', class: 'S2', expected: 6, description: 'Math BD exact + section seulement' },
  
  // Tests avec niveaux collège
  { subject: 'Mathématiques', class: '6ème', expected: 4, description: 'Math + 6ème avec accent' },
  { subject: 'Math', class: '6e', expected: 4, description: 'Math + 6e abrégé' },
  { subject: 'Mathematique', class: 'Sixième', expected: 4, description: 'Math BD + niveau écrit' },
  
  // Tests Français
  { subject: 'Français', class: '3eme', expected: 3, description: 'Français exact + niveau exact' },
  { subject: 'français', class: '3ème', expected: 3, description: 'Français minuscule + niveau accent' },
  { subject: 'French', class: 'Troisième', expected: 3, description: 'French anglais + niveau écrit' },
  
  // Tests Informatique
  { subject: 'Informatique', class: '6eme', expected: 1, description: 'Informatique exact' },
  { subject: 'IT', class: '6ème', expected: 1, description: 'IT abrégé anglais' },
  { subject: 'Computer Science', class: 'Sixième', expected: 1, description: 'Computer Science anglais' },
  { subject: 'Info', class: '6e', expected: 1, description: 'Info abrégé français' },
  
  // Tests matières non configurées
  { subject: 'Philosophie', class: '6eme', expected: 1, description: 'Matière non configurée' },
  { subject: 'Physique-Chimie', class: '3eme', expected: 1, description: 'Autre matière non configurée' },
];

console.log('\n🧪 TESTS AVEC TOUTES LES VARIANTES:');
console.log('='.repeat(40));

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.description}`);
  console.log(`   Input: "${test.subject}" + "${test.class}"`);
  
  const result = getDefaultCoefficient(test.subject, test.class, allCoefficients);
  const passed = result === test.expected;
  
  console.log(`   Résultat: ${result} (attendu: ${test.expected}) ${passed ? '✅' : '❌'}`);
  
  if (passed) passedTests++;
});

console.log('\n📊 RÉSUMÉ FINAL:');
console.log('='.repeat(20));
console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
console.log(`🎯 Taux de réussite: ${Math.round((passedTests/totalTests) * 100)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 PARFAIT ! TOUS LES MAPPINGS FONCTIONNENT CORRECTEMENT !');
} else {
  console.log('\n⚠️ Certains mappings nécessitent des ajustements.');
}