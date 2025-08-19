'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  BookOpen,
  User,
  School,
  MessageSquare,
  Clock,
  Star,
  Trash2,
  Settings,
  Filter,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Archive,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent' | 'reminder';
  category: 'academic' | 'behavior' | 'administrative' | 'event' | 'grade' | 'attendance' | 'homework';
  timestamp: string;
  read: boolean;
  starred: boolean;
  childName?: string;
  source: 'teacher' | 'admin' | 'system' | 'school';
  sourceName: string;
  actionRequired: boolean;
  expiresAt?: string;
  relatedLink?: string;
}

interface NotificationSettings {
  categories: {
    academic: boolean;
    behavior: boolean;
    administrative: boolean;
    event: boolean;
    grade: boolean;
    attendance: boolean;
    homework: boolean;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  schedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    weekendsEnabled: boolean;
  };
  priority: {
    urgent: boolean;
    warning: boolean;
    info: boolean;
  };
}

export function Notifications() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    categories: {
      academic: true,
      behavior: true,
      administrative: true,
      event: true,
      grade: true,
      attendance: true,
      homework: true
    },
    channels: {
      push: true,
      email: true,
      sms: false
    },
    schedule: {
      enabled: true,
      startTime: '07:00',
      endTime: '22:00',
      weekendsEnabled: false
    },
    priority: {
      urgent: true,
      warning: true,
      info: true
    }
  });

  // Mock data for notifications
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Nouveau devoir assigné',
      content: 'M. Dubois a assigné un nouveau devoir de mathématiques à Emma. Échéance: 25 juillet 2024.',
      type: 'info',
      category: 'homework',
      timestamp: '2024-07-22T15:30:00Z',
      read: false,
      starred: false,
      childName: 'Emma',
      source: 'teacher',
      sourceName: 'M. Dubois',
      actionRequired: true,
      expiresAt: '2024-07-25T23:59:00Z',
      relatedLink: '/homework'
    },
    {
      id: '2',
      title: 'Absence signalée',
      content: 'Lucas a été marqué absent en cours de sciences ce matin. Aucune justification fournie.',
      type: 'warning',
      category: 'attendance',
      timestamp: '2024-07-22T11:00:00Z',
      read: false,
      starred: true,
      childName: 'Lucas',
      source: 'teacher',
      sourceName: 'Mme. Laurent',
      actionRequired: true,
      relatedLink: '/attendance'
    },
    {
      id: '3',
      title: 'Excellente performance',
      content: 'Emma a obtenu 18/20 au contrôle de mathématiques. Félicitations pour cet excellent résultat !',
      type: 'success',
      category: 'grade',
      timestamp: '2024-07-22T10:15:00Z',
      read: true,
      starred: true,
      childName: 'Emma',
      source: 'teacher',
      sourceName: 'M. Dubois',
      actionRequired: false,
      relatedLink: '/grades'
    },
    {
      id: '4',
      title: 'URGENT - Modification horaires',
      content: 'Les horaires du bus scolaire sont modifiés à partir de demain. Nouveau départ: 16h45.',
      type: 'urgent',
      category: 'administrative',
      timestamp: '2024-07-21T16:30:00Z',
      read: true,
      starred: false,
      source: 'admin',
      sourceName: 'Direction',
      actionRequired: true,
      expiresAt: '2024-07-23T00:00:00Z'
    },
    {
      id: '5',
      title: 'Réunion parents-professeurs',
      content: 'Réunion prévue le 25 juillet de 18h à 20h. Merci de confirmer votre présence.',
      type: 'reminder',
      category: 'event',
      timestamp: '2024-07-21T14:00:00Z',
      read: true,
      starred: false,
      source: 'admin',
      sourceName: 'Secrétariat',
      actionRequired: true,
      expiresAt: '2024-07-25T18:00:00Z',
      relatedLink: '/events'
    },
    {
      id: '6',
      title: 'Comportement à améliorer',
      content: 'Lucas a été perturbateur en cours d\'histoire. Entretien conseillé avec l\'enseignant.',
      type: 'warning',
      category: 'behavior',
      timestamp: '2024-07-21T09:30:00Z',
      read: false,
      starred: false,
      childName: 'Lucas',
      source: 'teacher',
      sourceName: 'M. Roux',
      actionRequired: true,
      relatedLink: '/messages'
    },
    {
      id: '7',
      title: 'Projet rendu à temps',
      content: 'Lucas a remis son projet de français dans les délais. Évaluation en cours.',
      type: 'success',
      category: 'homework',
      timestamp: '2024-07-20T16:45:00Z',
      read: true,
      starred: false,
      childName: 'Lucas',
      source: 'teacher',
      sourceName: 'Mme. Leroy',
      actionRequired: false,
      relatedLink: '/homework'
    },
    {
      id: '8',
      title: 'Retard ce matin',
      content: 'Emma est arrivée en retard de 10 minutes en cours de sciences.',
      type: 'info',
      category: 'attendance',
      timestamp: '2024-07-20T08:15:00Z',
      read: true,
      starred: false,
      childName: 'Emma',
      source: 'teacher',
      sourceName: 'Mme. Laurent',
      actionRequired: false,
      relatedLink: '/attendance'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reminder': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
      case 'reminder': return <Clock className="h-4 w-4 text-purple-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-green-100 text-green-800';
      case 'behavior': return 'bg-yellow-100 text-yellow-800';
      case 'administrative': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'grade': return 'bg-pink-100 text-pink-800';
      case 'attendance': return 'bg-orange-100 text-orange-800';
      case 'homework': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'academic': return 'Académique';
      case 'behavior': return 'Comportement';
      case 'administrative': return 'Administratif';
      case 'event': return 'Événement';
      case 'grade': return 'Note';
      case 'attendance': return 'Présence';
      case 'homework': return 'Devoir';
      default: return 'Général';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'behavior': return <User className="h-4 w-4" />;
      case 'administrative': return <School className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'grade': return <Star className="h-4 w-4" />;
      case 'attendance': return <CheckCircle className="h-4 w-4" />;
      case 'homework': return <BookOpen className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffInHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24 && diffInHours > 0;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    return now > expiry;
  };

  const filterNotifications = (notifications: Notification[], tab: string) => {
    let filtered = notifications;

    // Filter by child
    if (selectedChild !== 'all') {
      filtered = filtered.filter(n => n.childName === selectedChild);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Filter by tab
    switch (tab) {
      case 'unread':
        return filtered.filter(n => !n.read);
      case 'starred':
        return filtered.filter(n => n.starred);
      case 'urgent':
        return filtered.filter(n => n.type === 'urgent' || n.actionRequired);
      case 'expired':
        return filtered.filter(n => isExpired(n.expiresAt));
      default:
        return filtered;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const starredCount = notifications.filter(n => n.starred).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent' || n.actionRequired).length;
  const expiredCount = notifications.filter(n => isExpired(n.expiresAt)).length;

  const filteredNotifications = filterNotifications(notifications, activeTab);

  const toggleSetting = (category: keyof NotificationSettings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]]
      }
    }));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Notifications</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Restez informé de l&apos;actualité scolaire de vos enfants
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Tout Marquer Lu
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Non lues</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">{starredCount}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{urgentCount}</div>
              <div className="text-sm text-muted-foreground">Actions Requises</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Paramètres de Notification</CardTitle>
            <CardDescription className="text-blue-600">
              Personnalisez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div>
              <h4 className="font-medium mb-3">Catégories</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(settings.categories).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      checked={value}
                      onCheckedChange={() => toggleSetting('categories', key)}
                    />
                    <label className="text-sm">
                      {getCategoryLabel(key)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Channels */}
            <div>
              <h4 className="font-medium mb-3">Canaux de Notification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.channels.push}
                    onCheckedChange={() => toggleSetting('channels', 'push')}
                  />
                  <Smartphone className="h-4 w-4" />
                  <label className="text-sm">Notifications Push</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.channels.email}
                    onCheckedChange={() => toggleSetting('channels', 'email')}
                  />
                  <Mail className="h-4 w-4" />
                  <label className="text-sm">Email</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.channels.sms}
                    onCheckedChange={() => toggleSetting('channels', 'sms')}
                  />
                  <MessageSquare className="h-4 w-4" />
                  <label className="text-sm">SMS</label>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h4 className="font-medium mb-3">Programmation</h4>
              <div className="flex items-center space-x-4 mb-2">
                <Switch
                  checked={settings.schedule.enabled}
                  onCheckedChange={() => toggleSetting('schedule', 'enabled')}
                />
                <label className="text-sm">Limiter les heures de notification</label>
              </div>
              {settings.schedule.enabled && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pl-6">
                  <div>
                    <label className="text-xs text-muted-foreground">Début</label>
                    <input
                      type="time"
                      value={settings.schedule.startTime}
                      className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Fin</label>
                    <input
                      type="time"
                      value={settings.schedule.endTime}
                      className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.schedule.weekendsEnabled}
                      onCheckedChange={() => toggleSetting('schedule', 'weekendsEnabled')}
                    />
                    <label className="text-sm">Week-ends</label>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="academic">Académique</SelectItem>
                <SelectItem value="behavior">Comportement</SelectItem>
                <SelectItem value="administrative">Administratif</SelectItem>
                <SelectItem value="event">Événement</SelectItem>
                <SelectItem value="grade">Note</SelectItem>
                <SelectItem value="attendance">Présence</SelectItem>
                <SelectItem value="homework">Devoir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="all">
            Toutes ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non Lues ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="starred">
            Favorites ({starredCount})
          </TabsTrigger>
          <TabsTrigger value="urgent">
            Urgentes ({urgentCount})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expirées ({expiredCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Toutes les Notifications</CardTitle>
              <CardDescription>
                Historique complet de vos notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className={`border rounded-lg p-4 transition-all hover:shadow-md ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'} ${isExpired(notification.expiresAt) ? 'opacity-60' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-base font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                Nouveau
                              </Badge>
                            )}
                            {isExpiringSoon(notification.expiresAt) && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                Expire bientôt
                              </Badge>
                            )}
                            {isExpired(notification.expiresAt) && (
                              <Badge variant="outline" className="text-gray-500 text-xs">
                                Expiré
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Toggle starred */}}
                            >
                              {notification.starred ? 
                                <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                                <Star className="h-4 w-4 text-gray-400" />
                              }
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type === 'urgent' ? 'Urgent' :
                             notification.type === 'warning' ? 'Attention' :
                             notification.type === 'success' ? 'Succès' :
                             notification.type === 'info' ? 'Info' :
                             'Rappel'}
                          </Badge>
                          <Badge className={getCategoryColor(notification.category)}>
                            {getCategoryIcon(notification.category)}
                            <span className="ml-1">{getCategoryLabel(notification.category)}</span>
                          </Badge>
                          {notification.childName && (
                            <Badge variant="outline" className="text-xs">
                              {notification.childName}
                            </Badge>
                          )}
                          {notification.actionRequired && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              Action requise
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Source:</span> {notification.sourceName}
                            {notification.expiresAt && !isExpired(notification.expiresAt) && (
                              <span className="ml-3">
                                <Clock className="inline h-3 w-3 mr-1" />
                                Expire le {new Date(notification.expiresAt).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {notification.relatedLink && (
                              <Button variant="outline" size="sm">
                                Voir Détails
                              </Button>
                            )}
                            {!notification.read && (
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Marquer Lu
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune notification trouvée</p>
                  <p className="text-sm">Modifiez vos filtres pour voir plus de résultats</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notifications Non Lues</CardTitle>
              <CardDescription>
                Notifications nécessitant votre attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-blue-900">
                            {notification.title}
                          </h4>
                          <span className="text-sm text-blue-600">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getCategoryColor(notification.category)}>
                            {getCategoryIcon(notification.category)}
                            <span className="ml-1">{getCategoryLabel(notification.category)}</span>
                          </Badge>
                          {notification.childName && (
                            <Badge variant="outline" className="text-xs">
                              {notification.childName}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-blue-700 mb-3">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Eye className="mr-2 h-4 w-4" />
                            Marquer Lu
                          </Button>
                          {notification.relatedLink && (
                            <Button variant="outline" size="sm">
                              Voir Détails
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                  <p>Toutes les notifications sont lues</p>
                  <p className="text-sm">Vous êtes à jour !</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="starred" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notifications Favorites</CardTitle>
              <CardDescription>
                Notifications marquées comme importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-yellow-900">
                            {notification.title}
                          </h4>
                          <span className="text-sm text-yellow-600">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-yellow-700 mb-3">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Retirer Favori
                          </Button>
                          {notification.relatedLink && (
                            <Button variant="outline" size="sm">
                              Voir Détails
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune notification en favori</p>
                  <p className="text-sm">Marquez des notifications importantes avec l&apos;étoile</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg text-red-800 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Notifications Urgentes
              </CardTitle>
              <CardDescription className="text-red-600">
                Notifications nécessitant une action immédiate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="border border-red-300 rounded-lg p-4 bg-white">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-red-900">
                            {notification.title}
                          </h4>
                          <Badge className="bg-red-100 text-red-800 border-red-300">
                            Action requise
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-red-700 mb-3">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            Traiter Maintenant
                          </Button>
                          {notification.relatedLink && (
                            <Button variant="outline" size="sm">
                              Voir Détails
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                  <p>Aucune notification urgente</p>
                  <p className="text-sm">Tout est sous contrôle !</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notifications Expirées</CardTitle>
              <CardDescription>
                Notifications dont le délai d&apos;action est dépassé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 bg-gray-50 opacity-75">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <Clock className="h-5 w-5 text-gray-500" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-700">
                            {notification.title}
                          </h4>
                          <Badge variant="outline" className="text-gray-500">
                            Expiré
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Archive className="mr-2 h-4 w-4" />
                            Archiver
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                  <p>Aucune notification expirée</p>
                  <p className="text-sm">Excellent suivi des délais !</p>
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
            Gérez vos notifications efficacement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marquer Tout Lu
            </Button>
            <Button variant="outline" className="w-full">
              <Archive className="mr-2 h-4 w-4" />
              Archiver Anciennes
            </Button>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filtres Avancés
            </Button>
            <Button variant="outline" className="w-full">
              <BellOff className="mr-2 h-4 w-4" />
              Mode Silencieux
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
