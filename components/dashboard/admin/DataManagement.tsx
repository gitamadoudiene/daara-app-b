'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  FileText,
  Archive,
  AlertCircle,
  CheckCircle,
  Clock,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Backup {
  id: string;
  name: string;
  type: 'automatic' | 'manual';
  size: string;
  created: string;
  status: 'completed' | 'in_progress' | 'failed';
  description: string;
}

interface DataTable {
  name: string;
  records: number;
  size: string;
  lastUpdated: string;
  category: 'users' | 'academic' | 'system' | 'reports';
}

export function DataManagement() {
  const [activeTab, setActiveTab] = useState('backup');
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);

  // Mock backup data
  const [backups] = useState<Backup[]>([
    {
      id: '1',
      name: 'Sauvegarde Automatique Juillet 2024',
      type: 'automatic',
      size: '2.4 GB',
      created: '2024-07-22 02:00:00',
      status: 'completed',
      description: 'Sauvegarde automatique quotidienne'
    },
    {
      id: '2',
      name: 'Sauvegarde Manuelle - Fin Trimestre',
      type: 'manual',
      size: '2.1 GB',
      created: '2024-07-20 16:30:00',
      status: 'completed',
      description: 'Sauvegarde avant archivage trimestre'
    }
  ]);

  // Mock data tables
  const dataTables: DataTable[] = [
    {
      name: 'Utilisateurs',
      records: 1580,
      size: '45.2 MB',
      lastUpdated: '2024-07-22 09:30:00',
      category: 'users'
    },
    {
      name: 'Étudiants',
      records: 1234,
      size: '123.5 MB',
      lastUpdated: '2024-07-22 09:15:00',
      category: 'users'
    }
  ];

  const handleManualBackup = () => {
    setIsBackupInProgress(true);
    toast.info('Sauvegarde manuelle démarrée...');
    
    setTimeout(() => {
      setIsBackupInProgress(false);
      toast.success('Sauvegarde manuelle terminée avec succès !');
    }, 3000);
  };

  const handleRestoreBackup = (backupId: string) => {
    toast.info('Restauration de la sauvegarde en cours...');
    setTimeout(() => {
      toast.success('Sauvegarde restaurée avec succès !');
    }, 2000);
  };

  const handleDeleteBackup = (backupId: string) => {
    toast.success('Sauvegarde supprimée avec succès !');
  };

  const handleImportData = () => {
    toast.info('Import des données en cours...');
    setTimeout(() => {
      toast.success('Données importées avec succès !');
    }, 2000);
  };

  const handleExportData = (tableName: string) => {
    toast.info(`Export de la table ${tableName} en cours...`);
    setTimeout(() => {
      toast.success(`Table ${tableName} exportée avec succès !`);
    }, 1500);
  };

  const getBackupStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'users': return Database;
      case 'academic': return FileText;
      case 'system': return HardDrive;
      case 'reports': return Archive;
      default: return Database;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'users': return 'bg-blue-100 text-blue-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      case 'reports': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRecords = dataTables.reduce((sum, table) => sum + table.records, 0);
  const totalSize = dataTables.reduce((sum, table) => sum + parseFloat(table.size), 0);
  const completedBackups = backups.filter(b => b.status === 'completed').length;
  const storageUsed = 75;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Données</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sauvegardez, restaurez et gérez les données de votre établissement
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Enregistrements</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Données stockées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Taille Totale</CardTitle>
            <HardDrive className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">
              Espace utilisé
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Sauvegardes</CardTitle>
            <Archive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{completedBackups}</div>
            <p className="text-xs text-muted-foreground">
              Sauvegardes réussies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Stockage</CardTitle>
            <FolderOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{storageUsed}%</div>
            <p className="text-xs text-muted-foreground">
              Espace utilisé
            </p>
            <Progress value={storageUsed} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Gestion des Données</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
              <TabsTrigger value="backup" className="text-xs sm:text-sm">Sauvegardes</TabsTrigger>
              <TabsTrigger value="tables" className="text-xs sm:text-sm">Tables</TabsTrigger>
              <TabsTrigger value="import-export" className="text-xs sm:text-sm">Import/Export</TabsTrigger>
            </TabsList>

            <TabsContent value="backup" className="space-y-6">
              {/* Backup Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Archive className="mr-2 h-5 w-5" />
                    Actions de Sauvegarde
                  </CardTitle>
                  <CardDescription>
                    Créez et gérez vos sauvegardes manuelles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Button
                      onClick={handleManualBackup}
                      disabled={isBackupInProgress}
                      className="flex-1"
                    >
                      {isBackupInProgress ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {isBackupInProgress ? 'Sauvegarde en cours...' : 'Créer Sauvegarde'}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <HardDrive className="mr-2 h-4 w-4" />
                      Planifier Sauvegarde
                    </Button>
                  </div>
                  {isBackupInProgress && (
                    <div className="mt-4">
                      <Progress value={45} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Sauvegarde en cours... 45%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Backup History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Historique des Sauvegardes</CardTitle>
                  <CardDescription>
                    Liste de toutes les sauvegardes créées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backups.map((backup) => {
                      const StatusIcon = getBackupStatusIcon(backup.status);
                      return (
                        <div key={backup.id} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Archive className="h-5 w-5 text-blue-600" />
                                <h4 className="text-base font-semibold">{backup.name}</h4>
                                <Badge className={getBackupStatusColor(backup.status)}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {backup.status === 'completed' ? 'Terminée' :
                                   backup.status === 'in_progress' ? 'En cours' : 'Échec'}
                                </Badge>
                                <Badge variant="outline">
                                  {backup.type === 'automatic' ? 'Auto' : 'Manuel'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{backup.description}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <span>📅 {new Date(backup.created).toLocaleString('fr-FR')}</span>
                                <span>💾 Taille: {backup.size}</span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreBackup(backup.id)}
                                disabled={backup.status !== 'completed'}
                                className="w-full sm:w-auto"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Restaurer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={backup.status !== 'completed'}
                                className="w-full sm:w-auto"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Télécharger</span>
                                <span className="sm:hidden">DL</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteBackup(backup.id)}
                                className="w-full sm:w-auto"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Supprimer</span>
                                <span className="sm:hidden">Del</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Tables de Données
                  </CardTitle>
                  <CardDescription>
                    Vue d&apos;ensemble des tables de données du système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataTables.map((table, index) => {
                      const CategoryIcon = getCategoryIcon(table.category);
                      return (
                        <div key={index} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <CategoryIcon className="h-5 w-5 text-blue-600" />
                                <h4 className="text-base font-semibold">{table.name}</h4>
                                <Badge className={getCategoryColor(table.category)}>
                                  {table.category === 'users' ? 'Utilisateurs' :
                                   table.category === 'academic' ? 'Académique' :
                                   table.category === 'system' ? 'Système' : 'Rapports'}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                <span>📊 {table.records.toLocaleString()} enregistrements</span>
                                <span>💾 Taille: {table.size}</span>
                                <span>🕒 MAJ: {new Date(table.lastUpdated).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportData(table.name)}
                                className="w-full sm:w-auto"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Exporter
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import-export" className="space-y-6">
              {/* Import Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Importation de Données
                  </CardTitle>
                  <CardDescription>
                    Importez des données depuis des fichiers externes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="import-file">Sélectionner un fichier</Label>
                      <Input id="import-file" type="file" accept=".csv,.xlsx,.json" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="import-type">Type de données</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="">Sélectionner le type</option>
                        <option value="students">Étudiants</option>
                        <option value="teachers">Enseignants</option>
                        <option value="classes">Classes</option>
                        <option value="grades">Notes</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleImportData} className="w-full sm:w-auto">
                    <Upload className="mr-2 h-4 w-4" />
                    Importer les Données
                  </Button>
                </CardContent>
              </Card>

              {/* Export Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Download className="mr-2 h-5 w-5" />
                    Exportation de Données
                  </CardTitle>
                  <CardDescription>
                    Exportez des données vers différents formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tables à exporter</Label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Tous les utilisateurs</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Toutes les classes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Toutes les notes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Rapports de présence</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Format d&apos;export</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="csv">CSV</option>
                        <option value="xlsx">Excel</option>
                        <option value="json">JSON</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter les Données Sélectionnées
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
