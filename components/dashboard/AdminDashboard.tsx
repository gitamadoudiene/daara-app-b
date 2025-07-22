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
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Bell,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Database,
  FileText,
  School,
  UserCheck,
  ClipboardList,
  Activity,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

import { UserManagement } from './admin/UserManagement';
import { SchoolStructure } from './admin/SchoolStructure';
import { ReportsAnalytics } from './admin/ReportsAnalytics';
import { SecuritySettings } from './admin/SecuritySettings';
import { DataManagement } from './admin/DataManagement';
import { SystemSettings } from './admin/SystemSettings';

type ActivePage = 'overview' | 'users' | 'structure' | 'reports' | 'security' | 'data' | 'system';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  pendingReports: number;
  systemHealth: number;
}

interface RecentActivity {
  id: string;
  type: 'user_creation' | 'class_update' | 'report_generated' | 'security_alert';
  message: string;
  timestamp: string;
  user: string;
}

export function AdminDashboard() {
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  // Mock dashboard stats
  const stats: DashboardStats = {
    totalUsers: 1580,
    totalStudents: 1234,
    totalTeachers: 89,
    totalClasses: 45,
    activeClasses: 42,
    pendingReports: 12,
    systemHealth: 98
  };

  // Mock recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user_creation',
      message: 'Nouvel étudiant ajouté: Aïssa Diallo',
      timestamp: '2024-07-22 14:30:00',
      user: 'Admin Principal'
    },
    {
      id: '2',
      type: 'class_update',
      message: 'Classe CE2 mise à jour - 28 élèves',
      timestamp: '2024-07-22 13:15:00',
      user: 'Directeur Pédagogique'
    },
    {
      id: '3',
      type: 'report_generated',
      message: 'Rapport mensuel généré avec succès',
      timestamp: '2024-07-22 12:00:00',
      user: 'Système'
    },
    {
      id: '4',
      type: 'security_alert',
      message: 'Tentative de connexion suspecte détectée',
      timestamp: '2024-07-22 11:45:00',
      user: 'Système de Sécurité'
    },
    {
      id: '5',
      type: 'user_creation',
      message: 'Nouveau professeur ajouté: M. Mamadou Sow',
      timestamp: '2024-07-22 10:30:00',
      user: 'Admin Principal'
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'users', label: 'Gestion Utilisateurs', icon: Users },
    { id: 'structure', label: 'Structure École', icon: School },
    { id: 'reports', label: 'Rapports & Analytics', icon: FileText },
    { id: 'security', label: 'Paramètres Sécurité', icon: Shield },
    { id: 'data', label: 'Gestion Données', icon: Database },
    { id: 'system', label: 'Paramètres Système', icon: Settings }
  ];

  const handlePageChange = (pageId: ActivePage) => {
    setActivePage(pageId);
    setMobileMenuOpen(false); // Close mobile menu when page changes
  };

  const handleLogout = () => {
    logout();
    // Optionally redirect to login page
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
      case 'user_creation': return UserCheck;
      case 'class_update': return ClipboardList;
      case 'report_generated': return FileText;
      case 'security_alert': return Shield;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_creation': return 'bg-green-100 text-green-800';
      case 'class_update': return 'bg-blue-100 text-blue-800';
      case 'report_generated': return 'bg-purple-100 text-purple-800';
      case 'security_alert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <p className="text-xs text-gray-500">Administration</p>
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
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin Principal'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@daara.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Admin Principal'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'admin@daara.com'}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full w-fit ${getRoleColor(user?.role || 'admin')}`}>
                  {getRoleLabel(user?.role || 'admin')}
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
      case 'users':
        return <UserManagement />;
      case 'structure':
        return <SchoolStructure />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'security':
        return <SecuritySettings />;
      case 'data':
        return <DataManagement />;
      case 'system':
        return <SystemSettings />;
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Tableau de Bord Administrateur</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Vue d&apos;ensemble de votre établissement scolaire
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
                  <span className="hidden xs:inline">Calendrier</span>
                  <span className="xs:hidden">Cal</span>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{Math.floor(stats.totalUsers * 0.02)} ce mois
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Étudiants Actifs</CardTitle>
                  <GraduationCap className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalTeachers} enseignants
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Classes Actives</CardTitle>
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.activeClasses}</div>
                  <p className="text-xs text-muted-foreground">
                    sur {stats.totalClasses} classes
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Santé Système</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.systemHealth}%</div>
                  <p className="text-xs text-muted-foreground">
                    Performances optimales
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              {/* Quick Actions */}
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Actions Rapides</CardTitle>
                  <CardDescription>
                    Accès rapide aux fonctionnalités principales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handlePageChange('users')}
                  >
                    <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Ajouter Utilisateur</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handlePageChange('structure')}
                  >
                    <School className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Créer Classe</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handlePageChange('reports')}
                  >
                    <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Générer Rapport</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handlePageChange('data')}
                  >
                    <Database className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Sauvegarder Données</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handlePageChange('system')}
                  >
                    <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Paramètres Système</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Activités Récentes</CardTitle>
                  <CardDescription>
                    Dernières actions effectuées dans le système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivities.map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="flex-shrink-0">
                            <ActivityIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {activity.message}
                            </p>
                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 mt-1">
                              <Badge className={getActivityColor(activity.type)}>
                                {activity.type === 'user_creation' ? 'Utilisateur' :
                                 activity.type === 'class_update' ? 'Classe' :
                                 activity.type === 'report_generated' ? 'Rapport' : 'Sécurité'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Par: {activity.user}
                            </p>
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
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Admin Principal'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'admin@daara.com'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${getRoleColor(user?.role || 'admin')}`}>
                        {getRoleLabel(user?.role || 'admin')}
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