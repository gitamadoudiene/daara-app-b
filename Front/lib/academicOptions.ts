// Options communes pour les semestres et années académiques

export const SEMESTER_OPTIONS = [
  { value: 1, label: '1er Semestre' },
  { value: 2, label: '2ème Semestre' }
];

export const ACADEMIC_YEAR_OPTIONS = [
  { value: '2025-2026', label: '2025-2026' },
  { value: '2026-2027', label: '2026-2027' },
  { value: '2027-2028', label: '2027-2028' },
  { value: '2028-2029', label: '2028-2029' }
];

// Fonction utilitaire pour obtenir l'année académique actuelle
export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() retourne 0-11
  
  // Si on est entre janvier et août, on est dans l'année académique précédente
  // Si on est entre septembre et décembre, on commence la nouvelle année académique
  if (currentMonth >= 9) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

// Fonction utilitaire pour obtenir le semestre actuel
export const getCurrentSemester = (): number => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  // 1er semestre: septembre à janvier (9-1)
  // 2ème semestre: février à juin (2-6)
  // Juillet-août: période de vacances, considérer comme fin de 2ème semestre
  if (currentMonth >= 9 || currentMonth <= 1) {
    return 1;
  } else {
    return 2;
  }
};

// Fonction pour formater l'affichage du semestre
export const getSemesterLabel = (semester: number): string => {
  return semester === 1 ? '1er Semestre' : '2ème Semestre';
};

// Fonction pour valider une année académique
export const isValidAcademicYear = (year: string): boolean => {
  const pattern = /^\d{4}-\d{4}$/;
  if (!pattern.test(year)) return false;
  
  const [startYear, endYear] = year.split('-').map(Number);
  return endYear === startYear + 1;
};