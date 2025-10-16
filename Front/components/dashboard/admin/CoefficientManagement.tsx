'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Settings, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { CLASS_LEVELS, getClassLevelLabel } from '@/lib/classLevels';
import { apiCall, getAuthToken } from '@/lib/api';
import { useSchoolDefaults } from '@/hooks/useSchoolDefaults';
import { SEMESTER_OPTIONS, ACADEMIC_YEAR_OPTIONS } from '@/lib/academicOptions';

interface Subject {
  _id: string;
  name: string;
  code?: string;
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

interface CoefficientFormData {
  subjectId: string;
  classLevels: string[]; // Changé pour supporter plusieurs niveaux
  coefficient: number;
  schoolId: string;
}

interface SchoolSettings {
  defaultSemester: number;
  defaultAcademicYear: string;
}

export function CoefficientManagement() {
  const [coefficients, setCoefficients] = useState<SubjectCoefficient[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoefficient, setEditingCoefficient] = useState<SubjectCoefficient | null>(null);
  const [formData, setFormData] = useState<CoefficientFormData>({
    subjectId: '',
    classLevels: [],
    coefficient: 1,
    schoolId: ''
  });
  
  // Paramètres par défaut de l'école
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    defaultSemester: 1,
    defaultAcademicYear: '2025-2026'
  });

  // Hook pour gérer les paramètres par défaut en BD
  const { saveSchoolDefaults } = useSchoolDefaults();

  useEffect(() => {
    loadCoefficients();
    loadSubjects();
    loadSchoolSettings();
  }, []);

  const loadSubjects = async () => {
    try {
      // Récupérer l'ID de l'école depuis le token ou le contexte utilisateur
      const token = getAuthToken();
      if (!token) {
        console.warn('Aucun token trouvé, utilisation des matières par défaut');
        setDefaultSubjects();
        return;
      }
      
      // Décoder le token pour récupérer schoolId (basique, juste pour l'ID)
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const schoolId = tokenPayload.schoolId;
      
      if (!schoolId) {
        console.warn('schoolId non trouvé dans le token, utilisation des matières par défaut');
        setDefaultSubjects();
        return;
      }

      const response = await apiCall(`/subjects/school/${schoolId}`);

      if (response.ok) {
        const data = await response.json();
        const subjectObjects = Array.isArray(data) ? data : [];
        setSubjects(subjectObjects.length > 0 ? subjectObjects : getDefaultSubjects());
        console.log('📚 Matières chargées depuis l\'API:', subjectObjects);
      } else {
        console.error('Erreur lors du chargement des matières, utilisation des matières par défaut');
        setDefaultSubjects();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des matières:', error);
      setDefaultSubjects();
    }
  };

  const getDefaultSubjects = (): Subject[] => {
    return [
      { _id: 'math', name: 'Mathématiques' },
      { _id: 'french', name: 'Français' },
      { _id: 'english', name: 'Anglais' },
      { _id: 'history', name: 'Histoire-Géographie' },
      { _id: 'physics', name: 'Sciences Physiques' },
      { _id: 'biology', name: 'Sciences de la Vie et de la Terre' },
      { _id: 'philosophy', name: 'Philosophie' },
      { _id: 'sports', name: 'Éducation Physique et Sportive' },
      { _id: 'arts', name: 'Arts Plastiques' },
      { _id: 'music', name: 'Musique' }
    ];
  };

  const setDefaultSubjects = () => {
    const defaultSubjects = getDefaultSubjects();
    setSubjects(defaultSubjects);
    console.log('📚 Utilisation des matières par défaut:', defaultSubjects);
  };

  // Fonction utilitaire pour récupérer le nom d'une matière par son ID
  const getSubjectName = (subjectId: string | { _id: string; name: string; code?: string }): string => {
    // Si subjectId est un objet (données populées de l'API)
    if (typeof subjectId === 'object' && subjectId.name) {
      return subjectId.name;
    }
    
    // Si subjectId est une string, chercher dans notre liste locale
    if (typeof subjectId === 'string') {
      const subject = subjects.find(s => s._id === subjectId);
      return subject ? subject.name : `Matière (${subjectId})`;
    }
    
    return 'Matière inconnue';
  };

  useEffect(() => {
    loadCoefficients();
    loadSubjects();
    loadSchoolSettings();
  }, []);

  const loadCoefficients = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall('/coefficients');

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Coefficients reçus de l\'API:', data);
        
        // S'assurer que data est un tableau ou extraire data.data.coefficients
        let coefficientsArray = [];
        
        if (Array.isArray(data)) {
          coefficientsArray = data;
        } else if (data && data.success && data.data) {
          // Format : { success: true, data: { coefficients: [...], groupedByLevel: {...} } }
          if (Array.isArray(data.data.coefficients)) {
            coefficientsArray = data.data.coefficients;
          } else if (Array.isArray(data.data)) {
            coefficientsArray = data.data;
          }
        } else if (data && Array.isArray(data.coefficients)) {
          // Format : { coefficients: [...] }
          coefficientsArray = data.coefficients;
        } else {
          console.warn('Format de données inattendu pour les coefficients:', data);
          coefficientsArray = [];
        }
        
        console.log('📊 Coefficients traités:', coefficientsArray);
        setCoefficients(coefficientsArray);
      } else {
        const errorText = await response.text();
        console.error('Erreur API coefficients:', response.status, errorText);
        toast.error('Erreur lors du chargement des coefficients');
        setCoefficients([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des coefficients:', error);
      toast.error('Erreur lors du chargement des coefficients');
      setCoefficients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchoolSettings = () => {
    try {
      const savedSettings = localStorage.getItem('school-settings');
      if (savedSettings) {
        setSchoolSettings(JSON.parse(savedSettings));
      } else {
        // Valeurs par défaut avec format année académique correct
        const currentYear = new Date().getFullYear();
        const defaultSettings = {
          defaultSemester: 1,
          defaultAcademicYear: `${currentYear}-${currentYear + 1}`
        };
        setSchoolSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const saveSchoolSettings = () => {
    try {
      console.log('💾 Sauvegarde des paramètres:', schoolSettings);
      localStorage.setItem('school-settings', JSON.stringify(schoolSettings));
      console.log('✅ Paramètres sauvegardés dans localStorage');
      console.log('🔍 Vérification localStorage:', localStorage.getItem('school-settings'));
      toast.success('Paramètres de l\'école sauvegardés');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subjectId || formData.classLevels.length === 0 || formData.coefficient <= 0) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }

    console.log('🔍 Debug - formData:', formData);
    console.log('🔍 Debug - schoolSettings:', schoolSettings);
    console.log('🔍 Debug - subjects disponibles:', subjects);

    try {
      setIsLoading(true);
      
      // Si on modifie un coefficient existant, on garde l'ancienne logique
      if (editingCoefficient) {
        const url = '/coefficients';
        const method = 'PUT';
        
        const singleData = {
          subjectId: formData.subjectId,
          classLevel: formData.classLevels[0],
          coefficient: formData.coefficient,
          // Utiliser l'année académique du coefficient existant, pas la valeur par défaut actuelle
          academicYear: editingCoefficient.academicYear || schoolSettings.defaultAcademicYear
        };
        
        console.log('📤 Données envoyées au serveur (modification):', singleData);
        console.log('🔍 Coefficient existant:', editingCoefficient);
        
        const response = await apiCall(url, {
          method,
          body: JSON.stringify(singleData)
        });

        if (response.ok) {
          toast.success('Coefficient modifié');
          setIsDialogOpen(false);
          resetForm();
          loadCoefficients();
        } else {
          const errorText = await response.text();
          console.error('❌ Erreur serveur (modification):', errorText);
          toast.error('Erreur lors de la sauvegarde: ' + errorText);
        }
      } else {
        // Pour la création, on crée un coefficient pour chaque niveau sélectionné
        console.log('📤 Création de coefficients pour les niveaux:', formData.classLevels);
        
        const promises = formData.classLevels.map(async (classLevel, index) => {
          const singleData = {
            subjectId: formData.subjectId,
            classLevel,
            coefficient: formData.coefficient,
            academicYear: schoolSettings.defaultAcademicYear
          };
          
          console.log(`📤 [${index + 1}/${formData.classLevels.length}] Données pour ${classLevel}:`, singleData);
          
          try {
            const response = await apiCall('/coefficients', {
              method: 'POST',
              body: JSON.stringify(singleData)
            });
            
            console.log(`📥 [${index + 1}] Réponse pour ${classLevel}:`, response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`❌ [${index + 1}] Erreur pour ${classLevel}:`, errorText);
              throw new Error(`Erreur ${response.status} pour ${classLevel}: ${errorText}`);
            }
            
            return { success: true, classLevel };
          } catch (error) {
            console.error(`💥 [${index + 1}] Exception pour ${classLevel}:`, error);
            return { success: false, classLevel, error: error.message };
          }
        });

        const results = await Promise.all(promises);
        const successes = results.filter(r => r.success);
        const failures = results.filter(r => !r.success);
        
        console.log('📊 Résultats:', { successes: successes.length, failures: failures.length });
        
        if (failures.length === 0) {
          toast.success(`${successes.length} coefficient(s) créé(s) avec succès`);
          setIsDialogOpen(false);
          resetForm();
          loadCoefficients();
        } else {
          console.error('💥 Échecs détaillés:', failures);
          toast.error(`Erreur: ${failures.length} coefficient(s) échoué(s). Voir la console pour les détails.`);
        }
      }
    } catch (error) {
      console.error('💥 Erreur globale:', error);
      toast.error('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (coefficient: SubjectCoefficient) => {
    setEditingCoefficient(coefficient);
    
    // Extraire l'ID de la matière (string ou objet populé)
    const subjectId = typeof coefficient.subjectId === 'object' 
      ? coefficient.subjectId._id 
      : coefficient.subjectId;
    
    setFormData({
      subjectId,
      classLevels: [coefficient.classLevel], // Convertir en tableau
      coefficient: coefficient.coefficient,
      schoolId: coefficient.schoolId
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce coefficient ?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiCall(`/coefficients/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Coefficient supprimé');
        loadCoefficients();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingCoefficient(null);
    setFormData({
      subjectId: '',
      classLevels: [],
      coefficient: 1,
      schoolId: ''
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Paramètres par défaut de l'école */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres par défaut de l&apos;école
          </CardTitle>
          <CardDescription>
            Configurez les valeurs par défaut utilisées lors de la création des évaluations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultSemester">Semestre par défaut</Label>
              <Select
                value={schoolSettings.defaultSemester.toString()}
                onValueChange={(value) => 
                  setSchoolSettings(prev => ({ ...prev, defaultSemester: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTER_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="defaultAcademicYear">Année académique par défaut</Label>
              <Select
                value={schoolSettings.defaultAcademicYear}
                onValueChange={(value) => 
                  setSchoolSettings(prev => ({ ...prev, defaultAcademicYear: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une année académique" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEAR_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button onClick={saveSchoolSettings}>
              Sauvegarder les paramètres
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('🔍 Debug Admin - schoolSettings:', schoolSettings);
                console.log('🔍 Debug Admin - localStorage:', localStorage.getItem('school-settings'));
                const currentLS = localStorage.getItem('school-settings');
                if (currentLS) {
                  console.log('🔍 Debug Admin - localStorage parsé:', JSON.parse(currentLS));
                }
              }}
            >
              🔍 Debug Paramètres
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                console.log('🧪 Création de données test...');
                const testSettings = {
                  defaultSemester: 2,
                  defaultAcademicYear: '2025-2026'
                };
                setSchoolSettings(testSettings);
                localStorage.setItem('school-settings', JSON.stringify(testSettings));
                console.log('✅ Données test créées:', testSettings);
                toast.success('Données test créées (Semestre 2, 2025-2026)');
              }}
            >
              🧪 Créer Données Test
            </Button>
            <Button 
              variant="default" 
              onClick={async () => {
                try {
                  console.log('💾 Sauvegarde paramètres en BD...');
                  const response = await saveSchoolDefaults(
                    schoolSettings.defaultSemester, 
                    schoolSettings.defaultAcademicYear
                  );
                  
                  if (response.success) {
                    toast.success('Paramètres sauvegardés en BD avec succès !');
                    console.log('✅ Sauvegarde BD réussie:', response.data);
                  } else {
                    toast.error('Erreur lors de la sauvegarde en BD');
                    console.error('❌ Erreur sauvegarde BD:', response.error);
                  }
                } catch (error) {
                  toast.error('Erreur de connexion à la BD');
                  console.error('❌ Erreur sauvegarde BD:', error);
                }
              }}
            >
              💾 Sauvegarder en BD
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des coefficients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Gestion des coefficients par matière
              </CardTitle>
              <CardDescription>
                Configurez les coefficients par matière et niveau de classe
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un coefficient
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCoefficient ? 'Modifier le coefficient' : 'Ajouter un coefficient'}
                  </DialogTitle>
                  <DialogDescription>
                    Définissez le coefficient pour une matière et un niveau de classe
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Matière</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Niveaux de classe</Label>
                    {editingCoefficient ? (
                      // Mode édition : select simple
                      <Select
                        value={formData.classLevels[0] || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, classLevels: [value] }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASS_LEVELS.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      // Mode création : checkboxes multiples
                      <div className="space-y-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">
                          Sélectionnez un ou plusieurs niveaux pour ce coefficient
                        </div>
                        
                        {/* Boutons de sélection rapide */}
                        <div className="flex flex-wrap gap-2 pb-2 border-b">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              const collegeLevels = ['6eme', '5eme', '4eme', '3eme'];
                              setFormData(prev => ({
                                ...prev,
                                classLevels: collegeLevels
                              }));
                            }}
                          >
                            Collège (6ème-3ème)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              const lyceeLevels = ['2nde_S', '2nde_L', '2nde_ES', '1ere_S', '1ere_L', '1ere_ES', 'terminale_S', 'terminale_L', 'terminale_ES'];
                              setFormData(prev => ({
                                ...prev,
                                classLevels: lyceeLevels
                              }));
                            }}
                          >
                            Lycée (2nde-Term)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                classLevels: []
                              }));
                            }}
                          >
                            Tout désélectionner
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {CLASS_LEVELS.map(level => (
                            <div key={level.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={level.value}
                                checked={formData.classLevels.includes(level.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      classLevels: [...prev.classLevels, level.value]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      classLevels: prev.classLevels.filter(cl => cl !== level.value)
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={level.value} className="text-sm">
                                {level.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {formData.classLevels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {formData.classLevels.map(classLevel => {
                              const level = CLASS_LEVELS.find(l => l.value === classLevel);
                              return (
                                <Badge key={classLevel} variant="secondary" className="text-xs">
                                  {level?.label}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="coefficient">Coefficient</Label>
                    <Input
                      id="coefficient"
                      type="number"
                      min="1"
                      max="10"
                      step="1"
                      value={formData.coefficient}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        coefficient: parseFloat(e.target.value) || 1 
                      }))}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : coefficients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun coefficient configuré
            </div>
          ) : (
            <div className="space-y-4">
              {CLASS_LEVELS.map(level => {
                const levelCoefficients = Array.isArray(coefficients) 
                  ? coefficients.filter(c => c.classLevel === level.value)
                  : [];
                if (levelCoefficients.length === 0) return null;
                
                return (
                  <div key={level.value} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{level.label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {levelCoefficients.map(coefficient => (
                        <div 
                          key={coefficient._id} 
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{getSubjectName(coefficient.subjectId)}</div>
                            <Badge variant="secondary">
                              Coef: {coefficient.coefficient}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(coefficient)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(coefficient._id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}