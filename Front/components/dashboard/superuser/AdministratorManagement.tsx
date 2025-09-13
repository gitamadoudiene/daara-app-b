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
  Shield, 
  Users, 
  Plus,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface Administrator {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  schoolId: string;
  role: 'Principal' | 'Adjoint' | 'Superviseur';
  status: 'Actif' | 'Inactif' | 'Suspendu';
  createdAt: string;
  lastLogin: string;
  permissions: string[];
}

interface School {
  id: string;
  name: string;
}

export function AdministratorManagement() {
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Mock data for schools
  const schools: School[] = [
    { id: 'school1', name: 'Lycée Daara Excellence' },
    { id: 'school2', name: 'École Privée Al-Azhar' },
    { id: 'school3', name: 'Institut Futur Leaders' }
  ];

  // Mock data for administrators
  const administrators: Administrator[] = [
    {
      id: 'admin1',
      name: 'Dr. Aminata Diop',
      email: 'aminata.diop@daaraexcellence.sn',
      phone: '+221-77-123-4567',
      school: 'Lycée Daara Excellence',
      schoolId: 'school1',
      role: 'Principal',
      status: 'Actif',
      createdAt: '2024-01-01',
      lastLogin: '2024-07-20',
      permissions: ['Gestion complète', 'Rapports', 'Utilisateurs', 'Paramètres']
    },
    {
      id: 'admin2',
      name: 'Prof. Mamadou Sall',
      email: 'mamadou.sall@alazhar.sn',
      phone: '+221-77-456-7890',
      school: 'École Privée Al-Azhar',
      schoolId: 'school2',
      role: 'Principal',
      status: 'Actif',
      createdAt: '2024-01-15',
      lastLogin: '2024-07-22',
      permissions: ['Gestion complète', 'Rapports', 'Utilisateurs']
    },
    {
      id: 'admin3',
      name: 'Mme. Fatou Ndiaye',
      email: 'fatou.ndiaye@futureleaders.sn',
      phone: '+221-77-789-0123',
      school: 'Institut Futur Leaders',
      schoolId: 'school3',
      role: 'Principal',
      status: 'Actif',
      createdAt: '2024-02-01',
      lastLogin: '2024-07-21',
      permissions: ['Gestion complète', 'Rapports', 'Utilisateurs', 'Paramètres']
    },
    {
      id: 'admin4',
      name: 'M. Ousmane Ba',
      email: 'ousmane.ba@daaraexcellence.sn',
      phone: '+221-77-234-5678',
      school: 'Lycée Daara Excellence',
      schoolId: 'school1',
      role: 'Adjoint',
      status: 'Actif',
      createdAt: '2024-03-01',
      lastLogin: '2024-07-19',
      permissions: ['Rapports', 'Utilisateurs']
    },
    {
      id: 'admin5',
      name: 'Mme. Aïssatou Diagne',
      email: 'aissatou.diagne@futureleaders.sn',
      phone: '+221-77-345-6789',
      school: 'Institut Futur Leaders',
      schoolId: 'school3',
      role: 'Superviseur',
      status: 'Inactif',
      createdAt: '2024-04-01',
      lastLogin: '2024-06-15',
      permissions: ['Rapports']
    }
  ];

  const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('admin-name'),
      email: formData.get('admin-email'),
      password: formData.get('password') || 'password123',
      phone: formData.get('admin-phone'),
      role: formData.get('admin-role'),
      school: formData.get('admin-school'),
      permissions: [
        ...(['Gestion complète', 'Rapports', 'Utilisateurs', 'Paramètres'].filter((perm, idx) => {
          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
          return checkboxes[idx]?.checked;
        }))
      ]
    };
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Administrateur créé avec succès ! Mot de passe : ${payload.password}`);
        setIsCreateAdminOpen(false);
      } else {
        const error = await res.json();
        toast.error(`Erreur: ${error.message || 'Impossible de créer l\'administrateur.'}`);
      }
    } catch (err) {
      toast.error('Erreur réseau ou serveur.');
    }
  };

  const handleViewDetails = (admin: Administrator) => {
    setSelectedAdmin(admin);
    setIsViewDetailsOpen(true);
  };

  const handleEditAdmin = (admin: Administrator) => {
    setSelectedAdmin(admin);
    setIsEditAdminOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'text-green-600 border-green-600';
      case 'Inactif': return 'text-red-600 border-red-600';
      case 'Suspendu': return 'text-orange-600 border-orange-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Principal': return 'bg-blue-100 text-blue-800';
      case 'Adjoint': return 'bg-green-100 text-green-800';
      case 'Superviseur': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter administrators based on search and filters
  const filteredAdministrators = administrators.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.school.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = filterSchool === '' || admin.schoolId === filterSchool;
    const matchesStatus = filterStatus === '' || admin.status === filterStatus;
    
    return matchesSearch && matchesSchool && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Administrateurs</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les administrateurs de toutes les écoles du système DAARA
          </p>
        </div>
        <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Créer un Administrateur</span>
              <span className="sm:hidden">Créer Admin</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Créer un Nouvel Administrateur</DialogTitle>
              <DialogDescription className="text-sm">
                Ajouter un nouvel administrateur et l&apos;assigner à une école.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Nom Complet</Label>
                  <Input id="admin-name" placeholder="Entrez le nom complet" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input id="admin-email" type="email" placeholder="email@ecole.sn" required />
                </div>
              </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Mot de passe</Label>
                  <Input id="admin-password" name="password" type="text" placeholder="password123" defaultValue="password123" required />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-phone">Téléphone</Label>
                  <Input id="admin-phone" placeholder="+221-77-XXX-XXXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-role">Rôle</Label>
                  <select id="admin-role" className="w-full p-2 border rounded-md" required>
                    <option value="">Sélectionnez un rôle</option>
                    <option value="Principal">Principal</option>
                    <option value="Adjoint">Adjoint</option>
                    <option value="Superviseur">Superviseur</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-school">Assigner à une École</Label>
                <select id="admin-school" className="w-full p-2 border rounded-md" required>
                  <option value="">Sélectionnez une école</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Gestion complète', 'Rapports', 'Utilisateurs', 'Paramètres'].map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateAdminOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer l&apos;Administrateur</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Administrateurs</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{administrators.length}</div>
            <p className="text-xs text-muted-foreground">
              Administrateurs enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Actifs</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {administrators.filter(admin => admin.status === 'Actif').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrateurs actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Principaux</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {administrators.filter(admin => admin.role === 'Principal').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Directeurs d&apos;école
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Écoles Couvertes</CardTitle>
            <Building2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-muted-foreground">
              Écoles avec administrateurs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search"
                  placeholder="Nom, email, école..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-school" className="text-sm">École</Label>
              <select 
                id="filter-school" 
                className="w-full p-2 border rounded-md text-sm"
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
              >
                <option value="">Toutes les écoles</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-status">Statut</Label>
              <select 
                id="filter-status" 
                className="w-full p-2 border rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Suspendu">Suspendu</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setFilterSchool('');
                  setFilterStatus('');
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Administrators List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Administrateurs</CardTitle>
          <CardDescription>
            {filteredAdministrators.length} administrateur(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAdministrators.map((admin) => (
              <div key={admin.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-semibold">{admin.name}</h3>
                      <Badge className={getRoleColor(admin.role)}>
                        {admin.role}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(admin.status)}>
                        {admin.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{admin.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{admin.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>{admin.school}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Créé le: {new Date(admin.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Dernière connexion: {new Date(admin.lastLogin).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>{admin.permissions.length} permission(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(admin)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAdmin(admin)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;Administrateur: {selectedAdmin?.name}</DialogTitle>
            <DialogDescription>
              Informations détaillées sur l&apos;administrateur
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom Complet</Label>
                    <p className="font-medium">{selectedAdmin.name}</p>
                  </div>
                  <div>
                    <Label>Rôle</Label>
                    <Badge className={getRoleColor(selectedAdmin.role)}>{selectedAdmin.role}</Badge>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedAdmin.email}</p>
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <p className="font-medium">{selectedAdmin.phone}</p>
                  </div>
                  <div>
                    <Label>École Assignée</Label>
                    <p className="font-medium">{selectedAdmin.school}</p>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Badge variant="outline" className={getStatusColor(selectedAdmin.status)}>
                      {selectedAdmin.status}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="permissions" className="space-y-4">
                <div>
                  <Label>Permissions Accordées</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedAdmin.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date de Création</Label>
                    <p className="font-medium">{new Date(selectedAdmin.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <Label>Dernière Connexion</Label>
                    <p className="font-medium">{new Date(selectedAdmin.lastLogin).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div>
                  <Label>Activités Récentes</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Connexion au système - {new Date(selectedAdmin.lastLogin).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Mise à jour des informations d&apos;école</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Administrator Dialog */}
      <Dialog open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;Administrateur: {selectedAdmin?.name}</DialogTitle>
            <DialogDescription>
              Modifier les informations de l&apos;administrateur
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom Complet</Label>
                  <Input id="edit-name" defaultValue={selectedAdmin.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" defaultValue={selectedAdmin.email} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input id="edit-phone" defaultValue={selectedAdmin.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle</Label>
                  <select id="edit-role" className="w-full p-2 border rounded-md" defaultValue={selectedAdmin.role}>
                    <option value="Principal">Principal</option>
                    <option value="Adjoint">Adjoint</option>
                    <option value="Superviseur">Superviseur</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-school">École</Label>
                  <select id="edit-school" className="w-full p-2 border rounded-md" defaultValue={selectedAdmin.schoolId}>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <select id="edit-status" className="w-full p-2 border rounded-md" defaultValue={selectedAdmin.status}>
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Gestion complète', 'Rapports', 'Utilisateurs', 'Paramètres'].map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        defaultChecked={selectedAdmin.permissions.includes(permission)}
                      />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditAdminOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => {
                    toast.success('Administrateur supprimé avec succès');
                    setIsEditAdminOpen(false);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
                <Button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success('Administrateur mis à jour avec succès');
                    setIsEditAdminOpen(false);
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
