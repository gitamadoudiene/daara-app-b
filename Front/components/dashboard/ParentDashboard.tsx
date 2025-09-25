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
  BookOpen, 
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  TrendingUp,
  UserCheck,
  Eye,
  School,
  User,
  LogOut,
  Menu,
  ChevronDown,
  GraduationCap,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

// Import page components (we'll create these)
import { 
  MyChildren, 
  GradesReports, 
  Attendance, 
  Homework, 
  Messages, 
  Notifications 
} from './parent';

type ActivePage = 'overview' | 'children' | 'grades' | 'attendance' | 'homework' | 'messages' | 'notifications';

interface Child {
  id: string;
  name: string;
  class: string;
  averageGrade: string;
  numericGrade: number;
  attendanceRate: number;
  profileImage?: string;
  recentGrades: number;
  upcomingTests: number;
}

interface RecentGrade {
  id: string;
  childName: string;
  subject: string;
  assignment: string;
  grade: string;
  numericGrade: number;
  date: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'meeting' | 'test' | 'event' | 'deadline';
  date: string;
  time?: string;
  child?: string;
  description: string;
}

interface Notification {
  id: string;
  type: 'grade' | 'attendance' | 'homework' | 'general';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  child?: string;
}

export function ParentDashboard() {
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  // Mock data for children
  const children: Child[] = [
    {
      id: '1',
      name: 'Emma Dupont',
      class: '2nde A',
      averageGrade: 'A-',
      numericGrade: 16.2,
      attendanceRate: 95,
      profileImage: '/avatars/emma.jpg',
      recentGrades: 3,
      upcomingTests: 2
    },
    {
      id: '2',
      name: 'Lucas Dupont',
      class: '4ème B',
      averageGrade: 'B+',
      numericGrade: 14.8,
      attendanceRate: 92,
      profileImage: '/avatars/lucas.jpg',
      recentGrades: 2,
      upcomingTests: 1
    }
  ];

  // Mock data for recent grades
  const recentGrades: RecentGrade[] = [
    {
      id: '1',
      childName: 'Emma',
      subject: 'Mathématiques',
      assignment: 'Contrôle Chapitre 5',
      grade: 'A',
      numericGrade: 18,
      date: '2024-07-20'
    },
    {
      id: '2',
      childName: 'Lucas',
      subject: 'Sciences',
      assignment: 'Rapport de Laboratoire',
      grade: 'B+',
      numericGrade: 15,
      date: '2024-07-19'
    },
    {
      id: '3',
      childName: 'Emma',
      subject: 'Français',
      assignment: 'Dissertation',
      grade: 'A-',
      numericGrade: 16,
      date: '2024-07-18'
    },
    {
      id: '4',
      childName: 'Lucas',
      subject: 'Histoire-Géo',
      assignment: 'Exposé',
      grade: 'B',
      numericGrade: 14,
      date: '2024-07-17'
    }
  ];

  // Mock data for upcoming events
  const upcomingEvents: UpcomingEvent[] = [
    {
      id: '1',
      title: 'Réunion Parents-Professeurs',
      type: 'meeting',
      date: '2024-07-25',
      time: '15:00',
      description: 'Rencontre trimestrielle avec les enseignants'
    },
    {
      id: '2',
      title: 'Contrôle de Mathématiques',
      type: 'test',
      date: '2024-07-28',
      child: 'Emma',
      description: 'Évaluation sur les fonctions exponentielles'
    },
    {
      id: '3',
      title: 'Foire aux Sciences',
      type: 'event',
      date: '2024-08-02',
      time: '14:00',
      child: 'Lucas',
      description: 'Présentation des projets scientifiques'
    },
    {
      id: '4',
      title: 'Remise Dissertation Français',
      type: 'deadline',
      date: '2024-07-30',
      child: 'Emma',
      description: 'Date limite pour rendre la dissertation'
    }
  ];

  // Mock data for notifications
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'grade',
      title: 'Nouvelle note disponible',
      message: 'Emma a reçu une nouvelle note en Mathématiques',
      timestamp: '2024-07-22 10:30:00',
      isRead: false,
      child: 'Emma'
    },
    {
      id: '2',
      type: 'attendance',
      title: 'Absence signalée',
      message: 'Lucas était absent du cours de Sciences aujourd&apos;hui',
      timestamp: '2024-07-22 09:00:00',
      isRead: false,
      child: 'Lucas'
    },
    {
      id: '3',
      type: 'homework',
      title: 'Nouveau devoir assigné',
      message: 'Emma a reçu un nouveau devoir en Français',
      timestamp: '2024-07-21 16:45:00',
      isRead: true,
      child: 'Emma'
    },
    {
      id: '4',
      type: 'general',
      title: 'Réunion Parents Programmée',
      message: 'Une réunion parents-professeurs est prévue le 25 juillet',
      timestamp: '2024-07-20 14:20:00',
      isRead: true
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'children', label: 'Mes Enfants', icon: Users },
    { id: 'grades', label: 'Notes & Rapports', icon: BookOpen },
    { id: 'attendance', label: 'Présences', icon: UserCheck },
    { id: 'homework', label: 'Devoirs', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell }
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

  const getGradeColor = (numericGrade: number) => {
    if (numericGrade >= 16) return 'bg-green-100 text-green-800';
    if (numericGrade >= 14) return 'bg-blue-100 text-blue-800';
    if (numericGrade >= 12) return 'bg-yellow-100 text-yellow-800';
    if (numericGrade >= 10) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return Users;
      case 'test': return ClipboardList;
      case 'event': return Calendar;
      case 'deadline': return Clock;
      default: return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'test': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grade': return GraduationCap;
      case 'attendance': return UserCheck;
      case 'homework': return FileText;
      case 'general': return Bell;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'grade': return 'bg-green-100 text-green-800';
      case 'attendance': return 'bg-red-100 text-red-800';
      case 'homework': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center flex-shrink-0 px-4 py-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">DAARA</h1>
            <p className="text-xs text-gray-500">Parent</p>
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
                  ? 'bg-green-50 text-green-700 border border-green-200'
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
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'PA'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Parent'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'parent@daara.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Parent'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'parent@daara.com'}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full w-fit ${getRoleColor(user?.role || 'parent')}`}>
                  {getRoleLabel(user?.role || 'parent')}
                </span>
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
  );

  const renderActivePage = () => {
    switch (activePage) {
      case 'children':
        return <MyChildren />;
      case 'grades':
        return <GradesReports />;
      case 'attendance':
        return <Attendance />;
      case 'homework':
        return <Homework />;
      case 'messages':
        return <Messages />;
      case 'notifications':
        return <Notifications />;
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Tableau de Bord Parent</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Bienvenue, {user?.name || 'Parent'} ! Suivez la scolarité de vos enfants
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
                  <span className="hidden xs:inline">Calendrier</span>
                  <span className="xs:hidden">Cal</span>
                </Button>
              </div>
            </div>

            {/* Children Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={child.profileImage} alt={child.name} />
                          <AvatarFallback>
                            {child.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{child.name}</CardTitle>
                          <Badge variant="secondary">{child.class}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold px-2 py-1 rounded ${getGradeColor(child.numericGrade)}`}>
                          {child.averageGrade}
                        </div>
                        <div className="text-xs text-muted-foreground">Moyenne</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold text-blue-700">
                            {child.attendanceRate}%
                          </div>
                          <div className="text-xs text-blue-600">Présence</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-700">
                            {child.numericGrade}/20
                          </div>
                          <div className="text-xs text-green-600">Moyenne</div>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{child.recentGrades} nouvelles notes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClipboardList className="h-4 w-4" />
                          <span>{child.upcomingTests} contrôles à venir</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handlePageChange('children')}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir Détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Recent Grades */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Notes Récentes</CardTitle>
                  <CardDescription>
                    Dernières évaluations de vos enfants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentGrades.slice(0, 4).map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{grade.childName} - {grade.subject}</p>
                          <p className="text-xs text-muted-foreground">{grade.assignment}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(grade.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Badge className={getGradeColor(grade.numericGrade)}>
                          {grade.grade}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4" 
                    onClick={() => handlePageChange('grades')}
                  >
                    Voir toutes les notes
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Événements à Venir</CardTitle>
                  <CardDescription>
                    Dates importantes et échéances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {upcomingEvents.slice(0, 4).map((event) => {
                      const EventIcon = getEventIcon(event.type);
                      return (
                        <div key={event.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:shadow-sm transition-shadow">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <EventIcon className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getEventColor(event.type)} variant="secondary">
                                {event.child || 'Général'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('fr-FR')}
                                {event.time && ` - ${event.time}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4"
                    onClick={() => handlePageChange('notifications')}
                  >
                    Voir tous les événements
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Notifications Récentes</CardTitle>
                <CardDescription>
                  Mises à jour importantes concernant vos enfants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {notifications.slice(0, 3).map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification.type);
                    return (
                      <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:shadow-sm'} transition-shadow`}>
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <NotificationIcon className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {notification.child && (
                              <Badge className={getNotificationColor(notification.type)} variant="secondary">
                                {notification.child}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
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
                <Button 
                  variant="ghost" 
                  className="w-full mt-4"
                  onClick={() => handlePageChange('notifications')}
                >
                  Voir toutes les notifications
                </Button>
              </CardContent>
            </Card>
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
                <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
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
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'PA'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Parent'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'parent@daara.com'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${getRoleColor(user?.role || 'parent')}`}>
                        {getRoleLabel(user?.role || 'parent')}
                      </span>
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