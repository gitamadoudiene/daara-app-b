'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  BookOpen, 
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bell,
  MessageSquare,
  GraduationCap,
  Star,
  CalendarDays,
  ClipboardList,
  Award,
  School,
  LogOut,
  Menu,
  ChevronDown,
  UserCheck,
  Eye,
  Users,
  Plus,
  BarChart3
} from 'lucide-react';

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState('overview');

  const handleLogout = () => {
    logout();
  };

  // Mock data pour l'étudiant
  const student = {
    name: 'Fatou Diop',
    class: 'Terminale S2',
    avatar: '/avatars/fatou.jpg',
    school: 'Lycée Daara Excellence',
    studentId: 'STU2024001'
  };

  // Emploi du temps d'aujourd'hui
  const todaySchedule = [
    { 
      subject: 'Mathématiques', 
      time: '08h00 - 09h00', 
      teacher: 'M. Mamadou Sall',
      room: 'Salle 15',
      type: 'Cours'
    },
    { 
      subject: 'Physique-Chimie', 
      time: '09h00 - 10h00', 
      teacher: 'Mme. Aissatou Diallo',
      room: 'Labo 2',
      type: 'TP'
    },
    { 
      subject: 'Français', 
      time: '10h30 - 11h30', 
      teacher: 'M. Ousmane Ndiaye',
      room: 'Salle 8',
      type: 'Cours'
    },
    { 
      subject: 'Anglais', 
      time: '14h00 - 15h00', 
      teacher: 'Mme. Sarah Johnson',
      room: 'Salle 12',
      type: 'Cours'
    },
    { 
      subject: 'Histoire-Géo', 
      time: '15h00 - 16h00', 
      teacher: 'M. Abdoulaye Ba',
      room: 'Salle 20',
      type: 'Cours'
    }
  ];

  // Emploi du temps complet de la semaine
  const weekSchedule = {
    'Lundi': [
      { subject: 'Mathématiques', time: '08h00 - 09h00', teacher: 'M. Mamadou Sall', room: 'Salle 15' },
      { subject: 'Physique-Chimie', time: '09h00 - 10h00', teacher: 'Mme. Aissatou Diallo', room: 'Labo 2' },
      { subject: 'Français', time: '10h30 - 11h30', teacher: 'M. Ousmane Ndiaye', room: 'Salle 8' },
      { subject: 'Anglais', time: '14h00 - 15h00', teacher: 'Mme. Sarah Johnson', room: 'Salle 12' },
      { subject: 'Histoire-Géo', time: '15h00 - 16h00', teacher: 'M. Abdoulaye Ba', room: 'Salle 20' }
    ],
    'Mardi': [
      { subject: 'SVT', time: '08h00 - 09h00', teacher: 'Dr. Fatou Sy', room: 'Labo 3' },
      { subject: 'Mathématiques', time: '09h00 - 10h00', teacher: 'M. Mamadou Sall', room: 'Salle 15' },
      { subject: 'Philosophie', time: '10h30 - 11h30', teacher: 'M. Cheikh Fall', room: 'Salle 22' },
      { subject: 'EPS', time: '14h00 - 15h00', teacher: 'M. Omar Kane', room: 'Gymnase' },
      { subject: 'Informatique', time: '15h00 - 16h00', teacher: 'Mme. Awa Thiam', room: 'Salle Info' }
    ],
    'Mercredi': [
      { subject: 'Français', time: '08h00 - 09h00', teacher: 'M. Ousmane Ndiaye', room: 'Salle 8' },
      { subject: 'Anglais', time: '09h00 - 10h00', teacher: 'Mme. Sarah Johnson', room: 'Salle 12' },
      { subject: 'Mathématiques', time: '10h30 - 11h30', teacher: 'M. Mamadou Sall', room: 'Salle 15' }
    ],
    'Jeudi': [
      { subject: 'Histoire-Géo', time: '08h00 - 09h00', teacher: 'M. Abdoulaye Ba', room: 'Salle 20' },
      { subject: 'Physique-Chimie', time: '09h00 - 10h00', teacher: 'Mme. Aissatou Diallo', room: 'Labo 2' },
      { subject: 'SVT', time: '10h30 - 11h30', teacher: 'Dr. Fatou Sy', room: 'Labo 3' },
      { subject: 'Philosophie', time: '14h00 - 15h00', teacher: 'M. Cheikh Fall', room: 'Salle 22' },
      { subject: 'Arts Plastiques', time: '15h00 - 16h00', teacher: 'Mme. Mariama Diop', room: 'Atelier' }
    ],
    'Vendredi': [
      { subject: 'Mathématiques', time: '08h00 - 09h00', teacher: 'M. Mamadou Sall', room: 'Salle 15' },
      { subject: 'Français', time: '09h00 - 10h00', teacher: 'M. Ousmane Ndiaye', room: 'Salle 8' },
      { subject: 'Anglais', time: '10h30 - 11h30', teacher: 'Mme. Sarah Johnson', room: 'Salle 12' },
      { subject: 'EPS', time: '14h00 - 15h00', teacher: 'M. Omar Kane', room: 'Gymnase' }
    ]
  };

  // Notes récentes
  const recentGrades = [
    { 
      subject: 'Mathématiques', 
      assignment: 'Contrôle - Fonctions', 
      grade: '16/20', 
      date: '2024-01-15',
      coefficient: 2,
      average: '14/20',
      teacher: 'M. Mamadou Sall'
    },
    { 
      subject: 'Physique', 
      assignment: 'TP - Optique', 
      grade: '18/20', 
      date: '2024-01-12',
      coefficient: 1,
      average: '15/20',
      teacher: 'Mme. Aissatou Diallo'
    },
    { 
      subject: 'Français', 
      assignment: 'Dissertation', 
      grade: '14/20', 
      date: '2024-01-10',
      coefficient: 3,
      average: '13/20',
      teacher: 'M. Ousmane Ndiaye'
    },
    { 
      subject: 'Anglais', 
      assignment: 'Oral - Présentation', 
      grade: '17/20', 
      date: '2024-01-08',
      coefficient: 2,
      average: '16/20',
      teacher: 'Mme. Sarah Johnson'
    }
  ];

  // Toutes les notes par matière
  const allGrades = {
    'Mathématiques': [
      { assignment: 'Contrôle - Fonctions', grade: '16/20', coefficient: 2, date: '2024-01-15' },
      { assignment: 'DS - Dérivées', grade: '14/20', coefficient: 3, date: '2024-01-08' },
      { assignment: 'Interrogation', grade: '18/20', coefficient: 1, date: '2024-01-03' },
      { assignment: 'DM - Exercices', grade: '15/20', coefficient: 1, date: '2023-12-20' }
    ],
    'Physique-Chimie': [
      { assignment: 'TP - Optique', grade: '18/20', coefficient: 1, date: '2024-01-12' },
      { assignment: 'Contrôle - Mécanique', grade: '13/20', coefficient: 2, date: '2024-01-05' },
      { assignment: 'TP - Chimie', grade: '16/20', coefficient: 1, date: '2023-12-18' }
    ],
    'Français': [
      { assignment: 'Dissertation', grade: '14/20', coefficient: 3, date: '2024-01-10' },
      { assignment: 'Commentaire', grade: '16/20', coefficient: 2, date: '2023-12-15' },
      { assignment: 'Oral', grade: '15/20', coefficient: 1, date: '2023-12-08' }
    ],
    'Anglais': [
      { assignment: 'Oral - Présentation', grade: '17/20', coefficient: 2, date: '2024-01-08' },
      { assignment: 'Expression écrite', grade: '15/20', coefficient: 2, date: '2023-12-20' },
      { assignment: 'Compréhension', grade: '18/20', coefficient: 1, date: '2023-12-13' }
    ]
  };

  // Devoirs à rendre
  const upcomingHomework = [
    { 
      subject: 'Mathématiques', 
      title: 'Exercices chapitre 8 - Dérivées', 
      dueDate: '2024-01-25',
      priority: 'high',
      estimated: '2h',
      description: 'Exercices 1 à 15 page 145',
      teacher: 'M. Mamadou Sall'
    },
    { 
      subject: 'Physique', 
      title: 'Rapport TP - Lentilles', 
      dueDate: '2024-01-26',
      priority: 'medium',
      estimated: '1h30',
      description: 'Rédaction du compte-rendu du TP sur les lentilles minces',
      teacher: 'Mme. Aissatou Diallo'
    },
    { 
      subject: 'Histoire', 
      title: 'Exposé - Seconde Guerre Mondiale', 
      dueDate: '2024-01-30',
      priority: 'high',
      estimated: '3h',
      description: 'Présentation de 10 minutes sur un aspect de la 2e GM',
      teacher: 'M. Abdoulaye Ba'
    },
    { 
      subject: 'Anglais', 
      title: 'Essay - Future Plans', 
      dueDate: '2024-02-02',
      priority: 'medium',
      estimated: '1h',
      description: 'Write a 300-word essay about your future plans',
      teacher: 'Mme. Sarah Johnson'
    }
  ];

  // Messages
  const messages = [
    {
      id: '1',
      from: 'M. Mamadou Sall',
      subject: 'Contrôle de Mathématiques',
      content: 'Le prochain contrôle de mathématiques aura lieu vendredi 26 janvier. Révisez bien les chapitres 7 et 8.',
      date: '2024-01-20',
      isRead: false,
      type: 'teacher'
    },
    {
      id: '2',
      from: 'Administration',
      subject: 'Réunion Parents-Professeurs',
      content: 'Une réunion parents-professeurs est programmée le 2 février à 18h en salle de conférence.',
      date: '2024-01-18',
      isRead: true,
      type: 'admin'
    },
    {
      id: '3',
      from: 'Mme. Sarah Johnson',
      subject: 'Correction Devoir Anglais',
      content: 'Votre devoir d\'anglais a été corrigé. Vous avez obtenu 17/20. Félicitations !',
      date: '2024-01-16',
      isRead: true,
      type: 'teacher'
    }
  ];

  // Annonces
  const announcements = [
    { 
      title: 'Réunion d\'information - Orientation', 
      content: 'Séance d\'information sur les choix d\'orientation post-bac demain à 10h en salle de conférence.',
      date: '2024-01-20',
      type: 'info'
    },
    { 
      title: 'Sortie pédagogique', 
      content: 'Visite du musée d\'art contemporain le 28 janvier. Autorisation parentale requise.',
      date: '2024-01-18',
      type: 'event'
    },
    { 
      title: 'Contrôle de Mathématiques', 
      content: 'Contrôle sur les fonctions dérivées prévu le 2 février. Réviser les chapitres 7 et 8.',
      date: '2024-01-17',
      type: 'exam'
    }
  ];

  // Statistiques
  const stats = [
    { 
      title: 'Moyenne Générale', 
      value: '15.8/20', 
      icon: TrendingUp, 
      color: 'text-green-600',
      description: '+0.5 vs trimestre précédent'
    },
    { 
      title: 'Présence', 
      value: '96%', 
      icon: CheckCircle, 
      color: 'text-blue-600',
      description: '2 absences ce mois'
    },
    { 
      title: 'Devoirs en Retard', 
      value: '0', 
      icon: FileText, 
      color: 'text-green-600',
      description: 'Excellent suivi'
    },
    { 
      title: 'Prochains Contrôles', 
      value: '3', 
      icon: AlertCircle, 
      color: 'text-orange-600',
      description: 'Cette semaine'
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'schedule', label: 'Mon Emploi du Temps', icon: Calendar },
    { id: 'grades', label: 'Mes Notes', icon: Award },
    { id: 'homework', label: 'Devoirs', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Mon Profil', icon: User }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'exam': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getGradeColor = (grade: string) => {
    const numericGrade = parseInt(grade.split('/')[0]);
    if (numericGrade >= 16) return 'text-green-600';
    if (numericGrade >= 14) return 'text-blue-600';
    if (numericGrade >= 12) return 'text-orange-600';
    return 'text-red-600';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center flex-shrink-0 px-4 py-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">DAARA</h1>
            <p className="text-xs text-gray-500">Élève</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activePage === item.id
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const TopBar = () => (
    <div className="bg-white border-b px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-900">
              {sidebarItems.find(item => item.id === activePage)?.label || 'Tableau de Bord'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium">{student.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{student.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{student.class}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Tableau de Bord Élève</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bonjour, {student.name} ! Voici votre aperçu académique du jour
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button size="sm" className="w-full sm:w-auto">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Messages</span>
            <span className="xs:hidden">Msg</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Emploi du temps</span>
            <span className="xs:hidden">EDT</span>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contenu principal en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Emploi du temps d'aujourd'hui */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5" />
              Emploi du Temps - Aujourd&apos;hui
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((class_item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="text-sm font-medium text-blue-600 min-w-[80px]">
                    {class_item.time}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{class_item.subject}</div>
                    <div className="text-sm text-muted-foreground">{class_item.teacher}</div>
                    <div className="text-xs text-muted-foreground">{class_item.room} • {class_item.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes récentes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Notes Récentes
            </CardTitle>
            <CardDescription>Vos dernières évaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGrades.slice(0, 4).map((grade, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{grade.subject}</div>
                    <div className="text-xs text-muted-foreground">{grade.assignment}</div>
                    <div className="text-xs text-muted-foreground">
                      Moyenne classe: {grade.average}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getGradeColor(grade.grade)}`}>{grade.grade}</div>
                    <div className="text-xs text-muted-foreground">Coef. {grade.coefficient}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deuxième ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Devoirs à rendre */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Devoirs à Rendre
            </CardTitle>
            <CardDescription>Vos prochaines échéances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHomework.slice(0, 4).map((homework, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{homework.subject}</div>
                      <div className="text-sm text-muted-foreground">{homework.title}</div>
                    </div>
                    <Badge className={getPriorityColor(homework.priority)}>
                      {homework.priority === 'high' ? 'Urgent' : homework.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>À rendre: {new Date(homework.dueDate).toLocaleDateString('fr-FR')}</span>
                    <span>Temps estimé: {homework.estimated}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Annonces */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Annonces & Notifications
            </CardTitle>
            <CardDescription>Informations importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((announcement, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getAnnouncementIcon(announcement.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{announcement.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{announcement.content}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(announcement.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mon Emploi du Temps Complet</CardTitle>
          <CardDescription>Planning de la semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(weekSchedule).map(([day, classes]) => (
              <div key={day} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
                <div className="grid gap-3">
                  {classes.map((class_item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-600 min-w-[100px]">
                        {class_item.time}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{class_item.subject}</div>
                        <div className="text-sm text-muted-foreground">{class_item.teacher}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {class_item.room}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGrades = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulletin de Notes</CardTitle>
          <CardDescription>Toutes vos évaluations par matière</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(allGrades).map(([subject, grades]) => (
              <div key={subject} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">{subject}</h3>
                <div className="grid gap-3">
                  {grades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{grade.assignment}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(grade.date).toLocaleDateString('fr-FR')} • Coefficient {grade.coefficient}
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHomework = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Devoirs</CardTitle>
          <CardDescription>Tous vos devoirs et échéances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingHomework.map((homework, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-lg">{homework.subject}</h3>
                      <Badge className={getPriorityColor(homework.priority)}>
                        {homework.priority === 'high' ? 'Urgent' : homework.priority === 'medium' ? 'Moyen' : 'Faible'}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">{homework.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{homework.description}</div>
                    <div className="text-xs text-muted-foreground">Professeur: {homework.teacher}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    À rendre: {new Date(homework.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-muted-foreground">Temps estimé: {homework.estimated}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Communications avec vos professeurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`p-4 border rounded-lg ${!message.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{message.from}</h3>
                      <Badge variant={message.type === 'teacher' ? 'default' : 'secondary'}>
                        {message.type === 'teacher' ? 'Professeur' : 'Administration'}
                      </Badge>
                      {!message.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">{message.subject}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(message.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{message.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Centre de Notifications</CardTitle>
          <CardDescription>Toutes vos notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  {getAnnouncementIcon(announcement.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">{announcement.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{announcement.content}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(announcement.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mon Profil</CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="text-lg">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{student.name}</h3>
                <p className="text-muted-foreground">{student.class}</p>
                <p className="text-sm text-muted-foreground">{student.school}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Numéro Étudiant</label>
                <p className="text-muted-foreground">{student.studentId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Classe</label>
                <p className="text-muted-foreground">{student.class}</p>
              </div>
              <div>
                <label className="text-sm font-medium">École</label>
                <p className="text-muted-foreground">{student.school}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Moyenne Générale</label>
                <p className="text-muted-foreground">15.8/20</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivePage = () => {
    switch (activePage) {
      case 'schedule':
        return renderSchedule();
      case 'grades':
        return renderGrades();
      case 'homework':
        return renderHomework();
      case 'messages':
        return renderMessages();
      case 'notifications':
        return renderNotifications();
      case 'profile':
        return renderProfile();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <SidebarContent />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-4 md:p-6">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
