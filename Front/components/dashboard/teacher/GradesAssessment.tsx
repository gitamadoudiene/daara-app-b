'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, Upload, Filter, AlertCircle, CheckCircle, Trash2, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolDefaults } from '@/hooks/useSchoolDefaults';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EvaluationStats } from './EvaluationStats';
import { SEMESTER_OPTIONS, ACADEMIC_YEAR_OPTIONS } from '@/lib/academicOptions';
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
  type: 'devoir' | 'controle' | 'oral' | 'projet' | 'examen' | 'presentation' | 'composition';
  date: string;
  totalStudents: number;
  gradedStudents: number;
  averageGrade: number;
  status: 'pending' | 'inProgress' | 'completed';
  semester: number;
  academicYear: string;
  description?: string;
  coefficient?: number;
  maxScore?: number;
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
  isAbsent?: boolean;
}

export function GradesAssessment() {
  // Fonction utilitaire pour mapper les types serveur vers frontend
  const mapServerTypeToFrontend = (serverType: string): 'devoir' | 'controle' | 'oral' | 'projet' | 'examen' | 'presentation' | 'composition' => {
    const serverToFrontendTypeMapping: {[key: string]: 'devoir' | 'controle' | 'oral' | 'projet' | 'examen' | 'presentation' | 'composition'} = {
      'devoir': 'devoir',
      'controle': 'controle', 
      'examen': 'composition', // Les compositions sont stockées comme "examen" côté serveur
      'presentation': 'oral',
      'projet': 'projet',
      'oral': 'oral'
    };
    
    return serverToFrontendTypeMapping[serverType] || 'devoir';
  };

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [studentsToGrade, setStudentsToGrade] = useState<Student[]>([]);
  const [gradesInput, setGradesInput] = useState<{[studentId: string]: GradeInput}>({});
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<string>('2025-2026');
  
  // Hook pour récupérer les paramètres par défaut de l'école
  const { 
    schoolSettings, 
    getDefaultCoefficient: getSchoolDefaultCoefficient, 
    getClassLevel, 
    isLoading: isLoadingDefaults,
    refreshSettings
  } = useSchoolDefaults();
  
  // États pour la validation du formulaire
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  
  const [newAssessment, setNewAssessment] = useState<Partial<Assessment>>({
    title: '',
    classId: '',
    subject: '',
    type: 'controle',
    date: new Date().toISOString().split('T')[0],
    semester: 1, // Valeur par défaut temporaire
    academicYear: '2025-2026', // Valeur par défaut temporaire
    description: '',
    coefficient: 1,
    maxScore: 20
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
  
  // Initialiser les paramètres par défaut quand schoolSettings est chargé
  useEffect(() => {
    if (!isLoadingDefaults && schoolSettings) {
      // Mettre à jour newAssessment avec les valeurs par défaut de l'école
      setNewAssessment(prev => ({
        ...prev,
        semester: schoolSettings.defaultSemester,
        academicYear: schoolSettings.defaultAcademicYear
      }));
      
      // Mettre à jour les états globaux
      setCurrentSemester(schoolSettings.defaultSemester);
      setCurrentAcademicYear(schoolSettings.defaultAcademicYear);
    }
  }, [isLoadingDefaults, schoolSettings]);

  // Charger les évaluations de l'enseignant
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        // Utiliser le nouveau endpoint des évaluations
        const response = await fetch('http://localhost:5000/api/evaluations/teacher', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          console.log('Évaluations chargées:', data.data);
          console.log('Première évaluation complète:', data.data[0]);
          
          // Transformer les données du nouveau système pour l'interface existante
          const formattedAssessments = data.data.map((evaluation: any) => {
            console.log('Mapping évaluation:', {
              id: evaluation._id,
              title: evaluation.title,
              subjectId: evaluation.subjectId,
              subjectName: evaluation.subjectId?.name,
              subject: evaluation.subject,
              stats: evaluation.stats // ← Ajouter les stats dans le log
            });
            
            // Mapper les types du serveur vers les types d'interface
            const mappedType = mapServerTypeToFrontend(evaluation.type);
            
            return {
              _id: evaluation._id,
              id: evaluation._id,
              title: evaluation.title,
              class: evaluation.classId?.name || 'N/A',
              classId: evaluation.classId?._id || evaluation.classId,
              subject: evaluation.subjectId?.name || evaluation.subject || 'N/A',
              type: mappedType, // Utiliser le type mappé pour l'interface
              date: evaluation.plannedDate,
              totalStudents: evaluation.stats?.totalStudents || evaluation.classId?.students?.length || 0,
              gradedStudents: evaluation.stats?.submittedGrades || evaluation.submittedGrades || 0,
              averageGrade: evaluation.stats?.averageScore || evaluation.averageScore || 0,
              status: evaluation.status === 'programmee' ? 'pending' : 
                      evaluation.status === 'en_cours' ? 'inProgress' : 'completed',
              semester: evaluation.semester || 1,
              academicYear: evaluation.academicYear || '2025-2026',
              description: evaluation.description || ''
            };
          });
          
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
      case 'examen': return 'Examen';
      case 'presentation': return 'Présentation';
      case 'composition': return 'Composition';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'devoir': return 'bg-blue-100 text-blue-800';
      case 'controle': return 'bg-purple-100 text-purple-800';
      case 'oral': return 'bg-orange-100 text-orange-800';
      case 'projet': return 'bg-green-100 text-green-800';
      case 'examen': return 'bg-red-100 text-red-800';
      case 'presentation': return 'bg-yellow-100 text-yellow-800';
      case 'composition': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setNewAssessment({
      title: '',
      classId: '',
      subject: '',
      type: 'devoir',
      date: new Date().toISOString().split('T')[0],
      semester: 1,
      academicYear: '2025-2026',
      description: '',
      coefficient: 1,
      maxScore: 20
    });
    setFormErrors({});
    setIsFormValid(false);
  };

  // Fonction de validation du formulaire
  const validateForm = (assessmentData: Partial<Assessment>) => {
    const errors: {[key: string]: string} = {};

    if (!assessmentData.title || assessmentData.title.trim() === '') {
      errors.title = 'Le titre de l\'évaluation est obligatoire';
    } else if (assessmentData.title.trim().length < 3) {
      errors.title = 'Le titre doit contenir au moins 3 caractères';
    } else if (assessmentData.title.trim().length > 100) {
      errors.title = 'Le titre ne peut pas dépasser 100 caractères';
    }

    if (!assessmentData.classId || assessmentData.classId === '') {
      errors.classId = 'La sélection d\'une classe est obligatoire';
    }

    if (!assessmentData.subject || assessmentData.subject.trim() === '') {
      errors.subject = 'La sélection d\'une matière est obligatoire';
    }

    if (!assessmentData.type) {
      errors.type = 'Le type d\'évaluation est obligatoire';
    }

    if (!assessmentData.date || assessmentData.date === '') {
      errors.date = 'La date de l\'évaluation est obligatoire';
    } else {
      const selectedDate = new Date(assessmentData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'La date ne peut pas être antérieure à aujourd\'hui';
      }
    }

    if (!assessmentData.semester || (assessmentData.semester !== 1 && assessmentData.semester !== 2)) {
      errors.semester = 'Le semestre doit être 1 ou 2';
    }

    if (!assessmentData.academicYear || assessmentData.academicYear.trim() === '') {
      errors.academicYear = 'L\'année académique est obligatoire';
    }

    // Description optionnelle mais si présente, elle doit être raisonnable
    if (assessmentData.description && assessmentData.description.length > 500) {
      errors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    return errors;
  };

  // Mettre à jour la validation quand les données changent
  const updateFormData = (field: string, value: any) => {
    const updatedAssessment = { ...newAssessment, [field]: value };
    setNewAssessment(updatedAssessment);
    
    // Récupérer automatiquement le coefficient quand la classe ou la matière change
    if (field === 'classId' && updatedAssessment.subject) {
      getDefaultCoefficient(value, updatedAssessment.subject);
    } else if (field === 'subject' && updatedAssessment.classId) {
      getDefaultCoefficient(updatedAssessment.classId, value);
    }
    
    // Valider en temps réel
    const errors = validateForm(updatedAssessment);
    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  // Récupérer le coefficient par défaut basé sur le niveau de classe et la matière
  const getDefaultCoefficient = async (classId: string, subject: string) => {
    try {
      if (!classId || !subject) {
        return;
      }
      
      const classData = classes.find(c => c._id === classId);
      if (!classData) {
        return;
      }
      
      const coefficient = getSchoolDefaultCoefficient(subject, classData.level);
      
      if (coefficient > 1) { // Seulement si on a trouvé un coefficient configuré
        setNewAssessment(prev => {
          const updated = { ...prev, coefficient };
          return updated;
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du coefficient par défaut:', error);
    }
  };

  // Charger les paramètres par défaut pour le semestre et l'année académique
  const loadDefaultSettings = () => {
    // Utiliser les paramètres du hook schoolSettings
    return {
      semester: schoolSettings.defaultSemester,
      academicYear: schoolSettings.defaultAcademicYear
    };
  };

  // Initialiser les paramètres par défaut lors de l'ouverture du formulaire
  const initializeFormWithDefaults = () => {
    const defaults = loadDefaultSettings();
    setNewAssessment(prev => ({
      ...prev,
      semester: defaults.semester,
      academicYear: defaults.academicYear
    }));
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
      
      // Utiliser l'API correcte pour récupérer les étudiants d'une classe spécifique
      const assessment = assessments.find(a => a._id === assessmentId || a.id === assessmentId);
      if (!assessment) {
        throw new Error("Évaluation non trouvée");
      }
      
      // Récupérer les étudiants de la classe directement depuis l'endpoint d'évaluation
      const response = await fetch(`http://localhost:5000/api/evaluations/${assessmentId}/students`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        }
      });
      
      const data = await response.json();
      
      console.log('=== FRONTEND RESPONSE ===');
      console.log('Raw API response:', data);
      console.log('Students array received:', data.data);
      
      if (data.success) {
        // Vérifier le format des données et s'adapter en conséquence
        let studentsArray = [];
        
        if (Array.isArray(data.data)) {
          studentsArray = data.data;
        } else if (data.data && typeof data.data === 'object') {
          // Si data.data est un objet, chercher les étudiants dans ses propriétés
          if (data.data.students && Array.isArray(data.data.students)) {
            studentsArray = data.data.students;
          } else if (data.data.evaluation && data.data.evaluation.students && Array.isArray(data.data.evaluation.students)) {
            studentsArray = data.data.evaluation.students;
          } else {
            throw new Error('Format de données inattendu pour les étudiants');
          }
        } else if (data.students && Array.isArray(data.students)) {
          studentsArray = data.students;
        } else {
          throw new Error('Aucun tableau d\'étudiants trouvé');
        }
        
        // Transformer les données pour correspondre à l'interface Student
        const students = studentsArray.map((student: any) => {
          // Mapping robuste avec vérification des champs
          const studentName = student.name || 
                             student.fullName || 
                             (student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : '') ||
                             'Nom manquant';
                             
          return {
            _id: student._id || student.id,
            name: studentName,
            email: student.email,
            grade: student.grade || 0, // Récupérer la note existante
            comment: student.comment || '',
            isAbsent: student.isAbsent || false, // Récupérer le statut d'absence
            graded: student.graded || false // Savoir si l'étudiant a déjà été noté
          };
        });
        
        console.log('=== STUDENTS TRANSFORMED ===');
        console.log('Final students array:', students);
        console.log('First student with grades:', students[0]);
        
        setStudentsToGrade(students);
        
        // Initialiser les entrées de notes avec les données existantes
        const initialGradesInput: {[studentId: string]: GradeInput} = {};
        students.forEach((student: Student) => {
          initialGradesInput[student._id] = {
            studentId: student._id,
            score: student.grade || 0, // Utiliser la note existante
            comment: student.comment || '',
            isAbsent: student.isAbsent || false // Utiliser le statut d'absence existant
          };
        });
        
        setGradesInput(initialGradesInput);
      } else {
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
    if (!selectedAssessment) {
      console.error('❌ Aucune évaluation sélectionnée');
      return;
    }
    
    console.log('🚀 DÉBUT SOUMISSION NOTES');
    console.log('📝 Évaluation sélectionnée:', selectedAssessment);
    console.log('👥 Étudiants à noter:', studentsToGrade.length);
    console.log('📊 Données de saisie complètes:', gradesInput);
    
    setIsSubmitting(true);
    
    try {
      // Inclure toutes les notes (même les 0 et les absents)
      const gradesToSubmit = Object.values(gradesInput).filter(grade => 
        grade.score > 0 || grade.isAbsent
      );
      
      console.log('=== FRONTEND SUBMIT GRADES ===');
      console.log('Evaluation ID:', selectedAssessment._id || selectedAssessment.id);
      console.log('Grades input (TOUT):', gradesInput);
      console.log('Grades to submit (FILTRÉES):', gradesToSubmit);
      console.log('📊 Analyse du filtrage:');
      console.log('  - Notes avec score > 0:', Object.values(gradesInput).filter(g => g.score > 0).length);
      console.log('  - Notes marquées absentes:', Object.values(gradesInput).filter(g => g.isAbsent).length);
      console.log('  - Notes retenues pour soumission:', gradesToSubmit.length);
      
      if (gradesToSubmit.length === 0) {
        console.warn('⚠️ Aucune note à soumettre après filtrage');
        toast({
          title: "⚠️ Aucune note à enregistrer",
          description: "Veuillez saisir au moins une note ou marquer des absences.",
          variant: "default"
        });
        setIsSubmitting(false);
        return;
      }

      // Validation des notes
      const invalidGrades = gradesToSubmit.filter(grade => 
        !grade.isAbsent && (grade.score < 0 || grade.score > 20)
      );
      
      if (invalidGrades.length > 0) {
        console.error('❌ Notes invalides détectées:', invalidGrades);
        toast({
          title: "⚠️ Notes invalides",
          description: `${invalidGrades.length} note(s) non conforme(s). Les notes doivent être entre 0 et 20.`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      const requestBody = {
        grades: gradesToSubmit,
        evaluationId: selectedAssessment._id || selectedAssessment.id
      };
      
      console.log('📤 Corps de la requête:', requestBody);
      console.log('🔗 URL de l\'endpoint:', `http://localhost:5000/api/evaluations/${selectedAssessment._id || selectedAssessment.id}/grades`);
      console.log('🔑 Token d\'authentification:', localStorage.getItem('daara_token') ? 'Présent' : 'Absent');
      
      // Utiliser le nouveau endpoint pour soumettre les notes
      const response = await fetch(`http://localhost:5000/api/evaluations/${selectedAssessment._id || selectedAssessment.id}/grades`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📨 Statut de la réponse:', response.status);
      console.log('📨 Headers de réponse:', response.headers);
      
      const data = await response.json();
      console.log('📥 Réponse complète du serveur:', data);
      
      if (data.success) {
        const gradedCount = gradesToSubmit.filter(g => !g.isAbsent).length;
        const absentCount = gradesToSubmit.filter(g => g.isAbsent).length;
        
        console.log('✅ Succès! Statistiques:');
        console.log('  - Notes saisies:', gradedCount);
        console.log('  - Absences:', absentCount);
        console.log('  - Moyenne calculée:', data.data?.averageGrade);
        
        toast({
          title: "✅ Notes enregistrées avec succès",
          description: `${gradedCount} note(s) et ${absentCount} absence(s) pour ${selectedAssessment.title}`,
        });
        
        // Mettre à jour la liste des évaluations
        const updatedAssessments = assessments.map(assessment => {
          if (assessment._id === selectedAssessment._id || assessment.id === selectedAssessment.id) {
            const newGradedStudents = gradedCount;
            const newStatus = assessment.totalStudents === (gradedCount + absentCount)
              ? 'completed' 
              : gradedCount > 0 ? 'inProgress' : assessment.status;
            
            console.log('🔄 Mise à jour évaluation avec moyenne:', data.data?.averageGrade);
            
            return {
              ...assessment,
              gradedStudents: newGradedStudents,
              status: newStatus,
              averageGrade: data.data?.averageGrade || assessment.averageGrade
            };
          }
          return assessment;
        });
        
        console.log('📊 Évaluations mises à jour:', updatedAssessments);
        setAssessments(updatedAssessments);
        setShowGradeDialog(false);
      } else {
        console.error('❌ Échec côté serveur:', data);
        toast({
          title: "❌ Échec de l'enregistrement",
          description: data.message || "Impossible d'enregistrer les notes. Vérifiez les données saisies.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Erreur lors de la soumission des notes:', error);
      console.error('Stack trace:', error.stack);
      toast({
        title: "❌ Erreur de connexion",
        description: "Problème de communication avec le serveur. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      console.log('🏁 Fin de soumission, isSubmitting = false');
      setIsSubmitting(false);
    }
  };

  // Supprimer une évaluation
  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/evaluations/${assessmentToDelete._id || assessmentToDelete.id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success || response.ok) {
        toast({
          title: "✅ Évaluation supprimée",
          description: `${assessmentToDelete.title} a été supprimée définitivement`,
        });
        
        // Retirer l'évaluation de la liste
        setAssessments(assessments.filter(assessment => 
          assessment._id !== assessmentToDelete._id && assessment.id !== assessmentToDelete.id
        ));
        
        setShowDeleteDialog(false);
        setAssessmentToDelete(null);
      } else {
        toast({
          title: "❌ Échec de la suppression",
          description: data.message || "Impossible de supprimer l'évaluation. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "❌ Erreur de connexion",
        description: "Problème de communication avec le serveur. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Créer une nouvelle évaluation
  const handleCreateAssessment = async () => {
    // Valider le formulaire avant soumission
    const errors = validateForm(newAssessment);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedClass = classes.find(c => c._id === newAssessment.classId);
      
      // Préparer les données pour le nouveau système d'évaluation
      const evaluationData = {
        title: newAssessment.title,
        classId: newAssessment.classId,
        subjectId: null, // Sera résolu côté serveur si nécessaire
        type: newAssessment.type, // 'devoir', 'controle', etc.
        plannedDate: newAssessment.date ? new Date(newAssessment.date).toISOString() : new Date().toISOString(),
        semester: newAssessment.semester, // Sera converti côté serveur
        academicYear: newAssessment.academicYear,
        description: newAssessment.description,
        maxScore: newAssessment.maxScore || 20, // Score configuré par l'utilisateur
        coefficient: newAssessment.coefficient || 1, // Coefficient configuré par l'utilisateur
        duration: 60, // Durée par défaut en minutes
        subject: newAssessment.subject // Ajout du subject comme string pour compatibilité
      };
      
      // Utiliser le nouveau endpoint d'évaluation
      const response = await fetch('http://localhost:5000/api/evaluations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify(evaluationData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        const classData = classes.find(c => c._id === newAssessment.classId);
        const className = classData?.name || selectedClass?.name || 'Classe inconnue';
        
        toast({
          title: "✅ Évaluation créée avec succès",
          description: `${newAssessment.title} - ${newAssessment.subject} pour ${className}`,
        });
        
        // Convertir la réponse au format attendu par l'interface
        // Mapper les types du serveur vers les types d'interface
        const mappedType = mapServerTypeToFrontend(data.data.type) || newAssessment.type!;
        
        // Récupérer le nombre d'étudiants de la classe sélectionnée
        const selectedClassData = classes.find(c => c._id === newAssessment.classId);
        const classStudentCount = selectedClassData?.studentCount || 0;
        
        console.log('Création évaluation - Classe sélectionnée:', selectedClassData);
        console.log('Nombre d\'étudiants dans la classe:', classStudentCount);
        console.log('Stats retournées par le serveur:', data.data.stats);
        
        const newAssessmentWithId: Assessment = {
          _id: data.data._id,
          id: data.data._id,
          title: data.data.title,
          class: data.data.classId?.name || selectedClass?.name || 'N/A',
          classId: data.data.classId?._id || data.data.classId,
          subject: data.data.subjectId?.name || newAssessment.subject || 'N/A',
          type: mappedType, // Utiliser le type mappé pour l'interface
          date: data.data.plannedDate,
          totalStudents: data.data.stats?.totalStudents || classStudentCount,
          gradedStudents: data.data.stats?.submittedGrades || 0,
          averageGrade: 0,
          status: data.data.status === 'programmee' ? 'pending' : 
                  data.data.status === 'en_cours' ? 'inProgress' : 'completed',
          semester: data.data.semester,
          academicYear: data.data.academicYear,
          description: data.data.description || ''
        };
        
        setAssessments([...assessments, newAssessmentWithId]);
        
        // Réinitialiser le formulaire et fermer la boîte de dialogue
        resetForm();
        setShowCreateDialog(false);
      } else {
        toast({
          title: "❌ Échec de la création",
          description: data.message || "Impossible de créer l'évaluation. Vérifiez les données saisies.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      toast({
        title: "❌ Erreur de connexion",
        description: "Problème de communication avec le serveur. Veuillez réessayer.",
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
        <div className="flex space-x-2">
          <Button onClick={() => {
            resetForm();
            initializeFormWithDefaults();
            setShowCreateDialog(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Évaluation
          </Button>
        </div>
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
                <SelectItem value="composition">Composition</SelectItem>
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
            <Button onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}>
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
                    <div className="flex items-center flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                      <Badge variant="outline">{assessment.class}</Badge>
                      <Badge variant="outline">{assessment.subject}</Badge>
                      <Badge className={getTypeColor(assessment.type)}>
                        {getTypeLabel(assessment.type)}
                      </Badge>
                      <Badge className={getStatusColor(assessment.status)}>
                        {getStatusLabel(assessment.status)}
                      </Badge>
                    </div>
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
                        {Math.max(0, assessment.totalStudents - assessment.gradedStudents)}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setAssessmentToDelete(assessment);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowStatsDialog(true);
                      }}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
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
                    <TableHead className="w-[30%]">Étudiant</TableHead>
                    <TableHead className="w-[15%] text-center">Note/20</TableHead>
                    <TableHead className="w-[10%] text-center">Absent</TableHead>
                    <TableHead className="w-[35%]">Commentaire</TableHead>
                    <TableHead className="w-[10%] text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsToGrade.map((student) => {
                    const isAbsent = gradesInput[student._id]?.isAbsent || false;
                    const currentScore = gradesInput[student._id]?.score || 0;
                    const isValidScore = currentScore >= 0 && currentScore <= 20;
                    
                    return (
                      <TableRow key={student._id} className={isAbsent ? 'bg-gray-50' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div>
                              <div>{student.name || 'Nom manquant'}</div>
                              {student.email && (
                                <div className="text-xs text-gray-500">{student.email}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input 
                            type="number" 
                            min="0" 
                            max="20" 
                            step="0.5"
                            className={`w-20 mx-auto text-center ${
                              isAbsent ? 'bg-gray-100 cursor-not-allowed' : 
                              !isValidScore && currentScore > 0 ? 'border-red-500' : ''
                            }`}
                            value={isAbsent ? '' : (gradesInput[student._id]?.score || '')}
                            disabled={isAbsent}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              setGradesInput({
                                ...gradesInput,
                                [student._id]: {
                                  ...gradesInput[student._id],
                                  studentId: student._id,
                                  score: value,
                                  isAbsent: false
                                }
                              });
                            }}
                            placeholder={isAbsent ? "ABS" : "0-20"}
                          />
                          {!isAbsent && !isValidScore && currentScore > 0 && (
                            <div className="text-xs text-red-500 mt-1">0-20</div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={isAbsent}
                            onChange={(e) => {
                              const absent = e.target.checked;
                              setGradesInput({
                                ...gradesInput,
                                [student._id]: {
                                  ...gradesInput[student._id],
                                  studentId: student._id,
                                  score: absent ? 0 : (gradesInput[student._id]?.score || 0),
                                  isAbsent: absent,
                                  comment: absent ? 'Absent' : (gradesInput[student._id]?.comment || '')
                                }
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            placeholder={isAbsent ? "Raison absence..." : "Commentaire (optionnel)"}
                            value={gradesInput[student._id]?.comment || ''}
                            className={isAbsent ? 'bg-yellow-50' : ''}
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
                        <TableCell className="text-center">
                          {isAbsent ? (
                            <Badge variant="secondary" className="text-xs">ABS</Badge>
                          ) : currentScore > 0 ? (
                            <Badge variant="default" className="text-xs">
                              {currentScore >= 10 ? '✓' : '⚠'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">-</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Statistiques en temps réel */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Aperçu des notes saisies</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total étudiants:</span>
                    <div className="font-medium">{studentsToGrade.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Notes saisies:</span>
                    <div className="font-medium text-green-600">
                      {Object.values(gradesInput).filter(g => g.score > 0 && !g.isAbsent).length}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Absents:</span>
                    <div className="font-medium text-yellow-600">
                      {Object.values(gradesInput).filter(g => g.isAbsent).length}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Moyenne:</span>
                    <div className="font-medium text-blue-600">
                      {(() => {
                        const validGrades = Object.values(gradesInput).filter(g => g.score > 0 && !g.isAbsent);
                        if (validGrades.length === 0) return '-';
                        const avg = validGrades.reduce((sum, g) => sum + g.score, 0) / validGrades.length;
                        return avg.toFixed(2);
                      })()}
                    </div>
                  </div>
                </div>
              </div>

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
                    <LoadingSpinner className="mr-2 h-4 w-4" />
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle évaluation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle évaluation pour vos élèves.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informations</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Informations de base */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l&apos;évaluation <span className="text-red-500">*</span></Label>
                <Input 
                  id="title"
                  value={newAssessment.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Ex: Contrôle sur les fractions"
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Classe <span className="text-red-500">*</span></Label>
                  <Select
                    value={newAssessment.classId}
                    onValueChange={(value) => updateFormData('classId', value)}
                  >
                    <SelectTrigger className={formErrors.classId ? 'border-red-500' : ''}>
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
                  {formErrors.classId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.classId}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Matière <span className="text-red-500">*</span></Label>
                  <Select
                    value={newAssessment.subject}
                    onValueChange={(value) => updateFormData('subject', value)}
                  >
                    <SelectTrigger className={formErrors.subject ? 'border-red-500' : ''}>
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
                  {formErrors.subject && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.subject}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={newAssessment.type}
                    onValueChange={(value: 'devoir' | 'controle' | 'oral' | 'projet' | 'composition') => 
                      updateFormData('type', value)
                    }
                  >
                    <SelectTrigger className={formErrors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="devoir">Devoir</SelectItem>
                      <SelectItem value="controle">Contrôle</SelectItem>
                      <SelectItem value="composition">Composition</SelectItem>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="projet">Projet</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.type && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.type}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                  <Input 
                    id="date"
                    type="date"
                    value={newAssessment.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    className={formErrors.date ? 'border-red-500' : ''}
                  />
                  {formErrors.date && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.date}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4 mt-4">
              {/* Configuration avancée */}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semestre <span className="text-red-500">*</span></Label>
                  <Select
                    value={newAssessment.semester?.toString()}
                    onValueChange={(value) => updateFormData('semester', parseInt(value))}
                  >
                    <SelectTrigger className={formErrors.semester ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTER_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.semester && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.semester}
                    </p>
                  )}
                  <p className="text-xs text-green-600">✓ Valeur par défaut appliquée</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Année académique <span className="text-red-500">*</span></Label>
                  <Select
                    value={newAssessment.academicYear}
                    onValueChange={(value) => updateFormData('academicYear', value)}
                  >
                    <SelectTrigger className={formErrors.academicYear ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEAR_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.academicYear && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.academicYear}
                    </p>
                  )}
                  <p className="text-xs text-green-600">✓ Valeur par défaut appliquée</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coefficient">Coefficient</Label>
                  <Input 
                    id="coefficient"
                    type="number"
                    min="0.5"
                    max="10"
                    step="1"
                    value={newAssessment.coefficient || 1}
                    onChange={(e) => updateFormData('coefficient', parseFloat(e.target.value) || 1)}
                    placeholder="1"
                  />
                  {newAssessment.classId && newAssessment.subject ? (
                    <p className="text-xs text-green-600">
                      ✓ Coefficient configuré pour cette matière/classe
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Sélectionnez classe et matière pour voir le coefficient configuré
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxScore">Note max</Label>
                  <Input 
                    id="maxScore"
                    type="number"
                    min="10"
                    max="100"
                    step="1"
                    value={newAssessment.maxScore || 20}
                    onChange={(e) => updateFormData('maxScore', parseInt(e.target.value) || 20)}
                    placeholder="20"
                  />
                  <p className="text-xs text-gray-500">Par défaut: 20</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea 
                  id="description"
                  value={newAssessment.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Description de l'évaluation"
                  rows={2}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {newAssessment.description?.length || 0}/500 caractères
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Boutons d'action - toujours visibles */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateAssessment}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Créer l&apos;évaluation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette évaluation ?
              {assessmentToDelete && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{assessmentToDelete.title}</p>
                  <p className="text-sm text-gray-600">
                    {assessmentToDelete.class} - {assessmentToDelete.subject}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(assessmentToDelete.date)}
                  </p>
                </div>
              )}
              <p className="mt-2 text-red-600 font-medium">
                Cette action est irréversible.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setAssessmentToDelete(null);
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAssessment}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour les statistiques d'évaluation */}
      <Dialog 
        open={showStatsDialog} 
        onOpenChange={setShowStatsDialog}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Statistiques de l&apos;évaluation</DialogTitle>
            <DialogDescription>
              Analyse détaillée des performances et résultats
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssessment && (
            <EvaluationStats 
              evaluationId={selectedAssessment._id || selectedAssessment.id || ''}
              onClose={() => setShowStatsDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
