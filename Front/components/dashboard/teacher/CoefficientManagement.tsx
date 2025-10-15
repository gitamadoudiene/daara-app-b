'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SubjectCoefficient {
  _id: string;
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  classLevel: string;
  coefficient: number;
  academicYear: string;
  isActive: boolean;
  notes?: string;
}

interface SchoolSettings {
  currentSemester: number;
  currentAcademicYear: string;
  schoolId: string;
}

interface CoefficientManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoefficientManagement({ isOpen, onClose }: CoefficientManagementProps) {
  const [coefficients, setCoefficients] = useState<SubjectCoefficient[]>([]);
  const [groupedCoefficients, setGroupedCoefficients] = useState<{[key: string]: SubjectCoefficient[]}>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    currentSemester: 1,
    currentAcademicYear: '2025-2026',
    schoolId: ''
  });
  
  const { toast } = useToast();

  const classLevels = [
    '6ème', '5ème', '4ème', '3ème',
    '2nde', '1ère S', '1ère L', '1ère ES',
    'Terminale S', 'Terminale L', 'Terminale ES'
  ];

  // Charger les coefficients
  const fetchCoefficients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/coefficients', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCoefficients(data.data.coefficients || []);
        setGroupedCoefficients(data.data.groupedByLevel || {});
      }
    } catch (error) {
      console.error('Erreur lors du chargement des coefficients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les coefficients.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les matières
  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubjects(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des matières:', error);
    }
  };

  // Charger les paramètres de l'école
  const fetchSchoolSettings = async () => {
    try {
      // Ici, nous pourrions avoir une API pour les paramètres généraux de l'école
      // Pour l'instant, on utilise des valeurs par défaut
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      
      setSchoolSettings({
        currentSemester: currentMonth >= 1 && currentMonth <= 6 ? 2 : 1,
        currentAcademicYear: '2025-2026',
        schoolId: 'current-school'
      });
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCoefficients();
      fetchSubjects();
      fetchSchoolSettings();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sauvegarder un coefficient
  const saveCoefficient = async (coeffData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/coefficients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify(coeffData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès",
          description: "Coefficient sauvegardé avec succès.",
        });
        fetchCoefficients();
      } else {
        throw new Error(data.message || 'Erreur de sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le coefficient.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Sauvegarder les paramètres de l'école
  const saveSchoolSettings = async () => {
    setIsSaving(true);
    try {
      // Ici on pourrait avoir une API dédiée aux paramètres d'école
      // Pour l'instant, on sauvegarde dans le localStorage comme fallback
      localStorage.setItem('school_settings', JSON.stringify(schoolSettings));
      
      toast({
        title: "Succès",
        description: "Paramètres sauvegardés avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Initialiser les coefficients par défaut
  const initializeDefaultCoefficients = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/coefficients/initialize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify({
          academicYear: schoolSettings.currentAcademicYear
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès",
          description: `${data.message}`,
        });
        fetchCoefficients();
      } else {
        throw new Error(data.message || 'Erreur d\'initialisation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser les coefficients.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLevels = selectedLevel === 'all' 
    ? Object.keys(groupedCoefficients) 
    : [selectedLevel].filter(level => groupedCoefficients[level]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestion des Coefficients
          </DialogTitle>
          <DialogDescription>
            Configurez les coefficients par matière et niveau, ainsi que les paramètres généraux.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Paramètres généraux */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paramètres généraux</CardTitle>
              <CardDescription>
                Configuration du semestre et de l&apos;année académique par défaut
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Semestre par défaut</Label>
                  <Select
                    value={schoolSettings.currentSemester.toString()}
                    onValueChange={(value) => setSchoolSettings({
                      ...schoolSettings,
                      currentSemester: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semestre 1</SelectItem>
                      <SelectItem value="2">Semestre 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Année académique</Label>
                  <Select
                    value={schoolSettings.currentAcademicYear}
                    onValueChange={(value) => setSchoolSettings({
                      ...schoolSettings,
                      currentAcademicYear: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveSchoolSettings} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coefficients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coefficients par matière</CardTitle>
              <CardDescription>
                Définissez les coefficients pour chaque matière par niveau de classe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Label>Filtrer par niveau:</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les niveaux</SelectItem>
                      {classLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={initializeDefaultCoefficients}
                    disabled={isSaving}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Initialiser par défaut
                  </Button>
                  <Button variant="outline" onClick={fetchCoefficients}>
                    Actualiser
                  </Button>
                </div>
              </div>

              {/* Liste des coefficients */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLevels.map(level => (
                    <Card key={level} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">
                          {level}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {groupedCoefficients[level]?.map(coeff => (
                            <div key={coeff._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium">{coeff.subjectId.name}</span>
                                <Badge variant="secondary">{coeff.subjectId.code}</Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Input 
                                  type="number"
                                  min="0.5"
                                  max="10"
                                  step="0.5"
                                  value={coeff.coefficient}
                                  onChange={(e) => {
                                    const newCoeff = parseFloat(e.target.value);
                                    if (newCoeff) {
                                      saveCoefficient({
                                        subjectId: coeff.subjectId._id,
                                        classLevel: coeff.classLevel,
                                        coefficient: newCoeff,
                                        academicYear: coeff.academicYear
                                      });
                                    }
                                  }}
                                  className="w-20 text-center"
                                />
                                <span className="text-xs text-gray-500">coeff</span>
                              </div>
                            </div>
                          )) || (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Aucun coefficient défini pour ce niveau
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}