'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileText,
  PieChart,
  Activity,
  Award,
  Clock
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'attendance' | 'financial' | 'enrollment';
  generated: string;
  status: 'Prêt' | 'En cours' | 'Erreur';
}

interface PerformanceData {
  subject: string;
  average: number;
  passRate: number;
  totalStudents: number;
}

interface AttendanceData {
  class: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for reports
  const reports: Report[] = [
    {
      id: '1',
      title: 'Rapport Mensuel de Performance',
      description: 'Analyse des résultats académiques du mois',
      type: 'performance',
      generated: '2024-07-20',
      status: 'Prêt'
    },
    {
      id: '2',
      title: 'Rapport d\'Assiduité Hebdomadaire',
      description: 'Statistiques de présence des étudiants',
      type: 'attendance',
      generated: '2024-07-21',
      status: 'Prêt'
    },
    {
      id: '3',
      title: 'Analyse Financière Trimestrielle',
      description: 'Revenus et dépenses du trimestre',
      type: 'financial',
      generated: '2024-07-15',
      status: 'En cours'
    },
    {
      id: '4',
      title: 'Rapport d\'Inscriptions',
      description: 'Évolution des inscriptions par niveau',
      type: 'enrollment',
      generated: '2024-07-18',
      status: 'Prêt'
    }
  ];

  // Mock performance data
  const performanceData: PerformanceData[] = [
    { subject: 'Mathématiques', average: 14.5, passRate: 85, totalStudents: 120 },
    { subject: 'Français', average: 13.2, passRate: 78, totalStudents: 120 },
    { subject: 'Sciences', average: 15.1, passRate: 92, totalStudents: 95 },
    { subject: 'Histoire-Géo', average: 12.8, passRate: 74, totalStudents: 85 },
    { subject: 'Anglais', average: 13.9, passRate: 81, totalStudents: 110 }
  ];

  // Mock attendance data
  const attendanceData: AttendanceData[] = [
    { class: '6ème A', present: 32, absent: 2, late: 1, total: 35 },
    { class: '6ème B', present: 37, absent: 3, late: 0, total: 40 },
    { class: '5ème A', present: 26, absent: 1, late: 1, total: 28 },
    { class: '4ème A', present: 23, absent: 2, late: 0, total: 25 }
  ];

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'performance': return Award;
      case 'attendance': return Clock;
      case 'financial': return BarChart3;
      case 'enrollment': return Users;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Prêt': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'Erreur': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStudents = 318;
  const totalTeachers = 15;
  const overallAttendance = 94;
  const averageGrade = 13.7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Rapports & Analyses</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Consultez les performances et statistiques de votre établissement
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Exporter Données</span>
          <span className="sm:hidden">Exporter</span>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Étudiants</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-green-600">
              +12% ce mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Assiduité Moyenne</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{overallAttendance}%</div>
            <p className="text-xs text-green-600">
              +2% cette semaine
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Note Moyenne</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{averageGrade}/20</div>
            <p className="text-xs text-green-600">
              +0.3 ce trimestre
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Enseignants</CardTitle>
            <GraduationCap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Personnel actif
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Analyses Détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Vue d&apos;ensemble</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
              <TabsTrigger value="attendance" className="text-xs sm:text-sm">Assiduité</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Répartition par Niveau</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">6ème</span>
                        <span className="text-sm font-medium">75 étudiants</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">5ème</span>
                        <span className="text-sm font-medium">88 étudiants</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">4ème</span>
                        <span className="text-sm font-medium">92 étudiants</span>
                      </div>
                      <Progress value={29} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">3ème</span>
                        <span className="text-sm font-medium">63 étudiants</span>
                      </div>
                      <Progress value={19} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Évolution Mensuelle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Nouvelles Inscriptions</span>
                        <span className="text-sm font-medium text-green-600">+24</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux de Réussite</span>
                        <span className="text-sm font-medium text-green-600">84%</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Satisfaction Parents</span>
                        <span className="text-sm font-medium text-green-600">91%</span>
                      </div>
                      <Progress value={91} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Assiduité Générale</span>
                        <span className="text-sm font-medium text-green-600">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Performance par Matière</CardTitle>
                  <CardDescription>
                    Moyennes et taux de réussite par matière enseignée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                              <h4 className="text-base font-semibold">{item.subject}</h4>
                              <Badge variant="outline">{item.totalStudents} étudiants</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Moyenne Générale: </span>
                                <span className="font-medium">{item.average}/20</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Taux de Réussite: </span>
                                <span className="font-medium text-green-600">{item.passRate}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Détails
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress value={item.passRate} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Assiduité par Classe</CardTitle>
                  <CardDescription>
                    Statistiques de présence des étudiants par classe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendanceData.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Users className="h-5 w-5 text-green-600" />
                              <h4 className="text-base font-semibold">{item.class}</h4>
                              <Badge variant="outline">{item.total} étudiants</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Présents: </span>
                                <span className="font-medium text-green-600">{item.present}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Absents: </span>
                                <span className="font-medium text-red-600">{item.absent}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">En retard: </span>
                                <span className="font-medium text-yellow-600">{item.late}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {Math.round((item.present / item.total) * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Taux de présence</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress value={(item.present / item.total) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Rapports Générés</CardTitle>
                  <CardDescription>
                    Historique et téléchargement des rapports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const ReportIcon = getReportIcon(report.type);
                      return (
                        <div key={report.id} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <ReportIcon className="h-5 w-5 text-blue-600" />
                                <h4 className="text-base font-semibold">{report.title}</h4>
                                <Badge className={getStatusColor(report.status)}>
                                  {report.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Généré le: {new Date(report.generated).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={report.status !== 'Prêt'}
                                className="w-full sm:w-auto"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={report.status !== 'Prêt'}
                                className="w-full sm:w-auto"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Télécharger</span>
                                <span className="sm:hidden">DL</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
