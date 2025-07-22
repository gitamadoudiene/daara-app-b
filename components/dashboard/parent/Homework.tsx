'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Upload,
  User,
  Star,
  MessageSquare,
  PlusCircle
} from 'lucide-react';
import { useState } from 'react';

interface Assignment {
  id: string;
  childName: string;
  subject: string;
  title: string;
  description: string;
  type: 'homework' | 'project' | 'reading' | 'exercise';
  dueDate: string;
  assignedDate: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'submitted' | 'late' | 'overdue';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  teacher: string;
  instructions?: string;
  resources?: string[];
  grade?: number;
  feedback?: string;
  submissionFile?: string;
}

interface HomeworkStats {
  childName: string;
  totalAssignments: number;
  completedAssignments: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
  averageGrade: number;
  completionRate: number;
  onTimeRate: number;
}

export function Homework() {
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('pending');

  // Mock data for assignments
  const assignments: Assignment[] = [
    {
      id: '1',
      childName: 'Emma',
      subject: 'Mathématiques',
      title: 'Exercices Algèbre',
      description: 'Résoudre les équations du chapitre 5',
      type: 'homework',
      dueDate: '2024-07-25',
      assignedDate: '2024-07-22',
      status: 'assigned',
      difficulty: 'medium',
      estimatedTime: 45,
      teacher: 'M. Dubois',
      instructions: 'Résoudre les exercices 1 à 15 page 89. Montrer toutes les étapes de calcul.',
      resources: ['Livre de cours page 89', 'Formulaire algèbre']
    },
    {
      id: '2',
      childName: 'Lucas',
      subject: 'Français',
      title: 'Rédaction Littéraire',
      description: 'Analyse de texte sur "L\'Étranger" de Camus',
      type: 'project',
      dueDate: '2024-07-28',
      assignedDate: '2024-07-21',
      status: 'in-progress',
      difficulty: 'hard',
      estimatedTime: 120,
      teacher: 'Mme. Leroy',
      instructions: 'Analyser le premier chapitre en 500 mots minimum. Étudier le style narratif.',
      resources: ['Livre "L\'Étranger"', 'Guide analyse littéraire']
    },
    {
      id: '3',
      childName: 'Emma',
      subject: 'Sciences',
      title: 'Expérience Chimie',
      description: 'Rapport sur la réaction acide-base',
      type: 'project',
      dueDate: '2024-07-24',
      assignedDate: '2024-07-19',
      status: 'completed',
      difficulty: 'medium',
      estimatedTime: 90,
      teacher: 'Mme. Laurent',
      instructions: 'Rédiger un rapport complet avec observations et conclusions.',
      resources: ['Fiche protocole', 'Tableau périodique'],
      grade: 16,
      feedback: 'Excellent travail ! Observations précises et conclusions bien argumentées.'
    },
    {
      id: '4',
      childName: 'Lucas',
      subject: 'Histoire-Géo',
      title: 'Carte Mentale',
      description: 'Les causes de la Première Guerre mondiale',
      type: 'homework',
      dueDate: '2024-07-23',
      assignedDate: '2024-07-20',
      status: 'submitted',
      difficulty: 'easy',
      estimatedTime: 60,
      teacher: 'M. Roux',
      instructions: 'Créer une carte mentale détaillée avec les principales causes.',
      resources: ['Manuel page 156-162', 'Documentaire recommandé'],
      submissionFile: 'carte-mentale-1gm.pdf'
    },
    {
      id: '5',
      childName: 'Emma',
      subject: 'Anglais',
      title: 'Exercices Grammaire',
      description: 'Present Perfect vs Past Simple',
      type: 'exercise',
      dueDate: '2024-07-23',
      assignedDate: '2024-07-22',
      status: 'overdue',
      difficulty: 'easy',
      estimatedTime: 30,
      teacher: 'Mrs. Smith',
      instructions: 'Compléter les exercices 3 et 4 du workbook.',
      resources: ['Workbook page 45-47']
    },
    {
      id: '6',
      childName: 'Lucas',
      subject: 'Mathématiques',
      title: 'Problèmes Géométrie',
      description: 'Calculs d\'aires et périmètres',
      type: 'homework',
      dueDate: '2024-07-26',
      assignedDate: '2024-07-23',
      status: 'assigned',
      difficulty: 'medium',
      estimatedTime: 50,
      teacher: 'Mme. Garcia',
      instructions: 'Résoudre les problèmes 1 à 10 en détaillant les formules utilisées.',
      resources: ['Cahier de formules', 'Livre exercices page 78']
    }
  ];

  // Mock data for homework statistics
  const homeworkStats: HomeworkStats[] = [
    {
      childName: 'Emma',
      totalAssignments: 45,
      completedAssignments: 42,
      onTimeSubmissions: 38,
      lateSubmissions: 4,
      averageGrade: 15.2,
      completionRate: 93,
      onTimeRate: 84
    },
    {
      childName: 'Lucas',
      totalAssignments: 38,
      completedAssignments: 34,
      onTimeSubmissions: 30,
      lateSubmissions: 4,
      averageGrade: 13.8,
      completionRate: 89,
      onTimeRate: 79
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-gray-100 text-gray-800';
      case 'late': return 'bg-orange-100 text-orange-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'submitted': return 'Rendu';
      case 'in-progress': return 'En cours';
      case 'assigned': return 'Assigné';
      case 'late': return 'En retard';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted': return <Upload className="h-4 w-4 text-blue-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'assigned': return <BookOpen className="h-4 w-4 text-gray-600" />;
      case 'late':
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return 'Non défini';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'homework': return 'Devoir';
      case 'project': return 'Projet';
      case 'reading': return 'Lecture';
      case 'exercise': return 'Exercice';
      default: return 'Autre';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterAssignments = (assignments: Assignment[], tab: string) => {
    let filtered = assignments;

    // Filter by child
    if (selectedChild !== 'all') {
      filtered = filtered.filter(a => a.childName === selectedChild);
    }

    // Filter by subject
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(a => a.subject === selectedSubject);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }

    // Filter by tab
    switch (tab) {
      case 'pending':
        return filtered.filter(a => ['assigned', 'in-progress'].includes(a.status));
      case 'completed':
        return filtered.filter(a => ['completed', 'submitted'].includes(a.status));
      case 'overdue':
        return filtered.filter(a => ['late', 'overdue'].includes(a.status));
      default:
        return filtered;
    }
  };

  const filteredStats = selectedChild === 'all' 
    ? homeworkStats 
    : homeworkStats.filter(stat => stat.childName === selectedChild);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Devoirs & Travaux</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Suivez les devoirs et projets de vos enfants
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter Rappel
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStats.map((stats, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5" />
                {stats.childName} - Performance Devoirs
              </CardTitle>
              <CardDescription>
                Statistiques académiques ce trimestre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.completionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Taux de réalisation</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.averageGrade.toFixed(1)}/20
                    </div>
                    <div className="text-sm text-muted-foreground">Note moyenne</div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Devoirs terminés</span>
                      <span>{stats.completedAssignments}/{stats.totalAssignments}</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Rendus à temps</span>
                      <span>{stats.onTimeSubmissions}/{stats.completedAssignments}</span>
                    </div>
                    <Progress value={stats.onTimeRate} className="h-2" />
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-semibold text-blue-700">{stats.totalAssignments}</div>
                    <div className="text-xs text-blue-600">Total</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-semibold text-green-700">{stats.completedAssignments}</div>
                    <div className="text-xs text-green-600">Terminés</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-semibold text-yellow-700">{stats.onTimeSubmissions}</div>
                    <div className="text-xs text-yellow-600">À temps</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-semibold text-red-700">{stats.lateSubmissions}</div>
                    <div className="text-xs text-red-600">En retard</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sélectionner enfant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les enfants</SelectItem>
                <SelectItem value="Emma">Emma</SelectItem>
                <SelectItem value="Lucas">Lucas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes matières</SelectItem>
                <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                <SelectItem value="Français">Français</SelectItem>
                <SelectItem value="Sciences">Sciences</SelectItem>
                <SelectItem value="Histoire-Géo">Histoire-Géo</SelectItem>
                <SelectItem value="Anglais">Anglais</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="assigned">Assigné</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="submitted">Rendu</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Homework Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            En Cours ({filterAssignments(assignments, 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminés ({filterAssignments(assignments, 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            En Retard ({filterAssignments(assignments, 'overdue').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Devoirs à Faire</CardTitle>
              <CardDescription>
                Travaux en cours et nouvellement assignés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterAssignments(assignments, 'pending').map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(assignment.status)}
                          <h4 className="text-base font-semibold">{assignment.title}</h4>
                          <Badge className={getStatusColor(assignment.status)}>
                            {getStatusLabel(assignment.status)}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeLabel(assignment.type)}
                          </Badge>
                          <Badge className={getDifficultyColor(assignment.difficulty)}>
                            {getDifficultyLabel(assignment.difficulty)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                          <div>
                            <span className="font-medium">Enfant:</span> {assignment.childName}
                          </div>
                          <div>
                            <span className="font-medium">Matière:</span> {assignment.subject}
                          </div>
                          <div>
                            <span className="font-medium">Professeur:</span> {assignment.teacher}
                          </div>
                          <div className={`font-medium ${getDaysUntilDue(assignment.dueDate) <= 1 ? 'text-red-600' : getDaysUntilDue(assignment.dueDate) <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                            <CalendarIcon className="inline h-4 w-4 mr-1" />
                            Échéance: {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                            ({getDaysUntilDue(assignment.dueDate)} jours)
                          </div>
                          <div>
                            <Clock className="inline h-4 w-4 mr-1" />
                            <span className="font-medium">Durée estimée:</span> {assignment.estimatedTime} min
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {assignment.description}
                        </p>

                        {assignment.instructions && (
                          <div className="bg-blue-50 p-3 rounded text-sm mb-2">
                            <span className="font-medium text-blue-800">Instructions:</span>
                            <p className="text-blue-700 mt-1">{assignment.instructions}</p>
                          </div>
                        )}

                        {assignment.resources && assignment.resources.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <span className="font-medium">Ressources:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {assignment.resources.map((resource, index) => (
                                <li key={index} className="text-gray-700">{resource}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 lg:w-48">
                        <Button size="sm" className="w-full">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marquer Terminé
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Upload className="mr-2 h-4 w-4" />
                          Soumettre Fichier
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contacter Prof
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filterAssignments(assignments, 'pending').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun devoir en attente</p>
                  <p className="text-sm">Tous les devoirs sont à jour !</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Devoirs Terminés</CardTitle>
              <CardDescription>
                Travaux complétés et rendus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterAssignments(assignments, 'completed').map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(assignment.status)}
                          <h4 className="text-base font-semibold">{assignment.title}</h4>
                          <Badge className={getStatusColor(assignment.status)}>
                            {getStatusLabel(assignment.status)}
                          </Badge>
                          {assignment.grade && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Star className="mr-1 h-3 w-3" />
                              {assignment.grade}/20
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                          <div>
                            <span className="font-medium">Enfant:</span> {assignment.childName}
                          </div>
                          <div>
                            <span className="font-medium">Matière:</span> {assignment.subject}
                          </div>
                          <div>
                            <span className="font-medium">Rendu le:</span> {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                          </div>
                          <div>
                            <span className="font-medium">Professeur:</span> {assignment.teacher}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {assignment.description}
                        </p>

                        {assignment.feedback && (
                          <div className="bg-green-100 p-3 rounded text-sm mb-2">
                            <span className="font-medium text-green-800">Commentaire du professeur:</span>
                            <p className="text-green-700 mt-1">{assignment.feedback}</p>
                          </div>
                        )}

                        {assignment.submissionFile && (
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            <span className="font-medium text-blue-800">Fichier rendu:</span>
                            <p className="text-blue-700 mt-1">{assignment.submissionFile}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 lg:w-48">
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="mr-2 h-4 w-4" />
                          Voir Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filterAssignments(assignments, 'completed').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun devoir terminé pour cette sélection</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg text-red-800 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Devoirs en Retard
              </CardTitle>
              <CardDescription className="text-red-600">
                Travaux nécessitant une attention immédiate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterAssignments(assignments, 'overdue').map((assignment) => (
                  <div key={assignment.id} className="border border-red-300 rounded-lg p-4 bg-white">
                    <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(assignment.status)}
                          <h4 className="text-base font-semibold">{assignment.title}</h4>
                          <Badge className={getStatusColor(assignment.status)}>
                            {getStatusLabel(assignment.status)}
                          </Badge>
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            {Math.abs(getDaysUntilDue(assignment.dueDate))} jour(s) de retard
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                          <div>
                            <span className="font-medium">Enfant:</span> {assignment.childName}
                          </div>
                          <div>
                            <span className="font-medium">Matière:</span> {assignment.subject}
                          </div>
                          <div className="text-red-600 font-medium">
                            <CalendarIcon className="inline h-4 w-4 mr-1" />
                            Échéance dépassée: {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                          </div>
                          <div>
                            <span className="font-medium">Professeur:</span> {assignment.teacher}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {assignment.description}
                        </p>

                        {assignment.instructions && (
                          <div className="bg-red-100 p-3 rounded text-sm">
                            <span className="font-medium text-red-800">Instructions:</span>
                            <p className="text-red-700 mt-1">{assignment.instructions}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 lg:w-48">
                        <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Rattraper Maintenant
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Excuser Retard
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filterAssignments(assignments, 'overdue').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                  <p>Aucun devoir en retard</p>
                  <p className="text-sm">Excellent suivi !</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions Rapides</CardTitle>
          <CardDescription>
            Gérez les devoirs et communiquez avec les enseignants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Planning Hebdo
            </Button>
            <Button variant="outline" className="w-full">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendrier Devoirs
            </Button>
            <Button variant="outline" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Groupé
            </Button>
            <Button variant="outline" className="w-full">
              <AlertCircle className="mr-2 h-4 w-4" />
              Configurer Alertes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
