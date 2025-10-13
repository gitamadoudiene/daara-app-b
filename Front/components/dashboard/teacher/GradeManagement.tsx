'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Plus,
  FileText,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email?: string;
  gender?: string;
}

interface Grade {
  _id?: string;
  studentId: string;
  teacherId?: string;
  classId: string;
  schoolId?: string;
  subject: string;
  evaluationType: string;
  score: number;
  maxScore?: number;
  title: string;
  description?: string;
  comment?: string;
  semester: number;
  academicYear: string;
  coefficient?: number;
  homeworkId?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  studentName?: string; // Pour l'affichage
}

interface Class {
  _id: string;
  name: string;
  level: string;
  section?: string;
}

export function GradeManagement() {
  const { toast } = useToast();
  const router = useRouter();

  // États
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('2023-2024');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showNewGradeDialog, setShowNewGradeDialog] = useState<boolean>(false);
  const [showEditGradeDialog, setShowEditGradeDialog] = useState<boolean>(false);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [subjects, setSubjects] = useState<string[]>([
    'Mathématiques', 'Français', 'Histoire-Géographie', 'Sciences', 'Anglais',
    'Education Physique', 'Arts Plastiques', 'Musique'
  ]);

  // État pour le nouveau formulaire de note
  const [newGrade, setNewGrade] = useState<Grade>({
    studentId: '',
    classId: '',
    subject: '',
    evaluationType: 'devoir',
    score: 0,
    maxScore: 20,
    title: '',
    description: '',
    comment: '',
    semester: 1,
    academicYear: '2023-2024',
    coefficient: 1,
    isPublished: false
  });

  // Fonction pour charger les classes enseignées par le professeur
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/teachers/classes', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setClasses(data.data);
          if (data.data.length > 0) {
            setSelectedClassId(data.data[0]._id);
          }
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger vos classes.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du chargement des données.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [toast]);

  // Charger les élèves lorsqu'une classe est sélectionnée
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/classes/${selectedClassId}/students`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setStudents(data.data);
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les élèves.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des élèves:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClassId, toast]);

  // Charger les notes lorsque les filtres changent
  useEffect(() => {
    const fetchGrades = async () => {
      if (!selectedClassId || !selectedSubject) return;
      
      try {
        setIsLoading(true);
        
        const queryParams = new URLSearchParams({
          classId: selectedClassId,
          subject: selectedSubject,
          semester: selectedSemester.toString(),
          academicYear
        });
        
        const response = await fetch(`/api/grades/class?${queryParams}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          // Ajouter le nom de l'étudiant à chaque note pour faciliter l'affichage
          const gradesWithStudentNames = data.data.grades.map((grade: Grade) => {
            const student = students.find(s => s._id === grade.studentId);
            return {
              ...grade,
              studentName: student ? student.name : 'Inconnu'
            };
          });
          
          setGrades(gradesWithStudentNames);
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les notes.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (students.length > 0) {
      fetchGrades();
    }
  }, [selectedClassId, selectedSubject, selectedSemester, academicYear, students, toast]);

  // Gérer la soumission du formulaire de nouvelle note
  const handleCreateGrade = async () => {
    if (!newGrade.title || !newGrade.studentId || !newGrade.subject || newGrade.score < 0) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsCreating(true);
      
      const gradeData = {
        ...newGrade,
        classId: selectedClassId,
        semester: selectedSemester,
        academicYear,
        subject: selectedSubject || newGrade.subject
      };
      
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(gradeData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Note créée",
          description: "La note a été créée avec succès.",
          variant: "default"
        });
        
        setShowNewGradeDialog(false);
        
        // Réinitialiser le formulaire
        setNewGrade({
          studentId: '',
          classId: '',
          subject: '',
          evaluationType: 'devoir',
          score: 0,
          maxScore: 20,
          title: '',
          description: '',
          comment: '',
          semester: selectedSemester,
          academicYear,
          coefficient: 1,
          isPublished: false
        });
        
        // Rafraîchir la liste des notes
        const updatedGrade = {
          ...data.data,
          studentName: students.find(s => s._id === data.data.studentId)?.name || 'Inconnu'
        };
        
        setGrades(prevGrades => [...prevGrades, updatedGrade]);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur s'est produite lors de la création de la note.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la note.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Gérer la mise à jour d'une note existante
  const handleUpdateGrade = async () => {
    if (!currentGrade || !currentGrade._id) return;
    
    try {
      setIsCreating(true);
      
      const { _id, studentId, classId, teacherId, schoolId, createdAt, updatedAt, ...updateData } = currentGrade;
      
      const response = await fetch(`/api/grades/${_id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Note mise à jour",
          description: "La note a été mise à jour avec succès.",
          variant: "default"
        });
        
        setShowEditGradeDialog(false);
        
        // Mettre à jour la liste des notes
        setGrades(prevGrades => 
          prevGrades.map(grade => 
            grade._id === _id 
              ? { ...data.data, studentName: grade.studentName } 
              : grade
          )
        );
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur s'est produite lors de la mise à jour de la note.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de la note.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Gérer la suppression d'une note
  const handleDeleteGrade = async (gradeId: string) => {
    if (!gradeId) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/grades/${gradeId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Note supprimée",
          description: "La note a été supprimée avec succès.",
          variant: "default"
        });
        
        // Mettre à jour la liste des notes
        setGrades(prevGrades => prevGrades.filter(grade => grade._id !== gradeId));
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur s'est produite lors de la suppression de la note.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de la note.",
        variant: "destructive"
      });
    }
  };

  // Gérer la publication/dépublication d'une note
  const handleTogglePublish = async (gradeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/grades/publish', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          gradeIds: [gradeId],
          isPublished: !currentStatus
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: !currentStatus ? "Note publiée" : "Note dépubliée",
          description: !currentStatus 
            ? "La note est maintenant visible pour l'élève et le parent." 
            : "La note n'est plus visible pour l'élève et le parent.",
          variant: "default"
        });
        
        // Mettre à jour la liste des notes
        setGrades(prevGrades => 
          prevGrades.map(grade => 
            grade._id === gradeId 
              ? { ...grade, isPublished: !currentStatus } 
              : grade
          )
        );
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur s'est produite.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la modification du statut de publication:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du statut de publication.",
        variant: "destructive"
      });
    }
  };

  // Helper pour obtenir le libellé du type d'évaluation
  const getEvaluationTypeLabel = (type: string) => {
    switch (type) {
      case 'devoir': return 'Devoir';
      case 'examen': return 'Examen';
      case 'projet': return 'Projet';
      case 'presentation': return 'Présentation';
      case 'participation': return 'Participation';
      case 'autre': return 'Autre';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Notes</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Créez, modifiez et gérez les notes de vos élèves
          </p>
        </div>
        <Button 
          onClick={() => {
            if (!selectedClassId || !selectedSubject) {
              toast({
                title: "Sélection incomplète",
                description: "Veuillez d'abord sélectionner une classe et une matière.",
                variant: "destructive"
              });
              return;
            }
            setShowNewGradeDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Note
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Classe</Label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Matière</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="semester">Semestre</Label>
              <Select
                value={selectedSemester.toString()}
                onValueChange={(value) => setSelectedSemester(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un semestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semestre 1</SelectItem>
                  <SelectItem value="2">Semestre 2</SelectItem>
                  <SelectItem value="3">Semestre 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="evaluationType">Type d'évaluation</Label>
              <Select
                value={selectedEvaluationType}
                onValueChange={setSelectedEvaluationType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  <SelectItem value="devoir">Devoir</SelectItem>
                  <SelectItem value="examen">Examen</SelectItem>
                  <SelectItem value="projet">Projet</SelectItem>
                  <SelectItem value="presentation">Présentation</SelectItem>
                  <SelectItem value="participation">Participation</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedClassId && selectedSubject 
              ? `Notes - ${selectedSubject} - ${classes.find(c => c._id === selectedClassId)?.name || ''} - Semestre ${selectedSemester}`
              : 'Sélectionnez une classe et une matière'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : !selectedClassId || !selectedSubject ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Aucune sélection</AlertTitle>
              <AlertDescription>
                Veuillez sélectionner une classe et une matière pour afficher les notes.
              </AlertDescription>
            </Alert>
          ) : grades.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Aucune note</AlertTitle>
              <AlertDescription>
                Aucune note n'a été trouvée pour cette classe, cette matière et ce semestre.
                Cliquez sur "Nouvelle Note" pour commencer à ajouter des notes.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Note</TableHead>
                    <TableHead>Coef.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades
                    .filter(grade => !selectedEvaluationType || grade.evaluationType === selectedEvaluationType)
                    .map((grade) => (
                    <TableRow key={grade._id}>
                      <TableCell className="font-medium">{grade.studentName}</TableCell>
                      <TableCell>{grade.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEvaluationTypeLabel(grade.evaluationType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">{grade.score}</span>
                        <span className="text-muted-foreground">/{grade.maxScore}</span>
                      </TableCell>
                      <TableCell>{grade.coefficient}</TableCell>
                      <TableCell>
                        {grade.createdAt && new Date(grade.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={grade.isPublished 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }
                          onClick={() => handleTogglePublish(grade._id as string, grade.isPublished || false)}
                        >
                          {grade.isPublished ? "Publié" : "Non publié"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCurrentGrade(grade);
                            setShowEditGradeDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteGrade(grade._id as string)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour nouvelle note */}
      <Dialog open={showNewGradeDialog} onOpenChange={setShowNewGradeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle note</DialogTitle>
            <DialogDescription>
              Entrez les détails de la note pour l'élève sélectionné.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Élève</Label>
              <Select
                value={newGrade.studentId}
                onValueChange={(value) => setNewGrade({...newGrade, studentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un élève" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'évaluation</Label>
              <Input 
                id="title" 
                value={newGrade.title}
                onChange={(e) => setNewGrade({...newGrade, title: e.target.value})}
                placeholder="Ex: Contrôle sur les fractions" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evaluationType">Type d'évaluation</Label>
                <Select
                  value={newGrade.evaluationType}
                  onValueChange={(value) => setNewGrade({...newGrade, evaluationType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devoir">Devoir</SelectItem>
                    <SelectItem value="examen">Examen</SelectItem>
                    <SelectItem value="projet">Projet</SelectItem>
                    <SelectItem value="presentation">Présentation</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coefficient">Coefficient</Label>
                <Select
                  value={newGrade.coefficient?.toString()}
                  onValueChange={(value) => setNewGrade({...newGrade, coefficient: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Coefficient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Note obtenue</Label>
                <Input 
                  id="score" 
                  type="number"
                  value={newGrade.score}
                  onChange={(e) => setNewGrade({...newGrade, score: parseFloat(e.target.value)})}
                  min="0"
                  max={newGrade.maxScore}
                  step="0.5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxScore">Note maximale</Label>
                <Input 
                  id="maxScore" 
                  type="number"
                  value={newGrade.maxScore}
                  onChange={(e) => setNewGrade({...newGrade, maxScore: parseFloat(e.target.value)})}
                  min="1"
                  step="1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (facultatif)</Label>
              <Textarea 
                id="description" 
                value={newGrade.description}
                onChange={(e) => setNewGrade({...newGrade, description: e.target.value})}
                placeholder="Description détaillée de l'évaluation" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire (facultatif)</Label>
              <Textarea 
                id="comment" 
                value={newGrade.comment}
                onChange={(e) => setNewGrade({...newGrade, comment: e.target.value})}
                placeholder="Commentaire sur la performance de l'élève" 
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPublished" 
                checked={newGrade.isPublished}
                onCheckedChange={(checked) => 
                  setNewGrade({...newGrade, isPublished: checked as boolean})
                }
              />
              <label
                htmlFor="isPublished"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Publier immédiatement (visible par l'élève et le parent)
              </label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewGradeDialog(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateGrade}
                disabled={isCreating}
              >
                {isCreating ? <LoadingSpinner size="sm" /> : 'Créer la note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier une note */}
      <Dialog open={showEditGradeDialog} onOpenChange={setShowEditGradeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la note</DialogTitle>
            <DialogDescription>
              Modifiez les détails de la note pour {currentGrade?.studentName}.
            </DialogDescription>
          </DialogHeader>
          
          {currentGrade && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Titre de l'évaluation</Label>
                <Input 
                  id="editTitle" 
                  value={currentGrade.title}
                  onChange={(e) => setCurrentGrade({...currentGrade, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editEvaluationType">Type d'évaluation</Label>
                  <Select
                    value={currentGrade.evaluationType}
                    onValueChange={(value) => setCurrentGrade({...currentGrade, evaluationType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="devoir">Devoir</SelectItem>
                      <SelectItem value="examen">Examen</SelectItem>
                      <SelectItem value="projet">Projet</SelectItem>
                      <SelectItem value="presentation">Présentation</SelectItem>
                      <SelectItem value="participation">Participation</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editCoefficient">Coefficient</Label>
                  <Select
                    value={currentGrade.coefficient?.toString()}
                    onValueChange={(value) => setCurrentGrade({...currentGrade, coefficient: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editScore">Note obtenue</Label>
                  <Input 
                    id="editScore" 
                    type="number"
                    value={currentGrade.score}
                    onChange={(e) => setCurrentGrade({...currentGrade, score: parseFloat(e.target.value)})}
                    min="0"
                    max={currentGrade.maxScore}
                    step="0.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editMaxScore">Note maximale</Label>
                  <Input 
                    id="editMaxScore" 
                    type="number"
                    value={currentGrade.maxScore}
                    onChange={(e) => setCurrentGrade({...currentGrade, maxScore: parseFloat(e.target.value)})}
                    min="1"
                    step="1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea 
                  id="editDescription" 
                  value={currentGrade.description || ''}
                  onChange={(e) => setCurrentGrade({...currentGrade, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editComment">Commentaire</Label>
                <Textarea 
                  id="editComment" 
                  value={currentGrade.comment || ''}
                  onChange={(e) => setCurrentGrade({...currentGrade, comment: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="editIsPublished" 
                  checked={currentGrade.isPublished}
                  onCheckedChange={(checked) => 
                    setCurrentGrade({...currentGrade, isPublished: checked as boolean})
                  }
                />
                <label
                  htmlFor="editIsPublished"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Publier (visible par l'élève et le parent)
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditGradeDialog(false)}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleUpdateGrade}
                  disabled={isCreating}
                >
                  {isCreating ? <LoadingSpinner size="sm" /> : 'Mettre à jour'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}