'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, Upload, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Assessment {
  _id?: string;
  id?: string;
  title: string;
  class?: string;
  classId: string;
  subject: string;
  type: 'devoir' | 'controle' | 'oral' | 'projet';
  date: string;
  totalStudents: number;
  gradedStudents: number;
  averageGrade: number;
  status: 'pending' | 'inProgress' | 'completed';
  semester: number;
  academicYear: string;
  description?: string;
}

interface Class {
  _id: string;
  name: string;
  level: string;
  section?: string;
}

interface Student {
  _id: string;
  name: string;
  email?: string;
  grade?: number;
  comment?: string;
  graded?: boolean;
}

interface GradeInput {
  studentId: string;
  score: number;
  comment?: string;
}

export function GradesAssessment() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [studentsToGrade, setStudentsToGrade] = useState<Student[]>([]);
  const [gradesInput, setGradesInput] = useState<{[studentId: string]: GradeInput}>({});
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<string>('2025-2026');
  const [newAssessment, setNewAssessment] = useState<Partial<Assessment>>({
    title: '',
    classId: '',
    subject: '',
    type: 'controle',
    date: new Date().toISOString().split('T')[0],
    semester: 1,
    academicYear: '2025-2026',
    description: ''
  });
  const { toast } = useToast();

  // Charger les classes de l'enseignant
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        setIsLoading(true);
        // Utilisons l'API correcte pour récupérer les classes associées au professeur connecté
        const response = await fetch('http://localhost:5000/api/teachers/classes', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          console.log('Classes chargées:', data.data);
          // Assurons-nous que nous avons bien des classes avec les bonnes propriétés
          setClasses(data.data.map((cls: any) => ({
            _id: cls._id,
            name: cls.name || `${cls.level} ${cls.section || ''}`,
            level: cls.level || '',
            section: cls.section || '',
            studentCount: cls.students?.length || cls.studentCount || 0
          })));
        } else {
          console.warn('Aucune classe trouvée pour cet enseignant:', data.message);
          toast({
            title: "Information",
            description: "Aucune classe n'est assignée à votre compte.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
        toast({
          title: "Erreur",
          description: "Impossible de se connecter au serveur pour charger vos classes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [toast]);
  
  // Charger les matières de l'enseignant
  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teachers/subjects', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          console.log('Matières chargées:', data.data);
          // Si l'API renvoie un tableau de matières
          setSubjects(data.data);
        } else {
          // En cas d'échec, on met des matières par défaut
          setSubjects(['Mathématiques', 'Français', 'Histoire-Géographie', 'Sciences', 'Anglais']);
          console.warn('Impossible de charger les matières, utilisation des valeurs par défaut');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des matières:', error);
        // En cas d'erreur, on met des matières par défaut
        setSubjects(['Mathématiques', 'Français', 'Histoire-Géographie', 'Sciences', 'Anglais']);
      }
    };

    fetchTeacherSubjects();
  }, []);

  // Charger les évaluations de l'enseignant
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/grades/teacher/assessments', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          console.log('Évaluations chargées:', data.data);
          // Transformez les données pour les adapter à l'interface Assessment
          const formattedAssessments = data.data.map((assessment: any) => ({
            _id: assessment._id,
            id: assessment._id, // Pour la compatibilité avec l'interface
            title: assessment.title,
            class: assessment.className || assessment.class?.name || 'N/A',
            classId: assessment.classId || assessment.class?._id,
            subject: assessment.subject,
            type: assessment.evaluationType || assessment.type,
            date: assessment.evaluationDate || assessment.date,
            totalStudents: assessment.totalStudents || assessment.class?.students?.length || 0,
            gradedStudents: assessment.gradedStudents || 0,
            averageGrade: assessment.averageGrade || 0,
            status: assessment.status || 'pending',
            semester: assessment.semester || 1,
            academicYear: assessment.academicYear || '2025-2026',
            description: assessment.description || ''
          }));
          
          setAssessments(formattedAssessments);
        } else {
          console.warn('Échec du chargement des évaluations:', data.message || 'Aucun message d\'erreur');
          setAssessments([]);
          toast({
            title: "Remarque",
            description: "Aucune évaluation trouvée ou problème de chargement.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des évaluations:', error);
        setAssessments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (classes.length > 0) {
      fetchAssessments();
    } else {
      // Même si nous n'avons pas encore de classes, essayons quand même de récupérer les évaluations
      // Cela pourrait être utile si l'API ne filtre pas par classe côté serveur
      fetchAssessments();
    }
  }, [classes, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'inProgress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'inProgress': return 'En cours';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'devoir': return 'Devoir';
      case 'controle': return 'Contrôle';
      case 'oral': return 'Oral';
      case 'projet': return 'Projet';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'devoir': return 'bg-blue-100 text-blue-800';
      case 'controle': return 'bg-purple-100 text-purple-800';
      case 'oral': return 'bg-orange-100 text-orange-800';
      case 'projet': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrer les évaluations en fonction des critères sélectionnés
  const filteredAssessments = assessments.filter(assessment => {
    const matchesClass = selectedClassFilter === 'all' || assessment.classId === selectedClassFilter;
    const matchesType = selectedTypeFilter === 'all' || assessment.type === selectedTypeFilter;
    const matchesSearch = searchQuery === '' || 
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      assessment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesClass && matchesType && matchesSearch;
  });

  // Charger les étudiants pour une évaluation spécifique
  const loadStudentsForGrading = async (assessmentId: string) => {
    try {
      setIsLoading(true);
      console.log('Chargement des étudiants pour l\'évaluation ID:', assessmentId);
      
      // Utiliser l'API correcte pour récupérer les étudiants d'une classe spécifique
      const assessment = assessments.find(a => a._id === assessmentId || a.id === assessmentId);
      if (!assessment) {
        throw new Error("Évaluation non trouvée");
      }
      
      // Récupérer les étudiants de la classe
      const response = await fetch(`http://localhost:5000/api/classes/${assessment.classId}/students`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        }
      });
      
      const data = await response.json();
      console.log('Réponse de l\'API pour les étudiants:', data);
      
      if (data.success) {
        // Transformer les données pour correspondre à l'interface Student
        const students = data.data.map((student: any) => ({
          _id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          grade: 0, // Par défaut, pas de note
          comment: '',
          graded: false
        }));
        
        // Ensuite, récupérer les notes existantes pour cette évaluation
        try {
          const gradesResponse = await fetch(`http://localhost:5000/api/grades/assessment/${assessmentId}/grades`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
            }
          });
          
          const gradesData = await gradesResponse.json();
          console.log('Notes existantes:', gradesData);
          
          if (gradesData.success && gradesData.data && gradesData.data.length > 0) {
            // Mettre à jour les notes et commentaires des étudiants
            gradesData.data.forEach((grade: any) => {
              const studentIndex = students.findIndex((s: Student) => s._id === grade.studentId);
              if (studentIndex !== -1) {
                students[studentIndex].grade = grade.score;
                students[studentIndex].comment = grade.comment || '';
                students[studentIndex].graded = true;
              }
            });
          }
        } catch (gradeError) {
          console.error('Erreur lors de la récupération des notes existantes:', gradeError);
        }
        
        setStudentsToGrade(students);
        
        // Initialiser les entrées de notes
        const initialGradesInput: {[studentId: string]: GradeInput} = {};
        students.forEach((student: Student) => {
          initialGradesInput[student._id] = {
            studentId: student._id,
            score: student.grade || 0,
            comment: student.comment || ''
          };
        });
        
        setGradesInput(initialGradesInput);
      } else {
        console.warn('Échec du chargement des étudiants:', data.message);
        toast({
          title: "Erreur",
          description: "Impossible de charger les étudiants de cette classe.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement des étudiants.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la soumission des notes
  const handleSubmitGrades = async () => {
    if (!selectedAssessment) return;
    
    setIsSubmitting(true);
    console.log('Soumission des notes pour l\'évaluation:', selectedAssessment);
    console.log('Données de notes à soumettre:', gradesInput);
    
    try {
      const gradesToSubmit = Object.values(gradesInput).filter(grade => grade.score > 0);
      
      if (gradesToSubmit.length === 0) {
        toast({
          title: "Attention",
          description: "Aucune note à soumettre.",
          variant: "default"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('Notes filtrées à soumettre:', gradesToSubmit);
      
      // Utiliser l'URL correcte pour soumettre les notes
      const response = await fetch(`http://localhost:5000/api/grades/assessment/${selectedAssessment._id || selectedAssessment.id}/grades`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify({
          grades: gradesToSubmit,
          assessmentId: selectedAssessment._id || selectedAssessment.id
        })
      });
      
      const data = await response.json();
      console.log('Réponse du serveur pour la soumission des notes:', data);
      
      if (data.success) {
        toast({
          title: "Notes soumises",
          description: `${gradesToSubmit.length} note(s) ont été enregistrées avec succès.`,
        });
        
        // Mettre à jour la liste des évaluations
        const updatedAssessments = assessments.map(assessment => {
          if (assessment._id === selectedAssessment._id || assessment.id === selectedAssessment.id) {
            const gradedCount = gradesToSubmit.length;
            const newGradedStudents = assessment.gradedStudents + gradedCount;
            const newStatus = assessment.totalStudents === newGradedStudents 
              ? 'completed' 
              : 'inProgress';
            
            return {
              ...assessment,
              gradedStudents: newGradedStudents,
              status: newStatus,
              averageGrade: data.data?.averageGrade || assessment.averageGrade
            };
          }
          return assessment;
        });
        
        setAssessments(updatedAssessments);
        setShowGradeDialog(false);
      } else {
        console.error('Erreur lors de la soumission des notes:', data.message);
        toast({
          title: "Erreur",
          description: data.message || "Une erreur s'est produite lors de la soumission des notes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission des notes:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la communication avec le serveur.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Créer une nouvelle évaluation
  const handleCreateAssessment = async () => {
    console.log('Tentative de création d\'évaluation avec:', newAssessment);
    
    if (!newAssessment.title || !newAssessment.classId || !newAssessment.subject) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedClass = classes.find(c => c._id === newAssessment.classId);
      console.log('Classe sélectionnée:', selectedClass);
      
      // Préparer les données en suivant le format attendu par l'API
      const assessmentData = {
        title: newAssessment.title,
        classId: newAssessment.classId,
        subject: newAssessment.subject,
        evaluationType: newAssessment.type, // Utiliser evaluationType au lieu de type
        date: newAssessment.date,
        semester: newAssessment.semester,
        academicYear: newAssessment.academicYear,
        description: newAssessment.description,
        // Ajouter ces infos pour le suivi
        totalStudents: selectedClass ? selectedClass.studentCount || 0 : 0,
        gradedStudents: 0,
        averageGrade: 0,
        status: 'pending'
      };
      
      console.log('Données à envoyer:', assessmentData);
      
      // Utiliser la bonne URL pour l'API
      const response = await fetch('http://localhost:5000/api/grades/assessment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify(assessmentData)
      });
      
      const data = await response.json();
      console.log('Réponse du serveur:', data);
      
      if (data.success) {
        toast({
          title: "Évaluation créée",
          description: "L'évaluation a été créée avec succès.",
        });
        
        // Ajouter la nouvelle évaluation à la liste
        const newAssessmentWithId = {
          ...assessmentData,
          _id: data.data._id,
          id: data.data._id,
          class: selectedClass ? selectedClass.name : 'N/A',
          type: assessmentData.evaluationType,
        } as Assessment;
        
        setAssessments([...assessments, newAssessmentWithId]);
        
        // Réinitialiser le formulaire et fermer la boîte de dialogue
        setNewAssessment({
          title: '',
          classId: '',
          subject: '',
          type: 'controle',
          date: new Date().toISOString().split('T')[0],
          semester: currentSemester,
          academicYear: currentAcademicYear,
          description: ''
        });
        
        setShowCreateDialog(false);
      } else {
        console.error('Erreur lors de la création de l\'évaluation:', data.message);
        toast({
          title: "Erreur",
          description: data.message || "Une erreur s'est produite lors de la création de l'évaluation.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la communication avec le serveur.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Notes & Évaluations</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les évaluations et saisissez les notes de vos étudiants
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Évaluation
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une évaluation..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select 
              value={selectedClassFilter}
              onValueChange={setSelectedClassFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedTypeFilter}
              onValueChange={setSelectedTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="devoir">Devoir</SelectItem>
                <SelectItem value="controle">Contrôle</SelectItem>
                <SelectItem value="oral">Oral</SelectItem>
                <SelectItem value="projet">Projet</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedClassFilter('all');
                setSelectedTypeFilter('all');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredAssessments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune évaluation trouvée</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Vous n&apos;avez pas encore créé d&apos;évaluation ou aucune ne correspond aux critères de recherche.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une évaluation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment._id || assessment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div>
                    <CardTitle className="text-lg">{assessment.title}</CardTitle>
                    <CardDescription className="flex items-center flex-wrap gap-2 mt-1">
                      <Badge variant="outline">{assessment.class}</Badge>
                      <Badge variant="outline">{assessment.subject}</Badge>
                      <Badge className={getTypeColor(assessment.type)}>
                        {getTypeLabel(assessment.type)}
                      </Badge>
                      <Badge className={getStatusColor(assessment.status)}>
                        {getStatusLabel(assessment.status)}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(assessment.date)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression de la correction</span>
                      <span>{assessment.gradedStudents}/{assessment.totalStudents}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(assessment.gradedStudents / assessment.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-700">
                        {assessment.totalStudents}
                      </div>
                      <div className="text-xs text-blue-600">Étudiants</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-700">
                        {assessment.gradedStudents}
                      </div>
                      <div className="text-xs text-yellow-600">Corrigés</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-semibold text-red-700">
                        {assessment.totalStudents - assessment.gradedStudents}
                      </div>
                      <div className="text-xs text-red-600">En attente</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-700">
                        {assessment.averageGrade > 0 ? `${assessment.averageGrade.toFixed(1)}/20` : '--'}
                      </div>
                      <div className="text-xs text-green-600">Moyenne</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        loadStudentsForGrading(assessment._id || assessment.id || '');
                        setShowGradeDialog(true);
                      }}
                    >
                      Saisir Notes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Exporter
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      Importer
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Statistiques
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog pour saisir les notes */}
      <Dialog 
        open={showGradeDialog} 
        onOpenChange={setShowGradeDialog}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saisie des notes</DialogTitle>
            <DialogDescription>
              {selectedAssessment && (
                <span>
                  {selectedAssessment.title} - {selectedAssessment.class}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : studentsToGrade.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>Aucun étudiant trouvé pour cette évaluation.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Étudiant</TableHead>
                    <TableHead className="w-[20%] text-center">Note/20</TableHead>
                    <TableHead className="w-[40%]">Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsToGrade.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input 
                          type="number" 
                          min="0" 
                          max="20" 
                          step="0.5"
                          className="w-20 mx-auto text-center"
                          value={gradesInput[student._id]?.score || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setGradesInput({
                              ...gradesInput,
                              [student._id]: {
                                ...gradesInput[student._id],
                                studentId: student._id,
                                score: value
                              }
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="Commentaire (optionnel)"
                          value={gradesInput[student._id]?.comment || ''}
                          onChange={(e) => {
                            setGradesInput({
                              ...gradesInput,
                              [student._id]: {
                                ...gradesInput[student._id],
                                studentId: student._id,
                                comment: e.target.value
                              }
                            });
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowGradeDialog(false)}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmitGrades}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Enregistrer les notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour créer une évaluation */}
      <Dialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvelle évaluation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle évaluation pour vos élèves.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l&apos;évaluation</Label>
              <Input 
                id="title"
                value={newAssessment.title}
                onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                placeholder="Ex: Contrôle sur les fractions"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Classe</Label>
                <Select
                  value={newAssessment.classId}
                  onValueChange={(value) => setNewAssessment({...newAssessment, classId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
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
                  value={newAssessment.subject}
                  onValueChange={(value) => setNewAssessment({...newAssessment, subject: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type d&apos;évaluation</Label>
                <Select
                  value={newAssessment.type}
                  onValueChange={(value: 'devoir' | 'controle' | 'oral' | 'projet') => 
                    setNewAssessment({...newAssessment, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devoir">Devoir</SelectItem>
                    <SelectItem value="controle">Contrôle</SelectItem>
                    <SelectItem value="oral">Oral</SelectItem>
                    <SelectItem value="projet">Projet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date de l&apos;évaluation</Label>
                <Input 
                  id="date"
                  type="date"
                  value={newAssessment.date}
                  onChange={(e) => setNewAssessment({...newAssessment, date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semestre</Label>
                <Select
                  value={newAssessment.semester?.toString()}
                  onValueChange={(value) => setNewAssessment({...newAssessment, semester: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semestre 1</SelectItem>
                    <SelectItem value="2">Semestre 2</SelectItem>
                    <SelectItem value="3">Semestre 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Année académique</Label>
                <Select
                  value={newAssessment.academicYear}
                  onValueChange={(value) => setNewAssessment({...newAssessment, academicYear: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea 
                id="description"
                value={newAssessment.description}
                onChange={(e) => setNewAssessment({...newAssessment, description: e.target.value})}
                placeholder="Description de l'évaluation"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateAssessment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Créer l&apos;évaluation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
