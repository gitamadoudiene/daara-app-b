'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Globe,
  Bell,
  Mail,
  Server,
  Database,
  Shield,
  Clock,
  Monitor,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Info,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemInfo {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'error';
  icon: any;
}

interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push';
  event: string;
  enabled: boolean;
  description: string;
}

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Mock system information
  const systemInfo: SystemInfo[] = [
    {
      name: 'Version du Système',
      value: 'DAARA v2.1.3',
      status: 'good',
      icon: Monitor
    },
    {
      name: 'Base de Données',
      value: 'PostgreSQL 14.2',
      status: 'good',
      icon: Database
    },
    {
      name: 'Serveur Web',
      value: 'Nginx 1.20.2',
      status: 'good',
      icon: Server
    },
    {
      name: 'Espace Disque',
      value: '75% utilisé (300GB/400GB)',
      status: 'warning',
      icon: Cloud
    },
    {
      name: 'Mémoire RAM',
      value: '8.2GB / 16GB (51%)',
      status: 'good',
      icon: Monitor
    },
    {
      name: 'Dernière Sauvegarde',
      value: '22/07/2024 à 02:00',
      status: 'good',
      icon: Clock
    }
  ];

  // Mock notification settings
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'email',
      event: 'Nouvel étudiant inscrit',
      enabled: true,
      description: 'Recevoir un email lors d\'une nouvelle inscription'
    },
    {
      id: '2',
      type: 'email',
      event: 'Rapport mensuel',
      enabled: true,
      description: 'Rapport automatique envoyé chaque mois'
    },
    {
      id: '3',
      type: 'sms',
      event: 'Alerte sécurité',
      enabled: true,
      description: 'SMS en cas de problème de sécurité'
    },
    {
      id: '4',
      type: 'push',
      event: 'Maintenance système',
      enabled: false,
      description: 'Notification lors de maintenance'
    },
    {
      id: '5',
      type: 'email',
      event: 'Sauvegarde échouée',
      enabled: true,
      description: 'Email si une sauvegarde échoue'
    },
    {
      id: '6',
      type: 'sms',
      event: 'Quota espace disque',
      enabled: true,
      description: 'SMS si l\'espace disque est faible'
    }
  ]);

  const handleSaveGeneralSettings = () => {
    toast.success('Paramètres généraux sauvegardés avec succès !');
  };

  const handleSaveNotificationSettings = () => {
    toast.success('Paramètres de notification sauvegardés avec succès !');
  };

  const handleMaintenanceToggle = (enabled: boolean) => {
    setIsMaintenanceMode(enabled);
    if (enabled) {
      toast.warning('Mode maintenance activé - Les utilisateurs ne peuvent plus accéder au système');
    } else {
      toast.success('Mode maintenance désactivé - Le système est de nouveau accessible');
    }
  };

  const handleSystemRestart = () => {
    toast.info('Redémarrage du système en cours...');
    setTimeout(() => {
      toast.success('Système redémarré avec succès !');
    }, 3000);
  };

  const handleClearCache = () => {
    toast.info('Vidage du cache en cours...');
    setTimeout(() => {
      toast.success('Cache vidé avec succès !');
    }, 1500);
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return Smartphone;
      case 'push': return Bell;
      default: return Bell;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'push': return 'Push';
      default: return 'Notification';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Paramètres Système</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configurez les paramètres globaux et système de votre plateforme
          </p>
        </div>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            État du Système
          </CardTitle>
          <CardDescription>
            Informations sur l&apos;état actuel du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemInfo.map((info, index) => {
              const StatusIcon = getStatusIcon(info.status);
              const InfoIcon = info.icon;
              return (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <InfoIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-sm">{info.name}</span>
                    </div>
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(info.status)}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{info.value}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Configuration Système</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="general" className="text-xs sm:text-sm">Général</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
              <TabsTrigger value="maintenance" className="text-xs sm:text-sm">Maintenance</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs sm:text-sm">Avancé</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Paramètres Généraux
                  </CardTitle>
                  <CardDescription>
                    Configuration de base du système
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="school-name">Nom de l&apos;Établissement</Label>
                      <Input id="school-name" defaultValue="École DAARA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school-code">Code Établissement</Label>
                      <Input id="school-code" defaultValue="DAARA001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email Administrateur</Label>
                      <Input id="admin-email" type="email" defaultValue="admin@daara.edu" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuseau Horaire</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="Africa/Dakar">Africa/Dakar (GMT+0)</option>
                        <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                        <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue par Défaut</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="fr">Français</option>
                        <option value="en">Anglais</option>
                        <option value="ar">Arabe</option>
                        <option value="wo">Wolof</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academic-year">Année Académique</Label>
                      <Input id="academic-year" defaultValue="2024-2025" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Options Système</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Sauvegarde Automatique</Label>
                          <p className="text-sm text-muted-foreground">
                            Sauvegarder automatiquement les données chaque jour
                          </p>
                        </div>
                        <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notifications Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Recevoir des notifications par email
                          </p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveGeneralSettings} className="w-full sm:w-auto">
                    <Settings className="mr-2 h-4 w-4" />
                    Sauvegarder les Paramètres
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Paramètres de Notification
                  </CardTitle>
                  <CardDescription>
                    Gérez les types de notifications que vous souhaitez recevoir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => {
                      const NotificationIcon = getNotificationIcon(notification.type);
                      return (
                        <div key={notification.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <NotificationIcon className="h-5 w-5 text-blue-600" />
                                <h4 className="text-base font-semibold">{notification.event}</h4>
                                <Badge variant="outline">
                                  {getNotificationTypeLabel(notification.type)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                            <Switch
                              checked={notification.enabled}
                              onCheckedChange={() => toggleNotification(notification.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button onClick={handleSaveNotificationSettings} className="w-full sm:w-auto mt-6">
                    <Bell className="mr-2 h-4 w-4" />
                    Sauvegarder les Notifications
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Mode Maintenance
                  </CardTitle>
                  <CardDescription>
                    Activez le mode maintenance pour effectuer des opérations de maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Mode Maintenance</Label>
                      <p className="text-sm text-muted-foreground">
                        Désactiver l&apos;accès utilisateur pendant la maintenance
                      </p>
                    </div>
                    <Switch
                      checked={isMaintenanceMode}
                      onCheckedChange={handleMaintenanceToggle}
                    />
                  </div>

                  {isMaintenanceMode && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-orange-800">Mode Maintenance Actif</span>
                      </div>
                      <p className="text-sm text-orange-600 mt-1">
                        Les utilisateurs ne peuvent pas accéder au système en ce moment.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Message de Maintenance</Label>
                    <Input
                      id="maintenance-message"
                      placeholder="Le système est temporairement indisponible pour maintenance..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Actions de Maintenance</CardTitle>
                  <CardDescription>
                    Opérations de maintenance système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" onClick={handleClearCache} className="h-auto p-4">
                      <div className="text-center">
                        <Database className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-medium">Vider le Cache</div>
                        <div className="text-xs text-muted-foreground">Supprimer les fichiers temporaires</div>
                      </div>
                    </Button>
                    <Button variant="outline" onClick={handleSystemRestart} className="h-auto p-4">
                      <div className="text-center">
                        <Server className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-medium">Redémarrer</div>
                        <div className="text-xs text-muted-foreground">Redémarrer le serveur</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-medium">Logs Système</div>
                        <div className="text-xs text-muted-foreground">Voir les journaux</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Paramètres Avancés
                  </CardTitle>
                  <CardDescription>
                    Configuration technique et paramètres avancés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Délai d&apos;Expiration Session (minutes)</Label>
                      <Input id="session-timeout" type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-login-attempts">Tentatives de Connexion Max</Label>
                      <Input id="max-login-attempts" type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-retention">Rétention Sauvegardes (jours)</Label>
                      <Input id="backup-retention" type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="log-level">Niveau de Journalisation</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="error">Erreurs uniquement</option>
                        <option value="warning">Avertissements et erreurs</option>
                        <option value="info">Informations complètes</option>
                        <option value="debug">Mode débogage</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Limites Système</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="max-file-size">Taille Max Fichier (MB)</Label>
                        <Input id="max-file-size" type="number" defaultValue="10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-users">Nombre Max d&apos;Utilisateurs</Label>
                        <Input id="max-users" type="number" defaultValue="2000" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">Zone Danger</span>
                    </div>
                    <p className="text-sm text-red-600 mb-4">
                      Ces actions sont irréversibles et peuvent affecter le fonctionnement du système.
                    </p>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button variant="destructive" size="sm">
                        Réinitialiser Base de Données
                      </Button>
                      <Button variant="destructive" size="sm">
                        Supprimer Tous les Logs
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full sm:w-auto">
                    <Settings className="mr-2 h-4 w-4" />
                    Sauvegarder Paramètres Avancés
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
