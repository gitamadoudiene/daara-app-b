import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';

interface SchoolSettings {
  defaultSemester: number;
  defaultAcademicYear: string;
}

interface SubjectCoefficient {
  _id?: string;
  subjectId: string | {
    _id: string;
    name: string;
    code?: string;
  };
  classLevel: string;
  coefficient: number;
  schoolId: string;
  academicYear?: string;
}

export function useSchoolDefaults() {
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    defaultSemester: 1,
    defaultAcademicYear: '2025-2026'
  });
  const [coefficients, setCoefficients] = useState<SubjectCoefficient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Charger les paramètres par défaut de l'école depuis le localStorage
  const loadSchoolSettings = () => {
    try {
      console.log('🔍 Tentative de chargement des paramètres école...');
      const savedSettings = localStorage.getItem('school-settings');
      console.log('📋 Données localStorage school-settings:', savedSettings);
      
      // Aussi vérifier les paramètres individuels si school-settings n'existe pas
      const savedSemester = localStorage.getItem('school-default-semester');
      const savedAcademicYear = localStorage.getItem('school-default-academic-year');
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('📋 Paramètres école parsés:', settings);
        setSchoolSettings(settings);
        return settings;
      } else if (savedSemester || savedAcademicYear) {
        console.log('📋 Paramètres individuels trouvés:', { savedSemester, savedAcademicYear });
        const settings = {
          defaultSemester: savedSemester ? (savedSemester === '2ème semestre' ? 2 : 1) : 2,
          defaultAcademicYear: savedAcademicYear || '2024-2025'
        };
        console.log('📋 Paramètres école construits:', settings);
        setSchoolSettings(settings);
        return settings;
      } else {
        console.log('⚠️ Aucun paramètre école trouvé dans localStorage');
        // Valeurs par défaut
        const currentYear = new Date().getFullYear();
        const defaultSettings = {
          defaultSemester: 2, // Défaut à 2ème semestre pour test
          defaultAcademicYear: `${currentYear}-${currentYear + 1}`
        };
        console.log('📋 Paramètres école par défaut appliqués:', defaultSettings);
        setSchoolSettings(defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres école:', error);
      const defaultSettings = {
        defaultSemester: 1,
        defaultAcademicYear: '2025-2026'
      };
      setSchoolSettings(defaultSettings);
      return defaultSettings;
    }
  };

  // Charger les coefficients configurés
  const loadCoefficients = async () => {
    try {
      console.log('🔍 Chargement des coefficients...');
      const response = await apiCall('/coefficients');

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Coefficients reçus de l\'API:', data);
        
        // Extraire les coefficients du format API
        let coefficientsArray = [];
        if (Array.isArray(data)) {
          coefficientsArray = data;
        } else if (data && data.success && data.data) {
          if (Array.isArray(data.data.coefficients)) {
            coefficientsArray = data.data.coefficients;
          } else if (Array.isArray(data.data)) {
            coefficientsArray = data.data;
          }
        } else if (data && Array.isArray(data.coefficients)) {
          coefficientsArray = data.coefficients;
        }
        
        console.log('📊 Coefficients API traités:', coefficientsArray);
        
        // Si l'API ne retourne pas de coefficients, essayer le localStorage comme fallback
        if (coefficientsArray.length === 0) {
          console.log('🔄 API vide, fallback vers localStorage...');
          const localCoefficients = loadCoefficientsFromLocalStorage();
          coefficientsArray = localCoefficients;
        }
        
        setCoefficients(coefficientsArray);
      } else {
        console.error('Erreur API coefficients:', response.status);
        // En cas d'erreur API, utiliser localStorage
        console.log('🔄 Erreur API, fallback vers localStorage...');
        const localCoefficients = loadCoefficientsFromLocalStorage();
        setCoefficients(localCoefficients);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des coefficients:', error);
      // En cas d'erreur de connexion, utiliser localStorage
      console.log('🔄 Erreur connexion, fallback vers localStorage...');
      const localCoefficients = loadCoefficientsFromLocalStorage();
      setCoefficients(localCoefficients);
    }
  };

  // Charger les coefficients depuis le localStorage
  const loadCoefficientsFromLocalStorage = (): SubjectCoefficient[] => {
    try {
      console.log('🔍 Chargement coefficients depuis localStorage...');
      const savedCoefficients = localStorage.getItem('school-coefficients');
      
      if (savedCoefficients) {
        const localCoeffs = JSON.parse(savedCoefficients);
        console.log('📊 Coefficients localStorage bruts:', localCoeffs);
        
        // Transformer le format localStorage vers le format API
        const transformedCoeffs = localCoeffs.map((coeff: any, index: number) => ({
          _id: `local-${index}`,
          subjectId: {
            _id: coeff.subjectName.toLowerCase(),
            name: coeff.subjectName,
            code: coeff.subjectName.toLowerCase()
          },
          classLevel: coeff.className,
          coefficient: coeff.coefficient,
          schoolId: 'local-school',
          academicYear: coeff.academicYear
        }));
        
        console.log('📊 Coefficients localStorage transformés:', transformedCoeffs);
        return transformedCoeffs;
      }
      
      console.log('⚠️ Aucun coefficient dans localStorage');
      return [];
    } catch (error) {
      console.error('Erreur chargement coefficients localStorage:', error);
      return [];
    }
  };

  // Fonction pour obtenir le coefficient par défaut pour une matière et classe
  const getDefaultCoefficient = (subjectId: string, classLevel: string): number => {
    console.log('🔍 Recherche coefficient pour:', { subjectId, classLevel });
    console.log('📊 Coefficients disponibles:', coefficients);
    
    // Mapping des noms de matières COMPLET (toutes les 26 matières de la BD)
    const subjectMappings: {[key: string]: string[]} = {
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
    
    // Mapping des niveaux de classe COMPLET (tous les 7 niveaux de la BD)
    const classLevelMappings: {[key: string]: string[]} = {
      '3eme': ["3eme", "3ème", "Troisième", "3e", "3"],
      '4eme': ["4eme", "4ème", "Quatrième", "4e", "4"],
      '5eme': ["5eme", "5ème", "Cinquième", "5e", "5"],
      '6eme': ["6eme", "6ème", "Sixième", "6e", "6"],
      'Terminal_L': ["Terminal_L", "Terminal L", "TerminalL", "Terminale L", "TL", "Term L"],
      'Terminal_S': ["Terminal_S", "Terminal S", "TerminalS", "Terminale S", "TS", "Term S"],
      'Terminale_S2': ["Terminale_S2", "Terminale S2", "TerminaleS2", "Term", "T", "TS2", "S2", "Section S2", "Terminale_S2"]
    };
    
    // Fonction pour vérifier si deux noms de matières correspondent
    const subjectsMatch = (coeffSubject: string, targetSubject: string): boolean => {
      if (coeffSubject === targetSubject) return true;
      
      // Normaliser les comparaisons (ignorer casse et espaces)
      const normalizeSubject = (s: string) => s.toLowerCase().trim();
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
    const classLevelsMatch = (coeffClassLevel: string, targetLevel: string): boolean => {
      if (coeffClassLevel === targetLevel) return true;
      
      // Normaliser les comparaisons
      const normalizeClass = (s: string) => s.toLowerCase().trim();
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
  };

  // Fonction pour obtenir le niveau de classe à partir de l'ID de classe
  const getClassLevel = (classes: any[], classId: string): string => {
    const classObj = classes.find(c => c._id === classId);
    return classObj ? classObj.level : '';
  };

  // Initialiser les données
  useEffect(() => {
    console.log('🚀 useSchoolDefaults - Initialisation du hook');
    const initializeDefaults = async () => {
      console.log('⏳ useSchoolDefaults - Début du chargement');
      setIsLoading(true);
      try {
        console.log('📋 useSchoolDefaults - Chargement des paramètres école');
        loadSchoolSettings();
        console.log('📊 useSchoolDefaults - Chargement des coefficients');
        await loadCoefficients();
        console.log('✅ useSchoolDefaults - Chargement terminé avec succès');
      } catch (error) {
        console.error('❌ useSchoolDefaults - Erreur lors de l\'initialisation:', error);
      } finally {
        setIsLoading(false);
        console.log('🏁 useSchoolDefaults - Fin du chargement, isLoading = false');
      }
    };

    initializeDefaults();
  }, [refreshTrigger]); // Dépendance sur refreshTrigger au lieu d'un tableau vide

  // Écouter les changements du localStorage
  useEffect(() => {
    console.log('👂 useSchoolDefaults - Écoute des changements localStorage');
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'school-settings') {
        console.log('🔄 localStorage school-settings a changé, rechargement...');
        loadSchoolSettings();
      }
    };

    // Écouter les changements du localStorage (fonctionne entre onglets)
    window.addEventListener('storage', handleStorageChange);

    // Écouter les changements manuels (même onglet)
    const intervalId = setInterval(() => {
      const currentSettings = localStorage.getItem('school-settings');
      const currentParsed = currentSettings ? JSON.parse(currentSettings) : null;
      
      if (currentParsed && 
          (currentParsed.defaultSemester !== schoolSettings.defaultSemester ||
           currentParsed.defaultAcademicYear !== schoolSettings.defaultAcademicYear)) {
        console.log('🔄 Détection changement localStorage par polling, rechargement...');
        loadSchoolSettings();
      }
    }, 2000); // Vérifier toutes les 2 secondes

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [schoolSettings.defaultSemester, schoolSettings.defaultAcademicYear]);

  // Log final pour voir les valeurs retournées
  console.log('🔄 useSchoolDefaults - Valeurs actuelles retournées:', {
    schoolSettings,
    coefficientsCount: coefficients.length,
    isLoading
  });

  return {
    schoolSettings,
    coefficients,
    isLoading,
    getDefaultCoefficient,
    getClassLevel,
    loadSchoolSettings,
    loadCoefficients,
    // Fonction pour forcer le rechargement
    refreshSettings: () => {
      console.log('🔄 Refresh manuel des paramètres');
      loadSchoolSettings();
      loadCoefficients();
    }
  };
}