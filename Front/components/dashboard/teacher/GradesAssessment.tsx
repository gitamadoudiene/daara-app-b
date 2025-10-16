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
  const mapServerTypeToFrontend = (serverType: string): string => {
    const serverToFrontendTypeMapping: {[key: string]: string} = {
      'devoir': 'devoir',
      'controle': 'controle', 
      'examen': 'composition', // Les compositions sont stockées comme "examen" côté serveur
      'presentation': 'oral',
      'projet': 'projet',
      'oral': 'oral'
    };
    
    return serverToFrontendTypeMapping[serverType] || serverType;
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
              subject: evaluation.subject
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
              totalStudents: evaluation.classId?.students?.length || 0,
              gradedStudents: evaluation.submittedGrades || 0,
              averageGrade: evaluation.averageScore || 0,
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
      type: 'controle',
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

    if (!assessmentData.type || assessmentData.type === '') {
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
      console.log('🎯 getDefaultCoefficient appelé avec:', { classId, subject });
      if (!classId || !subject) {
        console.log('⚠️ classId ou subject manquant');
        return;
      }
      
      const classData = classes.find(c => c._id === classId);
      console.log('📋 Classe trouvée:', classData);
      if (!classData) {
        console.log('❌ Aucune classe trouvée pour l\'ID:', classId);
        return;
      }
      
      // Utiliser notre nouveau service pour récupérer le coefficient
      console.log('🔍 Appel getSchoolDefaultCoefficient avec:', { subject, classLevel: classData.level });
      const coefficient = getSchoolDefaultCoefficient(subject, classData.level);
      console.log('🔍 Coefficient par défaut récupéré:', { 
        subject, 
        classLevel: classData.level, 
        coefficient,
        classData: classData
      });
      
      if (coefficient > 1) { // Seulement si on a trouvé un coefficient configuré
        setNewAssessment(prev => {
          const updated = { ...prev, coefficient };
          console.log('✅ Coefficient mis à jour dans newAssessment:', updated);
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
    console.log('📋 Paramètres par défaut récupérés:', schoolSettings);
    return {
      semester: schoolSettings.defaultSemester,
      academicYear: schoolSettings.defaultAcademicYear
    };
  };

  // Initialiser les paramètres par défaut lors de l'ouverture du formulaire
  const initializeFormWithDefaults = () => {
    const defaults = loadDefaultSettings();
    console.log('🎯 Initialisation du formulaire avec:', defaults);
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
          // Utiliser le nouveau endpoint pour récupérer les étudiants et notes d'une évaluation
          const gradesResponse = await fetch(`http://localhost:5000/api/evaluations/${assessmentId}/students`, {
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
      // Inclure toutes les notes (même les 0 et les absents)
      const gradesToSubmit = Object.values(gradesInput).filter(grade => 
        grade.score > 0 || grade.isAbsent
      );
      
      if (gradesToSubmit.length === 0) {
        toast({
          title: "Attention",
          description: "Aucune note à soumettre.",
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
        toast({
          title: "Erreur de validation",
          description: "Toutes les notes doivent être entre 0 et 20.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('Notes filtrées à soumettre:', gradesToSubmit);
      
      // Utiliser le nouveau endpoint pour soumettre les notes
      const response = await fetch(`http://localhost:5000/api/evaluations/${selectedAssessment._id || selectedAssessment.id}/grades`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify({
          grades: gradesToSubmit,
          evaluationId: selectedAssessment._id || selectedAssessment.id
        })
      });
      
      const data = await response.json();
      console.log('Réponse du serveur pour la soumission des notes:', data);
      
      if (data.success) {
        const gradedCount = gradesToSubmit.filter(g => !g.isAbsent).length;
        const absentCount = gradesToSubmit.filter(g => g.isAbsent).length;
        
        toast({
          title: "Notes soumises",
          description: `${gradedCount} note(s) et ${absentCount} absence(s) enregistrées avec succès.`,
        });
        
        // Mettre à jour la liste des évaluations
        const updatedAssessments = assessments.map(assessment => {
          if (assessment._id === selectedAssessment._id || assessment.id === selectedAssessment.id) {
            const newGradedStudents = gradedCount;
            const newStatus = assessment.totalStudents === (gradedCount + absentCount)
              ? 'completed' 
              : gradedCount > 0 ? 'inProgress' : assessment.status;
            
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

  // Supprimer une évaluation
  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Suppression de l\'évaluation:', assessmentToDelete._id || assessmentToDelete.id);
      
      const response = await fetch(`http://localhost:5000/api/evaluations/${assessmentToDelete._id || assessmentToDelete.id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        }
      });
      
      const data = await response.json();
      console.log('Réponse de suppression:', data);
      
      if (data.success || response.ok) {
        toast({
          title: "Évaluation supprimée",
          description: "L'évaluation a été supprimée avec succès.",
        });
        
        // Retirer l'évaluation de la liste
        setAssessments(assessments.filter(assessment => 
          assessment._id !== assessmentToDelete._id && assessment.id !== assessmentToDelete.id
        ));
        
        setShowDeleteDialog(false);
        setAssessmentToDelete(null);
      } else {
        console.error('Erreur lors de la suppression:', data.message);
        toast({
          title: "Erreur",
          description: data.message || "Une erreur s'est produite lors de la suppression.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur de connexion",
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
      console.log('Classe sélectionnée:', selectedClass);
      
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
      
      console.log('Données à envoyer:', evaluationData);
      console.log('Matière sélectionnée:', newAssessment.subject);
      console.log('Matières disponibles:', subjects);
      
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
      console.log('Réponse du serveur:', data);
      console.log('Status de la réponse:', response.status);
      console.log('Response OK:', response.ok);
      
      if (data.success) {
        toast({
          title: "Évaluation créée",
          description: "L'évaluation a été programmée avec succès.",
        });
        
        // Convertir la réponse au format attendu par l'interface
        // Mapper les types du serveur vers les types d'interface
        const mappedType = mapServerTypeToFrontend(data.data.type) || newAssessment.type!;
        
        const newAssessmentWithId: Assessment = {
          _id: data.data._id,
          id: data.data._id,
          title: data.data.title,
          class: data.data.classId?.name || selectedClass?.name || 'N/A',
          classId: data.data.classId?._id || data.data.classId,
          subject: data.data.subjectId?.name || newAssessment.subject || 'N/A',
          type: mappedType, // Utiliser le type mappé pour l'interface
          date: data.data.plannedDate,
          totalStudents: data.data.stats?.totalStudents || 0,
          gradedStudents: data.data.stats?.submittedGrades || 0,
          averageGrade: 0,
          status: data.data.status === 'programmee' ? 'pending' : 
                  data.data.status === 'en_cours' ? 'inProgress' : 'completed',
          semester: data.data.semester,
          academicYear: data.data.academicYear,
          description: data.data.description || ''
        };
        
        console.log('Nouvelle évaluation formatée:', newAssessmentWithId);
        
        setAssessments([...assessments, newAssessmentWithId]);
        
        // Réinitialiser le formulaire et fermer la boîte de dialogue
        resetForm();
        setShowCreateDialog(false);
      } else {
        console.error('Erreur lors de la création de l\'évaluation:', data.message);
        console.error('Données complètes de l\'erreur:', data);
        toast({
          title: "Erreur",
          description: data.message || "Une erreur s'est produite lors de la création de l'évaluation.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      console.error('Détails de l\'erreur:', error);
      toast({
        title: "Erreur de connexion",
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
                              <div>{student.name}</div>
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
              {!isLoadingDefaults && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-blue-800">📋 Paramètres par défaut configurés</h4>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        console.log('🔄 Forcer rechargement des paramètres...');
                        console.log('📊 schoolSettings actuels:', schoolSettings);
                        console.log('📊 newAssessment actuel:', newAssessment);
                        console.log('📊 isLoadingDefaults:', isLoadingDefaults);
                        console.log('📊 localStorage school-settings:', localStorage.getItem('school-settings'));
                        
                        // Forcer le rechargement du hook
                        refreshSettings();
                        
                        // Forcer la mise à jour du formulaire avec les nouvelles valeurs
                        setTimeout(() => {
                          const currentSettings = localStorage.getItem('school-settings');
                          if (currentSettings) {
                            const parsed = JSON.parse(currentSettings);
                            console.log('🔄 Application forcée des nouvelles valeurs:', parsed);
                            setNewAssessment(prev => ({
                              ...prev,
                              semester: parsed.defaultSemester,
                              academicYear: parsed.defaultAcademicYear
                            }));
                          }
                        }, 500);
                      }}
                      className="text-xs"
                    >
                      🔄 Debug + Sync
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs text-blue-700">
                    <div>
                      <span className="font-medium">Semestre par défaut (schoolSettings):</span> {schoolSettings.defaultSemester}
                    </div>
                    <div>
                      <span className="font-medium">Année par défaut (schoolSettings):</span> {schoolSettings.defaultAcademicYear}
                    </div>
                    <div>
                      <span className="font-medium">Semestre actuel (newAssessment):</span> {newAssessment.semester}
                    </div>
                    <div>
                      <span className="font-medium">Année actuelle (newAssessment):</span> {newAssessment.academicYear}
                    </div>
                    <div>
                      <span className="font-medium">localStorage:</span> {localStorage.getItem('school-settings') || 'Non défini'}
                    </div>
                  </div>
                  {newAssessment.classId && newAssessment.subject && (
                    <div className="mt-2 text-xs text-blue-700">
                      <span className="font-medium">Coefficient suggéré:</span> {
                        (() => {
                          const classData = classes.find(c => c._id === newAssessment.classId);
                          return classData ? getSchoolDefaultCoefficient(newAssessment.subject, classData.level) : 1;
                        })()
                      }
                    </div>
                  )}
                </div>
              )}
              
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
