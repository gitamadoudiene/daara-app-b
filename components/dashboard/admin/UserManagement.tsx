'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  UserCheck,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Étudiant' | 'Enseignant' | 'Administrateur';
  class?: string;
  subject?: string;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  createdAt: string;
  lastLogin: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Amadou Diallo',
      email: 'amadou.diallo@daara.sn',
      phone: '+221 77 123 4567',
      role: 'Enseignant',
      subject: 'Mathématiques',
      status: 'Actif',
      createdAt: '2024-01-15',
      lastLogin: '2024-07-20'
    },
    {
      id: '2',
      name: 'Fatou Ba',
      email: 'fatou.ba@daara.sn',
      phone: '+221 70 987 6543',
      role: 'Étudiant',
      class: '6ème A',
      status: 'Actif',
      createdAt: '2024-02-01',
      lastLogin: '2024-07-21'
    },
    {
      id: '3',
      name: 'Ousmane Seck',
      email: 'ousmane.seck@daara.sn',
      phone: '+221 76 555 1234',
      role: 'Enseignant',
      subject: 'Français',
      status: 'Actif',
      createdAt: '2024-01-20',
      lastLogin: '2024-07-19'
    },
    {
      id: '4',
      name: 'Aissatou Ndiaye',
      email: 'aissatou.ndiaye@daara.sn',
      phone: '+221 78 999 8888',
      role: 'Étudiant',
      class: '5ème B',
      status: 'Suspendu',
      createdAt: '2024-02-15',
      lastLogin: '2024-07-15'
    },
    {
      id: '5',
      name: 'Ibrahim Fall',
      email: 'ibrahim.fall@daara.sn',
      phone: '+221 77 444 3333',
      role: 'Administrateur',
      status: 'Actif',
      createdAt: '2024-01-01',
      lastLogin: '2024-07-22'
    }
  ]);

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Utilisateur créé avec succès !');
    setIsCreateUserOpen(false);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsViewDetailsOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    toast.success(`Utilisateur ${user.name} supprimé avec succès !`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Étudiant': return GraduationCap;
      case 'Enseignant': return UserCheck;
      case 'Administrateur': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Étudiant': return 'bg-blue-100 text-blue-800';
      case 'Enseignant': return 'bg-green-100 text-green-800';
      case 'Administrateur': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'Inactif': return 'bg-gray-100 text-gray-800';
      case 'Suspendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const studentCount = users.filter(u => u.role === 'Étudiant').length;
  const teacherCount = users.filter(u => u.role === 'Enseignant').length;
  const adminCount = users.filter(u => u.role === 'Administrateur').length;
  const activeCount = users.filter(u => u.status === 'Actif').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Utilisateurs</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous les utilisateurs de votre établissement
          </p>
        </div>
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ajouter Utilisateur</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Créer un Nouvel Utilisateur</DialogTitle>
              <DialogDescription className="text-sm">
                Ajouter un nouvel étudiant, enseignant ou administrateur.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Nom Complet</Label>
                  <Input id="user-name" placeholder="Ex: Amadou Diallo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input id="user-email" type="email" placeholder="exemple@daara.sn" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-phone">Téléphone</Label>
                  <Input id="user-phone" placeholder="+221 77 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-role">Rôle</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Étudiant</SelectItem>
                      <SelectItem value="teacher">Enseignant</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-class">Classe (si étudiant)</Label>
                  <Input id="user-class" placeholder="Ex: 6ème A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-subject">Matière (si enseignant)</Label>
                  <Input id="user-subject" placeholder="Ex: Mathématiques" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="flex-1">Créer Utilisateur</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateUserOpen(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{studentCount}</div>
            <p className="text-xs text-muted-foreground">
              Étudiants inscrits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Enseignants</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{teacherCount}</div>
            <p className="text-xs text-muted-foreground">
              Enseignants actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Actifs</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="Étudiant">Étudiants</SelectItem>
                <SelectItem value="Enseignant">Enseignants</SelectItem>
                <SelectItem value="Administrateur">Administrateurs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actifs</SelectItem>
                <SelectItem value="Inactif">Inactifs</SelectItem>
                <SelectItem value="Suspendu">Suspendus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Liste des Utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <div key={user.id} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <RoleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          <h3 className="text-lg sm:text-xl font-semibold">{user.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="break-all">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {user.class && (
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 flex-shrink-0" />
                              <span>Classe: {user.class}</span>
                            </div>
                          )}
                          {user.subject && (
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4 flex-shrink-0" />
                              <span>Matière: {user.subject}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Détails</span>
                        <span className="sm:hidden">Voir</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Supprimer</span>
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Détails de l&apos;Utilisateur</DialogTitle>
            <DialogDescription className="text-sm">
              Informations complètes sur l&apos;utilisateur sélectionné
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label>Nom Complet</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label>Rôle</Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                {selectedUser.class && (
                  <div>
                    <Label>Classe</Label>
                    <p className="font-medium">{selectedUser.class}</p>
                  </div>
                )}
                {selectedUser.subject && (
                  <div>
                    <Label>Matière Enseignée</Label>
                    <p className="font-medium">{selectedUser.subject}</p>
                  </div>
                )}
                <div>
                  <Label>Statut</Label>
                  <Badge variant="outline" className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label>Date d&apos;Inscription</Label>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="lg:col-span-2">
                  <Label>Dernière Connexion</Label>
                  <p className="font-medium">{new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
