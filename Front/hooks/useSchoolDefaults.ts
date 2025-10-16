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

  // Charger les paramètres par défaut de l'école depuis l'API BD
  const loadSchoolSettings = async () => {
    try {
      const response = await apiCall('/school/defaults/current');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const settings = {
            defaultSemester: data.data.defaultSemester || 1,
            defaultAcademicYear: data.data.defaultAcademicYear || '2025-2026'
          };
          setSchoolSettings(settings);
          return settings;
        }
      }
      
      // Fallback vers localStorage si l'API échoue
      return loadSchoolSettingsFromLocalStorage();
    } catch (error) {
      // Fallback vers localStorage en cas d'erreur
      return loadSchoolSettingsFromLocalStorage();
    }
  };

  // Fallback localStorage (gardé pour compatibilité)
  const loadSchoolSettingsFromLocalStorage = () => {
    try {
      const savedSettings = localStorage.getItem('school-settings');
      const savedSemester = localStorage.getItem('school-default-semester');
      const savedAcademicYear = localStorage.getItem('school-default-academic-year');
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setSchoolSettings(settings);
        return settings;
      } else if (savedSemester || savedAcademicYear) {
        const settings = {
          defaultSemester: savedSemester ? (savedSemester === '2ème semestre' ? 2 : 1) : 1,
          defaultAcademicYear: savedAcademicYear || '2025-2026'
        };
        setSchoolSettings(settings);
        return settings;
      } else {
        const defaultSettings = {
          defaultSemester: 1,
          defaultAcademicYear: '2025-2026'
        };
        setSchoolSettings(defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
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
      const response = await apiCall('/coefficients');

      if (response.ok) {
        const data = await response.json();
        
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
        
        // Si l'API ne retourne pas de coefficients, essayer le localStorage comme fallback
        if (coefficientsArray.length === 0) {
          const localCoefficients = loadCoefficientsFromLocalStorage();
          coefficientsArray = localCoefficients;
        }
        
        setCoefficients(coefficientsArray);
      } else {
        // En cas d'erreur API, utiliser localStorage
        const localCoefficients = loadCoefficientsFromLocalStorage();
        setCoefficients(localCoefficients);
      }
    } catch (error) {
      // En cas d'erreur de connexion, utiliser localStorage
      const localCoefficients = loadCoefficientsFromLocalStorage();
      setCoefficients(localCoefficients);
    }
  };

  // Charger les coefficients depuis le localStorage
  const loadCoefficientsFromLocalStorage = (): SubjectCoefficient[] => {
    try {
      const savedCoefficients = localStorage.getItem('school-coefficients');
      
      if (savedCoefficients) {
        const localCoeffs = JSON.parse(savedCoefficients);
        
        // Transformer les coefficients dans le bon format
        const transformedCoeffs = localCoeffs.map((coeff: any) => ({
          _id: coeff._id || `local-${coeff.subjectId}-${coeff.classLevel}`,
          subjectId: coeff.subjectId,
          classLevel: coeff.classLevel,
          coefficient: coeff.coefficient,
          schoolId: coeff.schoolId || 'local',
          academicYear: coeff.academicYear
        }));
        
        return transformedCoeffs;
      }
      
      return [];
    } catch (error) {
      return [];
    }
  };

  // Mapping complet des matières
  const SUBJECT_MAPPINGS = {
    'Mathématiques': ['Maths', 'Mathématiques', 'Mathematique', 'Mathematics', 'Math'],
    'Français': ['Français', 'Francais', 'French', 'Littérature'],
    'Anglais': ['Anglais', 'English', 'Ang'],
    'Histoire-Géographie': ['Histoire-Géographie', 'Histoire', 'Géographie', 'History', 'Geography', 'HG', 'Hist-Géo'],
    'Sciences de la Vie et de la Terre': ['Sciences de la Vie et de la Terre', 'SVT', 'Sciences Naturelles', 'Biology'],
    'Physique-Chimie': ['Physique-Chimie', 'Physique', 'Chimie', 'Physics', 'Chemistry', 'PC'],
    'Éducation Physique et Sportive': ['Éducation Physique et Sportive', 'EPS', 'Sport', 'Physical Education'],
    'Arts plastiques': ['Arts plastiques', 'Arts', 'Art', 'Dessin'],
    'Musique': ['Musique', 'Music', 'Éducation musicale'],
    'Technologie': ['Technologie', 'Technology', 'Tech'],
    'Informatique': ['Informatique', 'Computer Science', 'ICT', 'TIC'],
    'Philosophie': ['Philosophie', 'Philosophy', 'Philo'],
    'Sciences Économiques et Sociales': ['Sciences Économiques et Sociales', 'SES', 'Economics'],
    'Allemand': ['Allemand', 'German', 'All'],
    'Espagnol': ['Espagnol', 'Spanish', 'Esp'],
    'Italien': ['Italien', 'Italian', 'Ita'],
    'Arabe': ['Arabe', 'Arabic', 'العربية'],
    'Éducation civique': ['Éducation civique', 'Civics', 'Instruction civique'],
    'Latin': ['Latin'],
    'Grec': ['Grec', 'Greek'],
    'Sciences': ['Sciences', 'Science', 'Sciences générales'],
    'Littérature': ['Littérature', 'Literature', 'Litt'],
    'Géologie': ['Géologie', 'Geology'],
    'Biologie': ['Biologie', 'Biology', 'Bio'],
    'Astronomie': ['Astronomie', 'Astronomy'],
    'Psychologie': ['Psychologie', 'Psychology'],
    'Sociologie': ['Sociologie', 'Sociology']
  };

  const getDefaultCoefficient = (subjectId: string, classLevel: string): number => {
    console.log('🔍 getDefaultCoefficient appelé avec:', { subjectId, classLevel });
    
    // Recherche directe par ID
    const directMatch = coefficients.find(c => {
      const coeffSubjectId = typeof c.subjectId === 'string' ? c.subjectId : c.subjectId._id;
      const classMatch = classLevelsMatch(c.classLevel, classLevel);
      return coeffSubjectId === subjectId && classMatch;
    });

    if (directMatch) {
      console.log('✅ Coefficient trouvé par ID:', directMatch.coefficient);
      return directMatch.coefficient;
    }

    // Recherche directe par nom de matière
    const nameMatch = coefficients.find(c => {
      const coeffSubject = typeof c.subjectId === 'string' ? c.subjectId : c.subjectId.name;
      const classMatch = classLevelsMatch(c.classLevel, classLevel);
      const nameMatches = coeffSubject && coeffSubject.toLowerCase() === subjectId.toLowerCase();
      return nameMatches && classMatch;
    });

    if (nameMatch) {
      console.log('✅ Coefficient trouvé par nom:', nameMatch.coefficient);
      return nameMatch.coefficient;
    }

    // Recherche par mapping des matières
    for (const [mainSubject, aliases] of Object.entries(SUBJECT_MAPPINGS)) {
      if (aliases.some(alias => alias.toLowerCase() === subjectId.toLowerCase())) {
        const coefficient = coefficients.find(c => {
          const coeffSubject = typeof c.subjectId === 'string' ? c.subjectId : c.subjectId.name;
          const targetSubject = aliases.find(alias => 
            alias.toLowerCase() === coeffSubject.toLowerCase()
          );
          const classMatch = classLevelsMatch(c.classLevel, classLevel);
          return targetSubject && classMatch;
        });

        if (coefficient) {
          console.log('✅ Coefficient trouvé par mapping:', coefficient.coefficient);
          return coefficient.coefficient;
        }
      }
    }

    console.log('⚠️ Aucun coefficient configuré, utilisation du défaut');

    // Coefficient par défaut basé sur le niveau de classe
    const defaultCoefficients: {[key: string]: number} = {
      'CP': 2, 'CE1': 2, 'CE2': 2, 'CM1': 3, 'CM2': 3,
      '6eme': 4, '5eme': 4, '4eme': 5, '3eme': 5,
      'Seconde': 6, 'Premiere': 7, 'Terminale': 8,
      'Terminale_S1': 8, 'Terminale_S2': 8, 'Terminale_L': 8
    };

    const result = defaultCoefficients[classLevel] || 1;
    return result;
  };

  // Fonction pour comparer les niveaux de classe
  const classLevelsMatch = (coeff_level: string, target_level: string): boolean => {
    if (coeff_level === target_level) return true;
    
    const levelMappings: {[key: string]: string[]} = {
      'Terminale': ['Terminale', 'Terminale_S1', 'Terminale_S2', 'Terminale_L'],
      'Terminale_S1': ['Terminale', 'Terminale_S1'],
      'Terminale_S2': ['Terminale', 'Terminale_S2'],
      'Premiere': ['Premiere', 'Première'],
      'Seconde': ['Seconde', '2nde'],
      '3eme': ['3eme', '3ème', 'Troisième'],
      '4eme': ['4eme', '4ème', 'Quatrième'],
      '5eme': ['5eme', '5ème', 'Cinquième'],
      '6eme': ['6eme', '6ème', 'Sixième']
    };

    for (const [key, variants] of Object.entries(levelMappings)) {
      if (variants.includes(coeff_level) && variants.includes(target_level)) {
        return true;
      }
    }
    
    return false;
  };

  const getClassLevel = (classId: string): string => {
    // Logique simple de mapping de classe vers niveau
    const classLevelMap: {[key: string]: string} = {
      'CP': 'CP', 'CE1': 'CE1', 'CE2': 'CE2', 'CM1': 'CM1', 'CM2': 'CM2',
      '6eme': '6eme', '5eme': '5eme', '4eme': '4eme', '3eme': '3eme',
      'Seconde': 'Seconde', 'Premiere': 'Premiere', 'Terminale': 'Terminale'
    };
    
    return classLevelMap[classId] || 'Seconde';
  };

  // Initialisation et chargement des données
  useEffect(() => {
    const initializeDefaults = async () => {
      setIsLoading(true);
      try {
        await loadSchoolSettings();
        await loadCoefficients();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDefaults();
  }, [refreshTrigger]);

  return {
    schoolSettings,
    coefficients,
    isLoading,
    getDefaultCoefficient,
    getClassLevel,
    loadSchoolSettings,
    loadCoefficients,
    // Fonction pour sauvegarder les paramètres par défaut en BD
    saveSchoolDefaults: async (defaultSemester: number, defaultAcademicYear: string) => {
      try {
        const response = await apiCall('/school/defaults/current', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ defaultSemester, defaultAcademicYear })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Mettre à jour l'état local
          setSchoolSettings({
            defaultSemester: data.data.defaultSemester,
            defaultAcademicYear: data.data.defaultAcademicYear
          });
          
          return { success: true, data: data.data };
        } else {
          return { success: false, error: 'Erreur de sauvegarde' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    // Fonction pour forcer le rechargement
    refreshSettings: () => {
      setRefreshTrigger(prev => prev + 1);
    }
  };
}