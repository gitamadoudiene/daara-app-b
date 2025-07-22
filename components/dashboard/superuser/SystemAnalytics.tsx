'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2,
  GraduationCap,
  BookOpen,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Server,
  Database,
  Wifi,
  HardDrive
} from 'lucide-react';

export function SystemAnalytics() {
  // Mock data for charts and analytics
  const overviewStats = [
    { 
      title: 'Utilisateurs Actifs', 
      value: '2,847', 
      change: '+12%', 
      trend: 'up',
      icon: Users, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Écoles Actives', 
      value: '12', 
      change: '+2', 
      trend: 'up',
      icon: Building2, 
      color: 'text-green-600' 
    },
    { 
      title: 'Cours Créés', 
      value: '1,234', 
      change: '+8%', 
      trend: 'up',
      icon: BookOpen, 
      color: 'text-purple-600' 
    },
    { 
      title: 'Sessions Aujourd&apos;hui', 
      value: '456', 
      change: '-3%', 
      trend: 'down',
      icon: Activity, 
      color: 'text-orange-600' 
    }
  ];

  const schoolStats = [
    { school: 'Lycée Daara Excellence', students: 1234, teachers: 89, courses: 156, activity: 95 },
    { school: 'École Privée Al-Azhar', students: 856, teachers: 67, courses: 123, activity: 87 },
    { school: 'Institut Futur Leaders', students: 2156, teachers: 145, courses: 234, activity: 92 },
  ];

  const systemHealth = [
    { metric: 'Temps de Fonctionnement', value: '99.9%', status: 'excellent', icon: Server },
    { metric: 'Performance Base de Données', value: '98.5%', status: 'excellent', icon: Database },
    { metric: 'Connectivité Réseau', value: '97.8%', status: 'good', icon: Wifi },
    { metric: 'Utilisation Stockage', value: '67%', status: 'good', icon: HardDrive },
  ];

  const userActivity = [
    { time: '00:00', users: 45 },
    { time: '06:00', users: 234 },
    { time: '12:00', users: 1456 },
    { time: '18:00', users: 2234 },
    { time: '24:00', users: 567 },
  ];

  const monthlyGrowth = [
    { month: 'Jan', schools: 8, users: 1850, courses: 234 },
    { month: 'Fév', schools: 9, users: 2100, courses: 287 },
    { month: 'Mar', schools: 10, users: 2350, courses: 345 },
    { month: 'Avr', schools: 11, users: 2580, courses: 412 },
    { month: 'Mai', schools: 12, users: 2750, courses: 478 },
    { month: 'Jun', schools: 12, users: 2847, courses: 523 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 border-green-600';
      case 'good': return 'text-blue-600 border-blue-600';
      case 'warning': return 'text-orange-600 border-orange-600';
      case 'critical': return 'text-red-600 border-red-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analyses du Système</h2>
        <p className="text-muted-foreground">
          Statistiques et métriques d&apos;activité à travers toutes les écoles
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="schools">Écoles</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-1 text-xs">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">ce mois</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Croissance Mensuelle</span>
                </CardTitle>
                <CardDescription>Évolution des métriques clés au fil du temps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyGrowth.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.month}</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-blue-600">{data.schools} écoles</span>
                        <span className="text-green-600">{data.users.toLocaleString()} users</span>
                        <span className="text-purple-600">{data.courses} cours</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Activité Quotidienne</span>
                </CardTitle>
                <CardDescription>Utilisateurs actifs par tranches horaires</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.time}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(data.users / 2500) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{data.users.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>État du Système</CardTitle>
              <CardDescription>Métriques de performance et de santé du système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemHealth.map((metric, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <metric.icon className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{metric.metric}</p>
                      <p className="text-lg font-bold">{metric.value}</p>
                      <Badge className={getStatusBg(metric.status)} variant="secondary">
                        {metric.status === 'excellent' ? 'Excellent' : 
                         metric.status === 'good' ? 'Bon' : 
                         metric.status === 'warning' ? 'Attention' : 'Critique'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance par École</CardTitle>
              <CardDescription>Comparaison des métriques entre les différentes écoles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {schoolStats.map((school, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{school.school}</h3>
                      <Badge className={getStatusBg(school.activity >= 90 ? 'excellent' : school.activity >= 80 ? 'good' : 'warning')}>
                        {school.activity}% d&apos;activité
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Étudiants</p>
                          <p className="text-2xl font-bold">{school.students.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Enseignants</p>
                          <p className="text-2xl font-bold">{school.teachers}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Cours</p>
                          <p className="text-2xl font-bold">{school.courses}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Niveau d&apos;Activité</span>
                        <span className="text-sm">{school.activity}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            school.activity >= 90 ? 'bg-green-600' : 
                            school.activity >= 80 ? 'bg-blue-600' : 'bg-orange-600'
                          }`}
                          style={{ width: `${school.activity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">Utilisateurs enregistrés</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
                <GraduationCap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,246</div>
                <p className="text-xs text-muted-foreground">Étudiants actifs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
                <BookOpen className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">301</div>
                <p className="text-xs text-muted-foreground">Enseignants actifs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
                <Shield className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Administrateurs actifs</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des Utilisateurs</CardTitle>
              <CardDescription>Distribution des rôles par école</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schoolStats.map((school, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{school.school}</span>
                      <span className="text-sm text-muted-foreground">
                        {(school.students + school.teachers).toLocaleString()} utilisateurs
                      </span>
                    </div>
                    <div className="flex space-x-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600" 
                        style={{ width: `${(school.students / (school.students + school.teachers)) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-green-600" 
                        style={{ width: `${(school.teachers / (school.students + school.teachers)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{school.students.toLocaleString()} étudiants</span>
                      <span>{school.teachers} enseignants</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métriques Serveur</CardTitle>
                <CardDescription>Performance en temps réel du système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Utilisation CPU</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                      <span className="text-sm">23%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Utilisation Mémoire</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm">45%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Utilisation Disque</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                      <span className="text-sm">67%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Trafic Réseau</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                      </div>
                      <span className="text-sm">34%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temps de Réponse</CardTitle>
                <CardDescription>Latence des différents services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Base de Données</span>
                    <Badge className="bg-green-100 text-green-800">12ms</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Principal</span>
                    <Badge className="bg-green-100 text-green-800">45ms</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Interface Web</span>
                    <Badge className="bg-blue-100 text-blue-800">123ms</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Authentification</span>
                    <Badge className="bg-green-100 text-green-800">67ms</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Incidents et Maintenance</CardTitle>
              <CardDescription>Historique des événements système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Maintenance programmée terminée</p>
                    <p className="text-xs text-muted-foreground">Optimisation de la base de données - 22 Jul 2024, 02:00</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Succès</Badge>
                </div>
                
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mise à jour système déployée</p>
                    <p className="text-xs text-muted-foreground">Version 2.1.3 avec nouvelles fonctionnalités - 20 Jul 2024, 14:30</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Info</Badge>
                </div>
                
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pic de trafic détecté</p>
                    <p className="text-xs text-muted-foreground">Augmentation temporaire de la charge - 18 Jul 2024, 09:15</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Attention</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapports Automatiques</CardTitle>
              <CardDescription>Rapports générés automatiquement par le système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Rapport Mensuel d&apos;Activité</p>
                      <p className="text-sm text-muted-foreground">Statistiques complètes pour juin 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">01 Jul 2024</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <PieChart className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">Analyse de Performance</p>
                      <p className="text-sm text-muted-foreground">Métriques détaillées par école</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">22 Jul 2024</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <LineChart className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-medium">Tendances d&apos;Utilisation</p>
                      <p className="text-sm text-muted-foreground">Analyse des tendances trimestrielles</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-orange-100 text-orange-800">En cours</Badge>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Estimation: 25 Jul 2024</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertes et Notifications</CardTitle>
              <CardDescription>Alertes système en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Système opérationnel</p>
                    <p className="text-xs text-green-600">Tous les services fonctionnent normalement</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Nouvelle école ajoutée</p>
                    <p className="text-xs text-blue-600">Institut Futur Leaders a rejoint le système</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">Utilisation du stockage élevée</p>
                    <p className="text-xs text-orange-600">67% d&apos;utilisation - surveillance recommandée</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
