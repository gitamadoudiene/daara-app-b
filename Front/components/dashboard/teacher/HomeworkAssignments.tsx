'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Calendar, Clock, Eye, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Homework {
  id: string;
  title: string;
  description: string;
  class: string;
  subject: string;
  assignedDate: string;
  dueDate: string;
  type: 'exercise' | 'research' | 'reading' | 'project';
  priority: 'low' | 'medium' | 'high';
  totalStudents: number;
  submittedCount: number;
  status: 'active' | 'completed' | 'overdue';
}

export function HomeworkAssignments() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Mock data for homework assignments
  const homeworkList: Homework[] = [
    {
      id: '1',
      title: 'Exercices Chapitre 5 - Fractions',
      description: 'Résoudre les exercices 1 à 15 page 89 du manuel de mathématiques',
      class: '6ème A',
      subject: 'Mathématiques',
      assignedDate: '2024-07-20',
      dueDate: '2024-07-25',
      type: 'exercise',
      priority: 'medium',
      totalStudents: 28,
      submittedCount: 22,
      status: 'active'
    },
    {
      id: '2',
      title: 'Recherche sur Pythagore',
      description: 'Préparer un exposé de 5 minutes sur la vie et les découvertes de Pythagore',
      class: '5ème B',
      subject: 'Mathématiques',
      assignedDate: '2024-07-18',
      dueDate: '2024-07-22',
      type: 'research',
      priority: 'high',
      totalStudents: 32,
      submittedCount: 30,
      status: 'overdue'
    },
    {
      id: '3',
      title: 'Lecture Chapitre Géométrie',
      description: 'Lire le chapitre 7 sur les triangles et préparer les questions',
      class: '4ème A',
      subject: 'Mathématiques',
      assignedDate: '2024-07-21',
      dueDate: '2024-07-28',
      type: 'reading',
      priority: 'low',
      totalStudents: 25,
      submittedCount: 0,
      status: 'active'
    },
    {
      id: '4',
      title: 'Projet Algèbre Avancée',
      description: 'Créer une présentation sur l&apos;application de l&apos;algèbre dans la vie quotidienne',
      class: '3ème C',
      subject: 'Mathématiques',
      assignedDate: '2024-07-15',
      dueDate: '2024-07-30',
      type: 'project',
      priority: 'high',
      totalStudents: 30,
      submittedCount: 18,
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'Normal';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exercise': return 'Exercices';
      case 'research': return 'Recherche';
      case 'reading': return 'Lecture';
      case 'project': return 'Projet';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exercise': return 'bg-blue-100 text-blue-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      case 'reading': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionRate = (submitted: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((submitted / total) * 100);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Devoirs & Travaux</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Assignez et suivez les devoirs de vos étudiants
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Devoir
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Devoir</DialogTitle>
              <DialogDescription>
                Assignez un nouveau travail à vos étudiants
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" placeholder="Titre du devoir" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Description détaillée du devoir"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Classe</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6a">6ème A</SelectItem>
                      <SelectItem value="5b">5ème B</SelectItem>
                      <SelectItem value="4a">4ème A</SelectItem>
                      <SelectItem value="3c">3ème C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exercise">Exercices</SelectItem>
                      <SelectItem value="research">Recherche</SelectItem>
                      <SelectItem value="reading">Lecture</SelectItem>
                      <SelectItem value="project">Projet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d&apos;échéance</Label>
                  <Input id="dueDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priorité</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>
                  Créer Devoir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input placeholder="Rechercher un devoir..." />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                <SelectItem value="6a">6ème A</SelectItem>
                <SelectItem value="5b">5ème B</SelectItem>
                <SelectItem value="4a">4ème A</SelectItem>
                <SelectItem value="3c">3ème C</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devoirs</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Assignés cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumissions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">70</div>
            <p className="text-xs text-muted-foreground">
              Rendus reçus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">45</div>
            <p className="text-xs text-muted-foreground">
              À rendre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">
              Échéance dépassée
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {homeworkList.map((homework) => (
          <Card key={homework.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <CardTitle className="text-lg">{homework.title}</CardTitle>
                  <CardDescription className="flex items-center flex-wrap gap-2 mt-1">
                    <Badge variant="outline">{homework.class}</Badge>
                    <Badge className={getTypeColor(homework.type)}>
                      {getTypeLabel(homework.type)}
                    </Badge>
                    <Badge className={getPriorityColor(homework.priority)}>
                      {getPriorityLabel(homework.priority)}
                    </Badge>
                    <Badge className={getStatusColor(homework.status)}>
                      {getStatusLabel(homework.status)}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {getDaysUntilDue(homework.dueDate) > 0 
                      ? `${getDaysUntilDue(homework.dueDate)} jours`
                      : getDaysUntilDue(homework.dueDate) === 0 
                        ? 'Aujourd&apos;hui'
                        : 'En retard'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Échéance: {new Date(homework.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {homework.description}
                </p>

                {/* Submission Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression des soumissions</span>
                    <span>{homework.submittedCount}/{homework.totalStudents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        homework.status === 'overdue' ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${getSubmissionRate(homework.submittedCount, homework.totalStudents)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getSubmissionRate(homework.submittedCount, homework.totalStudents)}% soumis
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Assigné: {new Date(homework.assignedDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Échéance: {new Date(homework.dueDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir Soumissions
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Rappel Étudiants
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
    </div>
  );
}
