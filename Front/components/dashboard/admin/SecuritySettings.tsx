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
  Shield,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Lock,
  Unlock,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface SecurityLog {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'permission_change';
  user: string;
  action: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'warning' | 'error';
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'user' | 'class' | 'report' | 'system';
  enabled: boolean;
}

export function SecuritySettings() {
  const [activeTab, setActiveTab] = useState('security');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock security logs
  const [securityLogs] = useState<SecurityLog[]>([
    {
      id: '1',
      type: 'login',
      user: 'admin@daara.sn',
      action: 'Connexion réussie',
      timestamp: '2024-07-22 09:15:32',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      type: 'failed_login',
      user: 'user@daara.sn',
      action: 'Tentative de connexion échouée',
      timestamp: '2024-07-22 08:45:12',
      ip: '192.168.1.150',
      status: 'warning'
    },
    {
      id: '3',
      type: 'password_change',
      user: 'teacher@daara.sn',
      action: 'Mot de passe modifié',
      timestamp: '2024-07-21 16:30:45',
      ip: '192.168.1.120',
      status: 'success'
    },
    {
      id: '4',
      type: 'permission_change',
      user: 'admin@daara.sn',
      action: 'Permissions utilisateur modifiées',
      timestamp: '2024-07-21 14:20:18',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: '5',
      type: 'failed_login',
      user: 'unknown',
      action: 'Tentatives multiples de connexion',
      timestamp: '2024-07-20 22:15:30',
      ip: '203.45.67.89',
      status: 'error'
    }
  ]);

  // Mock permissions
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: '1',
      name: 'Gestion des Utilisateurs',
      description: 'Créer, modifier et supprimer des utilisateurs',
      category: 'user',
      enabled: true
    },
    {
      id: '2',
      name: 'Gestion des Classes',
      description: 'Créer et modifier les classes et matières',
      category: 'class',
      enabled: true
    },
    {
      id: '3',
      name: 'Accès aux Rapports',
      description: 'Consulter et générer des rapports',
      category: 'report',
      enabled: true
    },
    {
      id: '4',
      name: 'Paramètres Système',
      description: 'Modifier les paramètres globaux du système',
      category: 'system',
      enabled: false
    },
    {
      id: '5',
      name: 'Gestion des Notes',
      description: 'Saisir et modifier les notes des étudiants',
      category: 'class',
      enabled: true
    },
    {
      id: '6',
      name: 'Export de Données',
      description: 'Exporter les données du système',
      category: 'report',
      enabled: false
    }
  ]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Mot de passe modifié avec succès !');
  };

  const handlePermissionToggle = (permissionId: string) => {
    setPermissions(prev => 
      prev.map(perm => 
        perm.id === permissionId 
          ? { ...perm, enabled: !perm.enabled }
          : perm
      )
    );
    toast.success('Permissions mises à jour !');
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'login': return CheckCircle;
      case 'logout': return Activity;
      case 'failed_login': return AlertTriangle;
      case 'password_change': return Key;
      case 'permission_change': return Settings;
      default: return Activity;
    }
  };

  const getLogColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user': return Users;
      case 'class': return Shield;
      case 'report': return Activity;
      case 'system': return Settings;
      default: return Shield;
    }
  };

  const recentLogins = securityLogs.filter(log => log.type === 'login').length;
  const failedAttempts = securityLogs.filter(log => log.type === 'failed_login').length;
  const activePermissions = permissions.filter(perm => perm.enabled).length;
  const totalPermissions = permissions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Paramètres de Sécurité</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez la sécurité et les permissions de votre établissement
          </p>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Connexions Récentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{recentLogins}</div>
            <p className="text-xs text-muted-foreground">
              Dernières 24h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Tentatives Échouées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{failedAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Dernières 24h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Permissions Actives</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{activePermissions}/{totalPermissions}</div>
            <p className="text-xs text-muted-foreground">
              Permissions configurées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Dernière Activité</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold">9:15</div>
            <p className="text-xs text-muted-foreground">
              Aujourd&apos;hui
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Configuration de Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
              <TabsTrigger value="security" className="text-xs sm:text-sm">Sécurité</TabsTrigger>
              <TabsTrigger value="permissions" className="text-xs sm:text-sm">Permissions</TabsTrigger>
              <TabsTrigger value="logs" className="text-xs sm:text-sm">Journaux</TabsTrigger>
            </TabsList>

            <TabsContent value="security" className="space-y-6">
              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Key className="mr-2 h-5 w-5" />
                    Changer le Mot de Passe
                  </CardTitle>
                  <CardDescription>
                    Modifiez votre mot de passe pour sécuriser votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nouveau mot de passe</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full sm:w-auto">
                      Modifier le Mot de Passe
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Security Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Options de Sécurité
                  </CardTitle>
                  <CardDescription>
                    Configurez les paramètres de sécurité avancés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <Label>Authentification à deux facteurs</Label>
                      <p className="text-sm text-muted-foreground">
                        Renforcez la sécurité avec une double authentification
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <Label>Verrouillage automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Verrouiller la session après 30 minutes d&apos;inactivité
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <Label>Notifications de sécurité</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des alertes pour les activités suspectes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <Label>Limitation des tentatives</Label>
                      <p className="text-sm text-muted-foreground">
                        Bloquer après 5 tentatives de connexion échouées
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Gestion des Permissions
                  </CardTitle>
                  <CardDescription>
                    Configurez les autorisations pour votre rôle d&apos;administrateur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {permissions.map((permission) => {
                      const CategoryIcon = getCategoryIcon(permission.category);
                      return (
                        <div key={permission.id} className="border rounded-lg p-4">
                          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <CategoryIcon className="h-5 w-5 text-blue-600" />
                                <h4 className="text-base font-semibold">{permission.name}</h4>
                                {permission.enabled ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Unlock className="mr-1 h-3 w-3" />
                                    Activé
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-100 text-red-800">
                                    <Lock className="mr-1 h-3 w-3" />
                                    Désactivé
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{permission.description}</p>
                            </div>
                            <Switch
                              checked={permission.enabled}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Journal de Sécurité
                  </CardTitle>
                  <CardDescription>
                    Historique des activités de sécurité récentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityLogs.map((log) => {
                      const LogIcon = getLogIcon(log.type);
                      return (
                        <div key={log.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              log.status === 'success' ? 'bg-green-100' :
                              log.status === 'warning' ? 'bg-yellow-100' :
                              'bg-red-100'
                            }`}>
                              <LogIcon className={`h-4 w-4 ${getLogColor(log.status)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <div>
                                  <h4 className="text-sm font-semibold">{log.action}</h4>
                                  <p className="text-sm text-muted-foreground">Utilisateur: {log.user}</p>
                                </div>
                                <Badge className={getStatusBadgeColor(log.status)}>
                                  {log.status === 'success' ? 'Succès' :
                                   log.status === 'warning' ? 'Attention' : 'Erreur'}
                                </Badge>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                <div className="flex flex-col sm:flex-row sm:space-x-4">
                                  <span>📅 {log.timestamp}</span>
                                  <span>🌐 IP: {log.ip}</span>
                                </div>
                              </div>
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
