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
  Users,
  GraduationCap,
  Calendar,
  Clock,
  FileText,
  Upload,
  Plus,
  CheckSquare,
  Bell,
  BarChart3,
  Settings,
  School,
  User,
  LogOut,
  Menu,
  ChevronDown,
  Play,
  Eye,
  Edit,
  ClipboardList,
  TrendingUp,
  Activity
} from 'lucide-react';

// Import page components (we'll create these)
import { 
  MyClasses, 
  GradesAssessment, 
  Attendance, 
  HomeworkAssignments, 
  Documents, 
  ProgressReports 
} from './teacher';

type ActivePage = 'overview' | 'classes' | 'grades' | 'attendance' | 'homework' | 'documents' | 'reports';

interface ClassSession {
  id: string;
  subject: string;
  class: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'current' | 'completed';
  students: number;
}

interface RecentActivity {
  id: string;
  type: 'grade' | 'attendance' | 'homework' | 'material';
  message: string;
  timestamp: string;
  class: string;
}

interface DashboardStats {
  myClasses: number;
  totalStudents: number;
  pendingGrades: number;
  todaysLessons: number;
}

export function TeacherDashboard() {
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  // Mock data for dashboard stats
  const stats: DashboardStats = {
    myClasses: 8,
    totalStudents: 185,
    pendingGrades: 12,
    todaysLessons: 4
  };

  // Mock today's schedule
  const todaySchedule: ClassSession[] = [
    {
      id: '1',
      subject: 'Mathématiques',
      class: '6ème A',
      time: '08:00',
      duration: '1h',
      status: 'completed',
      students: 28
    },
    {
      id: '2',
      subject: 'Mathématiques',
      class: '5ème B',
      time: '09:30',
      duration: '1h',
      status: 'current',
      students: 32
    },
    {
      id: '3',
      subject: 'Mathématiques',
      class: '4ème A',
      time: '11:00',
      duration: '1h',
      status: 'upcoming',
      students: 25
    },
    {
      id: '4',
      subject: 'Mathématiques',
      class: '3ème C',
      time: '14:30',
      duration: '1h',
      status: 'upcoming',
      students: 30
    }
  ];

  // Mock recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'grade',
      message: 'Notes du contrôle de mathématiques saisies',
      timestamp: '2024-07-22 14:30:00',
      class: '6ème A'
    },
    {
      id: '2',
      type: 'attendance',
      message: 'Présence enregistrée pour le cours du matin',
      timestamp: '2024-07-22 09:15:00',
      class: '5ème B'
    },
    {
      id: '3',
      type: 'homework',
      message: 'Exercices chapitre 5 assignés',
      timestamp: '2024-07-22 08:45:00',
      class: '4ème A'
    },
    {
      id: '4',
      type: 'material',
      message: 'Cours sur les fractions uploadé',
      timestamp: '2024-07-21 16:20:00',
      class: '6ème A'
    },
    {
      id: '5',
      type: 'grade',
      message: 'Évaluation de géométrie corrigée',
      timestamp: '2024-07-21 15:10:00',
      class: '3ème C'
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'classes', label: 'Mes Classes', icon: Users },
    { id: 'grades', label: 'Notes & Évaluations', icon: GraduationCap },
    { id: 'attendance', label: 'Présences', icon: CheckSquare },
    { id: 'homework', label: 'Devoirs & Travaux', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'reports', label: 'Rapports de Progrès', icon: TrendingUp }
  ];

  const handlePageChange = (pageId: ActivePage) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_user': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_user': return 'Super Utilisateur';
      case 'admin': return 'Administrateur';
      case 'teacher': return 'Enseignant';
      case 'parent': return 'Parent';
      case 'student': return 'Étudiant';
      default: return 'Utilisateur';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grade': return GraduationCap;
      case 'attendance': return CheckSquare;
      case 'homework': return FileText;
      case 'material': return Upload;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'grade': return 'bg-purple-100 text-purple-800';
      case 'attendance': return 'bg-green-100 text-green-800';
      case 'homework': return 'bg-blue-100 text-blue-800';
      case 'material': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current': return 'En cours';
      case 'upcoming': return 'À venir';
      case 'completed': return 'Terminé';
      default: return 'Inconnu';
    }
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
            <p className="text-xs text-gray-500">Enseignant</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id as ActivePage)}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activePage === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* User Profile Section */}
      <div className="border-t px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'EN'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Enseignant'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'teacher@daara.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Enseignant'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'teacher@daara.com'}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full w-fit ${getRoleColor(user?.role || 'teacher')}`}>
                  {getRoleLabel(user?.role || 'teacher')}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
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
  );

  const renderActivePage = () => {
    switch (activePage) {
      case 'classes':
        return <MyClasses />;
      case 'grades':
        return <GradesAssessment />;
      case 'attendance':
        return <Attendance />;
      case 'homework':
        return <HomeworkAssignments />;
      case 'documents':
        return <Documents />;
      case 'reports':
        return <ProgressReports />;
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Tableau de Bord Enseignant</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Bienvenue, {user?.name || 'Enseignant'} ! Gérez vos classes et évaluations
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button size="sm" className="w-full sm:w-auto">
                  <Bell className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Notifications</span>
                  <span className="xs:hidden">Notif</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Planning</span>
                  <span className="xs:hidden">Plan</span>
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Actions Rapides</CardTitle>
                <CardDescription>
                  Accès direct aux tâches fréquentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center space-y-2"
                    onClick={() => handlePageChange('grades')}
                  >
                    <Plus className="h-5 w-5 text-purple-600" />
                    <span className="text-xs sm:text-sm font-medium">Ajouter Notes</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center space-y-2"
                    onClick={() => handlePageChange('attendance')}
                  >
                    <CheckSquare className="h-5 w-5 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium">Faire l&apos;Appel</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center space-y-2"
                    onClick={() => handlePageChange('homework')}
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-xs sm:text-sm font-medium">Donner Devoirs</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center space-y-2"
                    onClick={() => handlePageChange('documents')}
                  >
                    <Upload className="h-5 w-5 text-orange-600" />
                    <span className="text-xs sm:text-sm font-medium">Upload Docs</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Mes Classes</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.myClasses}</div>
                  <p className="text-xs text-muted-foreground">
                    Classes assignées
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Étudiants</CardTitle>
                  <GraduationCap className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Étudiants sous ma responsabilité
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Notes en Attente</CardTitle>
                  <ClipboardList className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.pendingGrades}</div>
                  <p className="text-xs text-muted-foreground">
                    Évaluations à saisir
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Cours Aujourd&apos;hui</CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.todaysLessons}</div>
                  <p className="text-xs text-muted-foreground">
                    Cours programmés
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule & Recent Activities */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              {/* Today's Schedule */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Planning d&apos;Aujourd&apos;hui</CardTitle>
                  <CardDescription>
                    Vos cours programmés pour aujourd&apos;hui
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {todaySchedule.map((session) => (
                      <div key={session.id} className="flex items-center space-x-4 p-3 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold truncate">{session.subject}</h4>
                            <Badge variant="outline">{session.class}</Badge>
                            <Badge className={getStatusColor(session.status)}>
                              {getStatusLabel(session.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{session.time} - {session.duration}</span>
                            <span>{session.students} étudiants</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {session.status === 'current' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Play className="mr-1 h-3 w-3" />
                              Continuer
                            </Button>
                          )}
                          {session.status === 'upcoming' && (
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-3 w-3" />
                              Préparer
                            </Button>
                          )}
                          {session.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <Edit className="mr-1 h-3 w-3" />
                              Modifier
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Activités Récentes</CardTitle>
                  <CardDescription>
                    Vos dernières actions d&apos;enseignement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivities.map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <ActivityIcon className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {activity.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getActivityColor(activity.type)} variant="secondary">
                                {activity.class}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <SidebarContent />
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <School className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">DAARA</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'EN'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Enseignant'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'teacher@daara.com'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${getRoleColor(user?.role || 'teacher')}`}>
                        {getRoleLabel(user?.role || 'teacher')}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
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

        {/* Page Content */}
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderActivePage()}
          </div>
        </main>
      </div>
    </div>
  );
}