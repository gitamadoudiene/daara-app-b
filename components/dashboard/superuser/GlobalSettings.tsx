'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Shield,
  Mail,
  Bell,
  Database,
  Server,
  Key,
  Globe,
  Clock,
  Users,
  Building2,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

export function GlobalSettings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showDbPassword, setShowDbPassword] = useState(false);
  
  // State for various settings
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'DAARA - Système de Gestion Éducative',
    systemDescription: 'Plateforme complète de gestion pour les établissements d&apos;enseignement au Sénégal',
    supportEmail: 'support@daara.sn',
    maintenanceMode: false,
    publicRegistration: true,
    
    // Security Settings
    sessionTimeout: '60',
    passwordMinLength: '8',
    requireTwoFactor: false,
    allowGuestAccess: false,
    apiRateLimit: '1000',
    
    // Email Settings
    smtpServer: 'smtp.daara.sn',
    smtpPort: '587',
    smtpUsername: 'noreply@daara.sn',
    smtpPassword: '••••••••••••',
    emailNotifications: true,
    
    // Notification Settings
    systemNotifications: true,
    emailReports: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    
    // Database Settings
    dbBackupFrequency: 'daily',
    dbRetentionDays: '30',
    autoOptimization: true,
    
    // Integration Settings
    apiKey: '••••••••••••••••••••••••••••••••',
    webhookUrl: 'https://api.daara.sn/webhooks',
    thirdPartySync: true
  });

  const handleSave = (section: string) => {
    toast.success(`Paramètres ${section} sauvegardés avec succès !`);
  };

  const handleReset = (section: string) => {
    toast.info(`Paramètres ${section} réinitialisés aux valeurs par défaut`);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Paramètres Globaux</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Configuration générale de la plateforme DAARA
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="general" className="text-xs sm:text-sm">Général</TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">Sécurité</TabsTrigger>
          <TabsTrigger value="email" className="text-xs sm:text-sm">Email</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="database" className="text-xs sm:text-sm">Base de Données</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">Intégrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Paramètres Généraux</span>
              </CardTitle>
              <CardDescription className="text-sm">Configuration de base du système</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="system-name">Nom du Système</Label>
                  <Input 
                    id="system-name"
                    value={settings.systemName}
                    onChange={(e) => updateSetting('systemName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Email de Support</Label>
                  <Input 
                    id="support-email"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system-description">Description du Système</Label>
                <Textarea 
                  id="system-description"
                  value={settings.systemDescription}
                  onChange={(e) => updateSetting('systemDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode Maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer le mode maintenance pour le système
                    </p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Inscription Publique</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre l&apos;inscription publique
                    </p>
                  </div>
                  <Switch 
                    checked={settings.publicRegistration}
                    onCheckedChange={(checked) => updateSetting('publicRegistration', checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset('généraux')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button onClick={() => handleSave('généraux')}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Paramètres de Sécurité</span>
              </CardTitle>
              <CardDescription>Configuration de la sécurité et de l&apos;authentification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Délai d&apos;Expiration de Session (minutes)</Label>
                  <Input 
                    id="session-timeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-length">Longueur Minimale du Mot de Passe</Label>
                  <Input 
                    id="password-length"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting('passwordMinLength', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-rate-limit">Limite de Taux API (requêtes/heure)</Label>
                <Input 
                  id="api-rate-limit"
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => updateSetting('apiRateLimit', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à Deux Facteurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Obliger la 2FA pour tous les utilisateurs
                    </p>
                  </div>
                  <Switch 
                    checked={settings.requireTwoFactor}
                    onCheckedChange={(checked) => updateSetting('requireTwoFactor', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Accès Invité</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre l&apos;accès aux utilisateurs invités
                    </p>
                  </div>
                  <Switch 
                    checked={settings.allowGuestAccess}
                    onCheckedChange={(checked) => updateSetting('allowGuestAccess', checked)}
                  />
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h4 className="font-medium text-orange-800">Attention</h4>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Les modifications des paramètres de sécurité affecteront tous les utilisateurs du système.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset('de sécurité')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button onClick={() => handleSave('de sécurité')}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Configuration Email</span>
              </CardTitle>
              <CardDescription>Paramètres du serveur SMTP et des emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-server">Serveur SMTP</Label>
                  <Input 
                    id="smtp-server"
                    value={settings.smtpServer}
                    onChange={(e) => updateSetting('smtpServer', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port SMTP</Label>
                  <Input 
                    id="smtp-port"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting('smtpPort', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">Nom d&apos;Utilisateur SMTP</Label>
                  <Input 
                    id="smtp-username"
                    value={settings.smtpUsername}
                    onChange={(e) => updateSetting('smtpUsername', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Mot de Passe SMTP</Label>
                  <div className="relative">
                    <Input 
                      id="smtp-password"
                      type={showDbPassword ? 'text' : 'password'}
                      value={settings.smtpPassword}
                      onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowDbPassword(!showDbPassword)}
                    >
                      {showDbPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer l&apos;envoi d&apos;emails de notification
                  </p>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Test de Configuration</h4>
                </div>
                <p className="text-sm text-blue-700 mt-1 mb-3">
                  Testez votre configuration SMTP avant de sauvegarder.
                </p>
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer Email de Test
                </Button>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset('email')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button onClick={() => handleSave('email')}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Paramètres de Notification</span>
              </CardTitle>
              <CardDescription>Configuration des notifications et alertes système</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications Système</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications d&apos;état du système
                    </p>
                  </div>
                  <Switch 
                    checked={settings.systemNotifications}
                    onCheckedChange={(checked) => updateSetting('systemNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rapports par Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoi automatique de rapports
                    </p>
                  </div>
                  <Switch 
                    checked={settings.emailReports}
                    onCheckedChange={(checked) => updateSetting('emailReports', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertes critiques par SMS
                    </p>
                  </div>
                  <Switch 
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rapports Hebdomadaires</Label>
                    <p className="text-sm text-muted-foreground">
                      Rapport d&apos;activité hebdomadaire
                    </p>
                  </div>
                  <Switch 
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapports Mensuels</Label>
                  <p className="text-sm text-muted-foreground">
                    Rapport complet mensuel avec analyses
                  </p>
                </div>
                <Switch 
                  checked={settings.monthlyReports}
                  onCheckedChange={(checked) => updateSetting('monthlyReports', checked)}
                />
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Types de Notifications</h4>
                </div>
                <div className="mt-3 space-y-2">
                  <Badge variant="outline" className="mr-2">Alertes Système</Badge>
                  <Badge variant="outline" className="mr-2">Rapports Automatiques</Badge>
                  <Badge variant="outline" className="mr-2">Notifications Utilisateur</Badge>
                  <Badge variant="outline" className="mr-2">Alertes Sécurité</Badge>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset('de notification')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button onClick={() => handleSave('de notification')}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Configuration Base de Données</span>
              </CardTitle>
              <CardDescription>Paramètres de sauvegarde et d&apos;optimisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Fréquence de Sauvegarde</Label>
                  <select 
                    id="backup-frequency" 
                    className="w-full p-2 border rounded-md"
                    value={settings.dbBackupFrequency}
                    onChange={(e) => updateSetting('dbBackupFrequency', e.target.value)}
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention-days">Durée de Rétention (jours)</Label>
                  <Input 
                    id="retention-days"
                    type="number"
                    value={settings.dbRetentionDays}
                    onChange={(e) => updateSetting('dbRetentionDays', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Optimisation Automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimiser automatiquement la base de données
                  </p>
                </div>
                <Switch 
                  checked={settings.autoOptimization}
                  onCheckedChange={(checked) => updateSetting('autoOptimization', checked)}
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">État de la Base de Données</h4>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Taille Totale</p>
                    <p className="font-medium">2.3 GB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dernière Sauvegarde</p>
                    <p className="font-medium">22 Jul 2024, 02:00</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Performance</p>
                    <Badge className="bg-green-100 text-green-800">Excellente</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Statut</p>
                    <Badge className="bg-green-100 text-green-800">Opérationnelle</Badge>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Database className="mr-2 h-4 w-4" />
                    Lancer Sauvegarde
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Optimiser Maintenant
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset('de base de données')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button onClick={() => handleSave('de base de données')}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Intégrations et API</span>
              </CardTitle>
              <CardDescription>Configuration des intégrations tierces et de l&apos;API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="api-key">Clé API Principale</Label>
                <div className="relative">
                  <Input 
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => updateSetting('apiKey', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL Webhook</Label>
                <Input 
                  id="webhook-url"
                  value={settings.webhookUrl}
                  onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Synchronisation Tierce</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer la synchronisation avec les services tiers
                  </p>
                </div>
                <Switch 
                  checked={settings.thirdPartySync}
                  onCheckedChange={(checked) => updateSetting('thirdPartySync', checked)}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Intégrations Disponibles</h4>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Google Workspace</p>
                      <p className="text-sm text-muted-foreground">Synchronisation des utilisateurs et calendriers</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Connecté</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Microsoft 365</p>
                      <p className="text-sm text-muted-foreground">Intégration avec Teams et Office</p>
                    </div>
                    <Badge variant="outline">Non configuré</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Système de Paiement</p>
                      <p className="text-sm text-muted-foreground">Orange Money / Wave / Visa</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Connecté</Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset('d&apos;intégration')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button onClick={() => handleSave('d&apos;intégration')}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
