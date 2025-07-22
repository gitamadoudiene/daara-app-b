'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Shield,
  Mail,
  Bell,
  Database,
  Globe,
  Lock,
  Clock,
  Palette,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export function GlobalSettings() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'DAARA Academic Monitoring System',
    systemDescription: 'Enhancing communication and academic monitoring between schools, teachers, students, and parents',
    maintenanceMode: false,
    allowNewRegistrations: true,
    
    // Security Settings
    passwordMinLength: 8,
    requireTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Email Settings
    emailNotifications: true,
    smtpServer: 'smtp.daara.com',
    smtpPort: '587',
    smtpUsername: 'noreply@daara.com',
    
    // Notification Settings
    pushNotifications: true,
    emailDigest: 'daily',
    systemAlerts: true,
    
    // Appearance Settings
    defaultTheme: 'light',
    allowThemeChange: true,
    brandColor: '#3b82f6',
    
    // Data Settings
    dataRetentionPeriod: 365,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const handleSave = () => {
    // In a real app, this would save to your backend
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    // Reset to default values
    toast.success('Settings reset to defaults!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Global Settings</h3>
        <p className="text-muted-foreground">Configure system-wide settings that affect all schools</p>
      </div>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>System Configuration</span>
          </CardTitle>
          <CardDescription>Basic system settings and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="system-name">System Name</Label>
              <Input
                id="system-name"
                value={settings.systemName}
                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-color">Brand Color</Label>
              <Input
                id="brand-color"
                type="color"
                value={settings.brandColor}
                onChange={(e) => setSettings({...settings, brandColor: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="system-description">System Description</Label>
            <Textarea
              id="system-description"
              value={settings.systemDescription}
              onChange={(e) => setSettings({...settings, systemDescription: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable to prevent users from accessing the system
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow New Registrations</Label>
              <p className="text-sm text-muted-foreground">
                Allow new schools to register on the platform
              </p>
            </div>
            <Switch
              checked={settings.allowNewRegistrations}
              onCheckedChange={(checked) => setSettings({...settings, allowNewRegistrations: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription>Configure security policies and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password-length">Minimum Password Length</Label>
              <Input
                id="password-length"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                min="6"
                max="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                min="5"
                max="120"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Maximum Login Attempts</Label>
            <Input
              id="max-attempts"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
              min="3"
              max="10"
              className="w-32"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all administrator accounts
              </p>
            </div>
            <Switch
              checked={settings.requireTwoFactor}
              onCheckedChange={(checked) => setSettings({...settings, requireTwoFactor: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Configuration</span>
          </CardTitle>
          <CardDescription>Configure email server and notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable system-wide email notifications
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP Server</Label>
              <Input
                id="smtp-server"
                value={settings.smtpServer}
                onChange={(e) => setSettings({...settings, smtpServer: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                value={settings.smtpPort}
                onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smtp-username">SMTP Username</Label>
            <Input
              id="smtp-username"
              value={settings.smtpUsername}
              onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
          <CardDescription>Configure system notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable real-time push notifications
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Send alerts for system events and errors
              </p>
            </div>
            <Switch
              checked={settings.systemAlerts}
              onCheckedChange={(checked) => setSettings({...settings, systemAlerts: checked})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email-digest">Email Digest Frequency</Label>
            <Select value={settings.emailDigest} onValueChange={(value) => setSettings({...settings, emailDigest: value})}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Disabled</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>Configure data retention and backup policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention-period">Data Retention Period (days)</Label>
            <Input
              id="retention-period"
              type="number"
              value={settings.dataRetentionPeriod}
              onChange={(e) => setSettings({...settings, dataRetentionPeriod: parseInt(e.target.value)})}
              min="30"
              max="3650"
              className="w-32"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic system backups
              </p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="backup-frequency">Backup Frequency</Label>
            <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({...settings, backupFrequency: value})}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance Settings</span>
          </CardTitle>
          <CardDescription>Configure system appearance and theming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-theme">Default Theme</Label>
            <Select value={settings.defaultTheme} onValueChange={(value) => setSettings({...settings, defaultTheme: value})}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Theme Changes</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to change their theme preference
              </p>
            </div>
            <Switch
              checked={settings.allowThemeChange}
              onCheckedChange={(checked) => setSettings({...settings, allowThemeChange: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}