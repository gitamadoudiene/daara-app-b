'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, FileText, Calendar, User, BarChart3, Eye, Send, Download, Plus } from 'lucide-react';
import { useState } from 'react';

interface ProgressReport {
  id: string;
  studentName: string;
  class: string;
  subject: string;
  period: string;
  reportDate: string;
  overallGrade: number;
  attendance: number;
  behavior: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  strengths: string[];
  improvements: string[];
  teacherComments: string;
  status: 'draft' | 'completed' | 'sent';
}

interface ClassSummary {
  class: string;
  totalStudents: number;
  averageGrade: number;
  attendanceRate: number;
  reportsCompleted: number;
}

export function ProgressReports() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Mock data for progress reports
  const progressReports: ProgressReport[] = [
    {
      id: '1',
      studentName: 'Marie Dupont',
      class: '6ème A',
      subject: 'Mathématiques',
      period: 'Trimestre 1',
      reportDate: '2024-07-20',
      overallGrade: 16.5,
      attendance: 95,
      behavior: 'excellent',
      strengths: ['Logique', 'Participation active', 'Travail soigné'],
      improvements: ['Vitesse de calcul', 'Confiance en soi'],
      teacherComments: 'Élève très appliquée avec d&apos;excellents résultats. Continue ainsi !',
      status: 'completed'
    },
    {
      id: '2',
      studentName: 'Pierre Martin',
      class: '6ème A',
      subject: 'Mathématiques',
      period: 'Trimestre 1',
      reportDate: '2024-07-20',
      overallGrade: 12.8,
      attendance: 88,
      behavior: 'good',
      strengths: ['Créativité', 'Esprit d&apos;équipe'],
      improvements: ['Attention en classe', 'Régularité du travail'],
      teacherComments: 'Potentiel certain mais manque de régularité dans l&apos;effort.',
      status: 'draft'
    },
    {
      id: '3',
      studentName: 'Sophie Lemaire',
      class: '5ème B',
      subject: 'Mathématiques',
      period: 'Trimestre 1',
      reportDate: '2024-07-19',
      overallGrade: 14.2,
      attendance: 92,
      behavior: 'good',
      strengths: ['Méthodologie', 'Persévérance', 'Aide aux camarades'],
      improvements: ['Expression écrite', 'Rapidité'],
      teacherComments: 'Bonne élève qui progresse régulièrement. Encourage les autres.',
      status: 'sent'
    },
    {
      id: '4',
      studentName: 'Thomas Durand',
      class: '4ème A',
      subject: 'Mathématiques',
      period: 'Trimestre 1',
      reportDate: '2024-07-18',
      overallGrade: 10.5,
      attendance: 78,
      behavior: 'needs_improvement',
      strengths: ['Compréhension rapide', 'Questions pertinentes'],
      improvements: ['Assiduité', 'Travail personnel', 'Comportement'],
      teacherComments: 'Élève intelligent mais manque de motivation et d&apos;assiduité.',
      status: 'completed'
    }
  ];

  // Mock data for class summaries
  const classSummaries: ClassSummary[] = [
    {
      class: '6ème A',
      totalStudents: 28,
      averageGrade: 14.2,
      attendanceRate: 91,
      reportsCompleted: 25
    },
    {
      class: '5ème B',
      totalStudents: 32,
      averageGrade: 13.8,
      attendanceRate: 89,
      reportsCompleted: 30
    },
    {
      class: '4ème A',
      totalStudents: 25,
      averageGrade: 15.1,
      attendanceRate: 94,
      reportsCompleted: 22
    },
    {
      class: '3ème C',
      totalStudents: 30,
      averageGrade: 12.9,
      attendanceRate: 87,
      reportsCompleted: 18
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      default: return 'Inconnu';
    }
  };

  const getBehaviorColor = (behavior: string) => {
    switch (behavior) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'satisfactory': return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBehaviorLabel = (behavior: string) => {
    switch (behavior) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Bon';
      case 'satisfactory': return 'Satisfaisant';
      case 'needs_improvement': return 'À améliorer';
      default: return 'Non évalué';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 14) return 'text-blue-600';
    if (grade >= 12) return 'text-yellow-600';
    if (grade >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Rapports de Progrès</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Créez et gérez les rapports de progression de vos étudiants
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Rapport
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer un Rapport de Progrès</DialogTitle>
              <DialogDescription>
                Rédigez un rapport détaillé sur les progrès d&apos;un étudiant
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Étudiant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marie">Marie Dupont</SelectItem>
                      <SelectItem value="pierre">Pierre Martin</SelectItem>
                      <SelectItem value="sophie">Sophie Lemaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Période</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t1">Trimestre 1</SelectItem>
                      <SelectItem value="t2">Trimestre 2</SelectItem>
                      <SelectItem value="t3">Trimestre 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Note Générale (/20)</Label>
                  <Input id="grade" type="number" max="20" min="0" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance">Présence (%)</Label>
                  <Input id="attendance" type="number" max="100" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="behavior">Comportement</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Évaluer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Bon</SelectItem>
                      <SelectItem value="satisfactory">Satisfaisant</SelectItem>
                      <SelectItem value="needs_improvement">À améliorer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strengths">Points Forts</Label>
                <Input id="strengths" placeholder="Séparez par des virgules" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="improvements">Points à Améliorer</Label>
                <Input id="improvements" placeholder="Séparez par des virgules" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Commentaires de l&apos;Enseignant</Label>
                <Textarea 
                  id="comments" 
                  placeholder="Vos observations et recommandations..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button variant="outline">
                  Sauver Brouillon
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>
                  Créer Rapport
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
              <Input placeholder="Rechercher un étudiant..." />
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
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes périodes</SelectItem>
                <SelectItem value="t1">Trimestre 1</SelectItem>
                <SelectItem value="t2">Trimestre 2</SelectItem>
                <SelectItem value="t3">Trimestre 3</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Class Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {classSummaries.map((summary) => (
          <Card key={summary.class}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{summary.class}</CardTitle>
              <CardDescription>{summary.totalStudents} étudiants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Moyenne:</span>
                  <span className={`font-semibold ${getGradeColor(summary.averageGrade)}`}>
                    {summary.averageGrade}/20
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Présence:</span>
                  <span className="font-semibold">{summary.attendanceRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rapports:</span>
                  <span className="font-semibold">
                    {summary.reportsCompleted}/{summary.totalStudents}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(summary.reportsCompleted / summary.totalStudents) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Reports List */}
      <div className="space-y-4">
        {progressReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{report.studentName}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center flex-wrap gap-2 mt-1">
                    <Badge variant="outline">{report.class}</Badge>
                    <Badge variant="outline">{report.period}</Badge>
                    <Badge className={getBehaviorColor(report.behavior)}>
                      {getBehaviorLabel(report.behavior)}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusLabel(report.status)}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getGradeColor(report.overallGrade)}`}>
                    {report.overallGrade}/20
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {report.attendance}% présence
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-2">Points Forts</h4>
                    <div className="flex flex-wrap gap-1">
                      {report.strengths.map((strength, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-orange-700 mb-2">À Améliorer</h4>
                    <div className="flex flex-wrap gap-1">
                      {report.improvements.map((improvement, index) => (
                        <Badge key={index} variant="secondary" className="bg-orange-50 text-orange-700">
                          {improvement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Teacher Comments */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Commentaires de l&apos;Enseignant</h4>
                  <p className="text-sm text-gray-700">{report.teacherComments}</p>
                </div>

                {/* Report Date */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Rapport créé le {new Date(report.reportDate).toLocaleDateString('fr-FR')}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir Détails
                  </Button>
                  {report.status === 'draft' && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Terminer
                    </Button>
                  )}
                  {report.status === 'completed' && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Modifier
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
