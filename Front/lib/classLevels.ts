// Liste unifiée des niveaux de classe pour toute l'application
export const CLASS_LEVELS = [
  // Primaire
  { value: 'CI', label: 'CI - Cours d\'Initiation' },
  { value: 'CP', label: 'CP - Cours Préparatoire' },
  { value: 'CE1', label: 'CE1 - Cours Élémentaire 1' },
  { value: 'CE2', label: 'CE2 - Cours Élémentaire 2' },
  { value: 'CM1', label: 'CM1 - Cours Moyen 1' },
  { value: 'CM2', label: 'CM2 - Cours Moyen 2' },
  
  // Collège
  { value: '6eme', label: '6ème' },
  { value: '5eme', label: '5ème' },
  { value: '4eme', label: '4ème' },
  { value: '3eme', label: '3ème' },
  
  // Lycée - Seconde
  { value: '2nde_S', label: '2nde S' },
  { value: '2nde_L', label: '2nde L' },
  { value: '2nde_ES', label: '2nde ES' },
  
  // Lycée - Première
  { value: '1ere_S1', label: '1ère S1' },
  { value: '1ere_S2', label: '1ère S2' },
  { value: '1ere_S3', label: '1ère S3' },
  { value: '1ere_L', label: '1ère L' },
  { value: '1ere_ES', label: '1ère ES' },
  
  // Lycée - Terminale
  { value: 'Terminale_S1', label: 'Terminale S1' },
  { value: 'Terminale_S2', label: 'Terminale S2' },
  { value: 'Terminale_S3', label: 'Terminale S3' },
  { value: 'Terminale_L1', label: 'Terminale L1' },
  { value: 'Terminale_L2', label: 'Terminale L2' },
  { value: 'Terminale_L_Prime', label: 'Terminale L\'' },
  { value: 'Terminale_ES', label: 'Terminale ES' }
];

// Fonction utilitaire pour obtenir le label d'un niveau
export const getClassLevelLabel = (value: string): string => {
  const level = CLASS_LEVELS.find(level => level.value === value);
  return level ? level.label : value;
};

// Fonction utilitaire pour obtenir tous les niveaux sous forme de tableau simple
export const getClassLevelValues = (): string[] => {
  return CLASS_LEVELS.map(level => level.value);
};

// Fonction utilitaire pour obtenir tous les labels
export const getClassLevelLabels = (): string[] => {
  return CLASS_LEVELS.map(level => level.label);
};