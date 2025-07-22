'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Shield, 
  Plus,
  School,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  Settings,
  Edit,
  Trash2,
  UserCheck,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminCount: number;
  studentCount: number;
  teacherCount: number;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  createdAt: string;
  director: string;
  establishedYear: number;
  type: 'Public' | 'Privé' | 'Semi-public';
}

export function SchoolManagement() {
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isManageDetailsOpen, setIsManageDetailsOpen] = useState(false);

  // Mock data for schools
  const schools: School[] = [
    {
      id: 'school1',
      name: 'Lycée Daara Excellence',
      address: '123 Avenue de l\'Éducation, Dakar',
      phone: '+221-33-123-4567',
      email: 'info@daaraexcellence.sn',
      adminCount: 2,
      studentCount: 1234,
      teacherCount: 89,
      status: 'Actif',
      createdAt: '2024-01-01',
      director: 'Dr. Aminata Diop',
      establishedYear: 1985,
      type: 'Public'
    },
    {
      id: 'school2',
      name: 'École Privée Al-Azhar',
      address: '456 Boulevard de la Connaissance, Thiès',
      phone: '+221-33-456-7890',
      email: 'contact@alazhar.sn',
      adminCount: 1,
      studentCount: 856,
      teacherCount: 67,
      status: 'Actif',
      createdAt: '2024-01-15',
      director: 'Prof. Mamadou Sall',
      establishedYear: 1992,
      type: 'Privé'
    },
    {
      id: 'school3',
      name: 'Institut Futur Leaders',
      address: '789 Rue de l\'Innovation, Saint-Louis',
      phone: '+221-33-789-0123',
      email: 'admin@futureleaders.sn',
      adminCount: 3,
      studentCount: 2156,
      teacherCount: 145,
      status: 'Actif',
      createdAt: '2024-02-01',
      director: 'Mme. Fatou Ndiaye',
      establishedYear: 2010,
      type: 'Semi-public'
    }
  ];

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('École créée avec succès !');
    setIsCreateSchoolOpen(false);
  };

  const handleViewDetails = (school: School) => {
    setSelectedSchool(school);
    setIsViewDetailsOpen(true);
  };

  const handleManageDetails = (school: School) => {
    setSelectedSchool(school);
    setIsManageDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'text-green-600 border-green-600';
      case 'Inactif': return 'text-red-600 border-red-600';
      case 'Suspendu': return 'text-orange-600 border-orange-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Public': return 'bg-blue-100 text-blue-800';
      case 'Privé': return 'bg-purple-100 text-purple-800';
      case 'Semi-public': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Écoles</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous les établissements scolaires du système DAARA
          </p>
        </div>
        <Dialog open={isCreateSchoolOpen} onOpenChange={setIsCreateSchoolOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Créer une École</span>
              <span className="sm:hidden">Créer</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Créer une Nouvelle École</DialogTitle>
              <DialogDescription className="text-sm">
                Ajouter un nouvel établissement au système DAARA.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">Nom de l'École</Label>
                  <Input id="school-name" placeholder="Entrez le nom de l'école" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-director">Directeur</Label>
                  <Input id="school-director" placeholder="Nom du directeur" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-address">Adresse</Label>
                <Input id="school-address" placeholder="Adresse complète de l'école" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-phone">Téléphone</Label>
                  <Input id="school-phone" placeholder="+221-33-XXX-XXXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-email">Email</Label>
                  <Input id="school-email" type="email" placeholder="email@ecole.sn" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-type">Type d'École</Label>
                  <select id="school-type" className="w-full p-2 border rounded-md" required>
                    <option value="">Sélectionnez le type</option>
                    <option value="Public">Public</option>
                    <option value="Privé">Privé</option>
                    <option value="Semi-public">Semi-public</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-year">Année de Création</Label>
                  <Input id="school-year" type="number" placeholder="2024" required />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateSchoolOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer l'École</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total des Écoles</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-muted-foreground">
              Établissements enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {schools.reduce((acc, school) => acc + school.studentCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Étudiants inscrits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Enseignants</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {schools.reduce((acc, school) => acc + school.teacherCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Enseignants actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Administrateurs</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {schools.reduce((acc, school) => acc + school.adminCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrateurs assignés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Écoles</CardTitle>
          <CardDescription>Gérez tous les établissements scolaires du système</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools.map((school) => (
              <div key={school.id} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <School className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        <h3 className="text-lg sm:text-xl font-semibold">{school.name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getStatusColor(school.status)}>
                          {school.status}
                        </Badge>
                        <Badge className={getTypeColor(school.type)}>
                          {school.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm text-muted-foreground">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">{school.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{school.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{school.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 flex-shrink-0" />
                          <span>Directeur: {school.director}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          <span>{school.adminCount} Administrateur(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 flex-shrink-0" />
                          <span>{school.teacherCount} Enseignant(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 flex-shrink-0" />
                          <span>{school.studentCount.toLocaleString()} Étudiant(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Créée en {school.establishedYear}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>Ajoutée le: {new Date(school.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(school)}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Voir Détails</span>
                      <span className="sm:hidden">Détails</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageDetails(school)}
                      className="w-full sm:w-auto"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Gérer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-4xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Détails de l'École: {selectedSchool?.name}</DialogTitle>
            <DialogDescription className="text-sm">
              Informations détaillées sur l'établissement scolaire
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="general" className="text-xs sm:text-sm">Général</TabsTrigger>
                <TabsTrigger value="stats" className="text-xs sm:text-sm">Statistiques</TabsTrigger>
                <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">Historique</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom de l'École</Label>
                    <p className="font-medium">{selectedSchool.name}</p>
                  </div>
                  <div>
                    <Label>Directeur</Label>
                    <p className="font-medium">{selectedSchool.director}</p>
                  </div>
                  <div>
                    <Label>Type d'École</Label>
                    <Badge className={getTypeColor(selectedSchool.type)}>{selectedSchool.type}</Badge>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Badge variant="outline" className={getStatusColor(selectedSchool.status)}>
                      {selectedSchool.status}
                    </Badge>
                  </div>
                  <div className="lg:col-span-2">
                    <Label>Adresse</Label>
                    <p className="font-medium break-words">{selectedSchool.address}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Étudiants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedSchool.studentCount.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Enseignants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedSchool.teacherCount}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Administrateurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedSchool.adminCount}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Téléphone</Label>
                    <p className="font-medium">{selectedSchool.phone}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedSchool.email}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Adresse Complète</Label>
                    <p className="font-medium">{selectedSchool.address}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <Label>Année de Création</Label>
                    <p className="font-medium">{selectedSchool.establishedYear}</p>
                  </div>
                  <div>
                    <Label>Ajoutée au Système</Label>
                    <p className="font-medium">{new Date(selectedSchool.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Details Dialog */}
      <Dialog open={isManageDetailsOpen} onOpenChange={setIsManageDetailsOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Gérer l'École: {selectedSchool?.name}</DialogTitle>
            <DialogDescription className="text-sm">
              Modifier les informations de l'établissement scolaire
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <form className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom de l'École</Label>
                  <Input id="edit-name" defaultValue={selectedSchool.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-director">Directeur</Label>
                  <Input id="edit-director" defaultValue={selectedSchool.director} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input id="edit-address" defaultValue={selectedSchool.address} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input id="edit-phone" defaultValue={selectedSchool.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" defaultValue={selectedSchool.email} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type d'École</Label>
                  <select id="edit-type" className="w-full p-2 border rounded-md" defaultValue={selectedSchool.type}>
                    <option value="Public">Public</option>
                    <option value="Privé">Privé</option>
                    <option value="Semi-public">Semi-public</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <select id="edit-status" className="w-full p-2 border rounded-md" defaultValue={selectedSchool.status}>
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsManageDetailsOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => {
                    toast.success('École supprimée avec succès');
                    setIsManageDetailsOpen(false);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
                <Button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success('École mise à jour avec succès');
                    setIsManageDetailsOpen(false);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
