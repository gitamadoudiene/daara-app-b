'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  TrendingUp, 
  Download, 
  Eye, 
  BarChart3,
  Calendar,
  User,
  Award,
  Target,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';

interface Grade {
  id: string;
  childName: string;
  subject: string;
  assignment: string;
  grade: number;
  maxGrade: number;
  coefficient: number;
  date: string;
  teacher: string;
  type: 'devoir' | 'controle' | 'oral' | 'projet';
  comments?: string;
}

interface SubjectSummary {
  subject: string;
  average: number;
  classAverage: number;
  coefficient: number;
  gradeCount: number;
  trend: 'up' | 'down' | 'stable';
  lastGrade: number;
}

interface TermReport {
  child: string;
  term: string;
  overallAverage: number;
  classAverage: number;
  rank: number;
  totalStudents: number;
  subjects: SubjectSummary[];
  teacherComments: string;
  generalComments: string;
}

export function GradesReports() {
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

  // Mock data for grades
  const grades: Grade[] = [
    {
      id: '1',
      childName: 'Emma',
      subject: 'Mathématiques',
      assignment: 'Contrôle Fonctions',
      grade: 18,
      maxGrade: 20,
      coefficient: 2,
      date: '2024-07-20',
      teacher: 'M. Dubois',
      type: 'controle',
      comments: 'Excellente maîtrise des concepts'
    },
    {
      id: '2',
      childName: 'Emma',
      subject: 'Français',
      assignment: 'Dissertation',
      grade: 16,
      maxGrade: 20,
      coefficient: 3,
      date: '2024-07-19',
      teacher: 'Mme. Leroy',
      type: 'devoir',
      comments: 'Argumentation solide, style à améliorer'
    },
    {
      id: '3',
      childName: 'Lucas',
      subject: 'Sciences',
      assignment: 'TP Chimie',
      grade: 15,
      maxGrade: 20,
      coefficient: 1,
      date: '2024-07-18',
      teacher: 'Mme. Laurent',
      type: 'projet',
      comments: 'Bonne méthode expérimentale'
    },
    {
      id: '4',
      childName: 'Emma',
      subject: 'Physique-Chimie',
      assignment: 'Devoir Maison',
      grade: 15.5,
      maxGrade: 20,
      coefficient: 1,
      date: '2024-07-17',
      teacher: 'M. Bernard',
      type: 'devoir',
      comments: 'Calculs corrects, présentation soignée'
    },
    {
      id: '5',
      childName: 'Lucas',
      subject: 'Mathématiques',
      assignment: 'Interro Géométrie',
      grade: 14,
      maxGrade: 20,
      coefficient: 1,
      date: '2024-07-16',
      teacher: 'Mme. Garcia',
      type: 'controle'
    },
    {
      id: '6',
      childName: 'Emma',
      subject: 'Histoire-Géo',
      assignment: 'Exposé',
      grade: 17,
      maxGrade: 20,
      coefficient: 2,
      date: '2024-07-15',
      teacher: 'Mme. Rousseau',
      type: 'oral',
      comments: 'Présentation claire et documentée'
    }
  ];

  // Mock data for subject summaries
  const subjectSummaries: { [child: string]: SubjectSummary[] } = {
    'Emma': [
      {
        subject: 'Mathématiques',
        average: 17.5,
        classAverage: 14.2,
        coefficient: 4,
        gradeCount: 5,
        trend: 'up',
        lastGrade: 18
      },
      {
        subject: 'Français',
        average: 16.0,
        classAverage: 13.8,
        coefficient: 4,
        gradeCount: 4,
        trend: 'stable',
        lastGrade: 16
      },
      {
        subject: 'Physique-Chimie',
        average: 15.8,
        classAverage: 13.5,
        coefficient: 3,
        gradeCount: 3,
        trend: 'up',
        lastGrade: 15.5
      },
      {
        subject: 'Histoire-Géo',
        average: 16.5,
        classAverage: 14.0,
        coefficient: 3,
        gradeCount: 4,
        trend: 'up',
        lastGrade: 17
      },
      {
        subject: 'Anglais',
        average: 15.2,
        classAverage: 13.2,
        coefficient: 3,
        gradeCount: 3,
        trend: 'stable',
        lastGrade: 15
      }
    ],
    'Lucas': [
      {
        subject: 'Mathématiques',
        average: 15.2,
        classAverage: 13.8,
        coefficient: 4,
        gradeCount: 4,
        trend: 'up',
        lastGrade: 14
      },
      {
        subject: 'Français',
        average: 14.5,
        classAverage: 13.5,
        coefficient: 4,
        gradeCount: 3,
        trend: 'stable',
        lastGrade: 14.5
      },
      {
        subject: 'Sciences',
        average: 15.8,
        classAverage: 14.1,
        coefficient: 3,
        gradeCount: 4,
        trend: 'up',
        lastGrade: 15
      },
      {
        subject: 'Histoire-Géo',
        average: 13.9,
        classAverage: 13.2,
        coefficient: 3,
        gradeCount: 3,
        trend: 'stable',
        lastGrade: 14
      },
      {
        subject: 'Anglais',
        average: 14.2,
        classAverage: 13.0,
        coefficient: 3,
        gradeCount: 3,
        trend: 'up',
        lastGrade: 14.5
      }
    ]
  };

  // Mock data for term reports
  const termReports: TermReport[] = [
    {
      child: 'Emma',
      term: 'Trimestre 1',
      overallAverage: 16.2,
      classAverage: 13.9,
      rank: 3,
      totalStudents: 35,
      subjects: subjectSummaries['Emma'],
      teacherComments: 'Élève très sérieuse et appliquée. Excellents résultats dans toutes les matières.',
      generalComments: 'Emma fait preuve d&apos;une grande maturité et d&apos;un excellent niveau académique. Elle peut viser l&apos;excellence.'
    },
    {
      child: 'Lucas',
      term: 'Trimestre 1',
      overallAverage: 14.8,
      classAverage: 13.5,
      rank: 8,
      totalStudents: 28,
      subjects: subjectSummaries['Lucas'],
      teacherComments: 'Élève motivé qui progresse régulièrement. Bon potentiel à développer.',
      generalComments: 'Lucas montre de bonnes capacités et une progression constante. Il doit maintenir ses efforts.'
    }
  ];

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadgeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case 'stable': return <div className="h-4 w-4 border-t-2 border-gray-400"></div>;
      default: return null;
    }
  };

  const filteredGrades = selectedChild === 'all' 
    ? grades 
    : grades.filter(grade => grade.childName === selectedChild);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Notes & Rapports</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Consultez les résultats scolaires et rapports de vos enfants
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Télécharger Bulletin
        </Button>
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
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Période actuelle</SelectItem>
                <SelectItem value="term1">Trimestre 1</SelectItem>
                <SelectItem value="term2">Trimestre 2</SelectItem>
                <SelectItem value="term3">Trimestre 3</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Rechercher une matière..." className="flex-1" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="grades" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grades">Notes Récentes</TabsTrigger>
          <TabsTrigger value="averages">Moyennes</TabsTrigger>
          <TabsTrigger value="reports">Bulletins</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes Récentes</CardTitle>
              <CardDescription>
                Dernières évaluations et devoirs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredGrades.map((grade) => (
                  <div key={grade.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <h4 className="text-base font-semibold">{grade.childName}</h4>
                          <Badge variant="outline">{grade.subject}</Badge>
                          <Badge className={getTypeColor(grade.type)}>
                            {getTypeLabel(grade.type)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{grade.assignment}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Prof: {grade.teacher}</span>
                          <span>Coeff: {grade.coefficient}</span>
                          <span>{new Date(grade.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {grade.comments && (
                          <p className="text-sm text-gray-600 mt-2 italic">&quot;{grade.comments}&quot;</p>
                        )}
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getGradeColor(grade.grade, grade.maxGrade)}`}>
                          {grade.grade}/{grade.maxGrade}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((grade.grade / grade.maxGrade) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="averages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(subjectSummaries).map(([childName, subjects]) => (
              <Card key={childName}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    {childName} - Moyennes par Matière
                  </CardTitle>
                  <CardDescription>
                    Comparaison avec la moyenne de classe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects.map((subject, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <h5 className="font-semibold">{subject.subject}</h5>
                            {getTrendIcon(subject.trend)}
                          </div>
                          <Badge variant="outline">Coeff: {subject.coefficient}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className={`text-lg font-bold ${getGradeColor(subject.average, 20)}`}>
                              {subject.average}/20
                            </div>
                            <div className="text-xs text-blue-600">Ma moyenne</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-lg font-bold text-gray-600">
                              {subject.classAverage}/20
                            </div>
                            <div className="text-xs text-gray-600">Moy. classe</div>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{subject.gradeCount} notes</span>
                          <span>
                            Dernière note: 
                            <span className={`ml-1 font-medium ${getGradeColor(subject.lastGrade, 20)}`}>
                              {subject.lastGrade}/20
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-6">
            {termReports.map((report, index) => (
              <Card key={index}>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{report.child} - {report.term}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-2">
                        <span>Rang: {report.rank}/{report.totalStudents}</span>
                        <span>•</span>
                        <span>Moyenne générale: {report.overallAverage}/20</span>
                        <span>•</span>
                        <span>Moyenne classe: {report.classAverage}/20</span>
                      </CardDescription>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getGradeBadgeColor(report.overallAverage, 20)}`}>
                        {report.overallAverage}/20
                      </div>
                      <Badge className="mt-2" variant="outline">
                        {report.rank}e position
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Subject Details */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Détail par Matière
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.subjects.map((subject, subIndex) => (
                          <div key={subIndex} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{subject.subject}</h5>
                              <div className="flex items-center space-x-2">
                                {getTrendIcon(subject.trend)}
                                <span className={`font-bold ${getGradeColor(subject.average, 20)}`}>
                                  {subject.average}/20
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Classe: {subject.classAverage}/20</span>
                              <span>Coeff: {subject.coefficient}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center">
                          <Award className="mr-2 h-5 w-5" />
                          Appréciation du Professeur Principal
                        </h4>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm italic">&quot;{report.teacherComments}&quot;</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center">
                          <Target className="mr-2 h-5 w-5" />
                          Commentaire Général
                        </h4>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm italic">&quot;{report.generalComments}&quot;</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                      <Button className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger Bulletin PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir Détails Complets
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        Programmer RDV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
