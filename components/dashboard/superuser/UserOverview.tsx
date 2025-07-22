'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  BookOpen,
  Shield,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Download,
  UserPlus
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Étudiant' | 'Enseignant' | 'Parent' | 'Administrateur';
  school: string;
  schoolId: string;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  createdAt: string;
  lastLogin: string;
  class?: string;
  subject?: string;
  children?: number;
}

export function UserOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  // Mock data for schools
  const schools = [
    { id: 'school1', name: 'Lycée Daara Excellence' },
    { id: 'school2', name: 'École Privée Al-Azhar' },
    { id: 'school3', name: 'Institut Futur Leaders' }
  ];

  // Mock data for users
  const users: User[] = [
    {
      id: 'user1',
      name: 'Aminata Diop',
      email: 'aminata.diop@daaraexcellence.sn',
      phone: '+221-77-123-4567',
      role: 'Administrateur',
      school: 'Lycée Daara Excellence',
      schoolId: 'school1',
      status: 'Actif',
      createdAt: '2024-01-01',
      lastLogin: '2024-07-22'
    },
    {
      id: 'user2',
      name: 'Mamadou Sall',
      email: 'mamadou.sall@alazhar.sn',
      phone: '+221-77-456-7890',
      role: 'Enseignant',
      school: 'École Privée Al-Azhar',
      schoolId: 'school2',
      status: 'Actif',
      createdAt: '2024-01-15',
      lastLogin: '2024-07-21',
      subject: 'Mathématiques'
    },
    {
      id: 'user3',
      name: 'Fatou Ndiaye',
      email: 'fatou.ndiaye@futureleaders.sn',
      phone: '+221-77-789-0123',
      role: 'Étudiant',
      school: 'Institut Futur Leaders',
      schoolId: 'school3',
      status: 'Actif',
      createdAt: '2024-02-01',
      lastLogin: '2024-07-22',
      class: 'Terminale S'
    },
    {
      id: 'user4',
      name: 'Ousmane Ba',
      email: 'ousmane.ba@gmail.com',
      phone: '+221-77-234-5678',
      role: 'Parent',
      school: 'Lycée Daara Excellence',
      schoolId: 'school1',
      status: 'Actif',
      createdAt: '2024-03-01',
      lastLogin: '2024-07-20',
      children: 2
    },
    {
      id: 'user5',
      name: 'Aïssatou Diagne',
      email: 'aissatou.diagne@futureleaders.sn',
      phone: '+221-77-345-6789',
      role: 'Enseignant',
      school: 'Institut Futur Leaders',
      schoolId: 'school3',
      status: 'Inactif',
      createdAt: '2024-04-01',
      lastLogin: '2024-06-15',
      subject: 'Histoire-Géographie'
    },
    {
      id: 'user6',
      name: 'Ibrahima Sarr',
      email: 'ibrahima.sarr@daaraexcellence.sn',
      phone: '+221-77-456-7891',
      role: 'Étudiant',
      school: 'Lycée Daara Excellence',
      schoolId: 'school1',
      status: 'Suspendu',
      createdAt: '2024-05-01',
      lastLogin: '2024-07-10',
      class: 'Première L'
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Étudiant': return GraduationCap;
      case 'Enseignant': return BookOpen;
      case 'Parent': return UserCheck;
      case 'Administrateur': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Étudiant': return 'bg-blue-100 text-blue-800';
      case 'Enseignant': return 'bg-green-100 text-green-800';
      case 'Parent': return 'bg-orange-100 text-orange-800';
      case 'Administrateur': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'text-green-600 border-green-600';
      case 'Inactif': return 'text-red-600 border-red-600';
      case 'Suspendu': return 'text-orange-600 border-orange-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.school.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === '' || user.role === filterRole;
    const matchesSchool = filterSchool === '' || user.schoolId === filterSchool;
    const matchesStatus = filterStatus === '' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesSchool && matchesStatus;
  });

  // Get statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Actif').length;
  const usersByRole = {
    'Étudiant': users.filter(u => u.role === 'Étudiant').length,
    'Enseignant': users.filter(u => u.role === 'Enseignant').length,
    'Parent': users.filter(u => u.role === 'Parent').length,
    'Administrateur': users.filter(u => u.role === 'Administrateur').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Vue d&apos;Ensemble des Utilisateurs</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous les utilisateurs du système DAARA
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ajouter Utilisateur</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs enregistrés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersByRole['Étudiant']}</div>
            <p className="text-xs text-muted-foreground">
              Étudiants actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersByRole['Enseignant']}</div>
            <p className="text-xs text-muted-foreground">
              Enseignants actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parents</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersByRole['Parent']}</div>
            <p className="text-xs text-muted-foreground">
              Parents enregistrés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersByRole['Administrateur']}</div>
            <p className="text-xs text-muted-foreground">
              Administrateurs système
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="students">Étudiants</TabsTrigger>
          <TabsTrigger value="teachers">Enseignants</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="admins">Administrateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres et Recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="search"
                      placeholder="Nom, email..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-role">Rôle</Label>
                  <select 
                    id="filter-role" 
                    className="w-full p-2 border rounded-md"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">Tous les rôles</option>
                    <option value="Étudiant">Étudiant</option>
                    <option value="Enseignant">Enseignant</option>
                    <option value="Parent">Parent</option>
                    <option value="Administrateur">Administrateur</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-school">École</Label>
                  <select 
                    id="filter-school" 
                    className="w-full p-2 border rounded-md"
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
                      setFilterRole('');
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

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Utilisateurs</CardTitle>
              <CardDescription>
                {filteredUsers.length} utilisateur(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <div key={user.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <RoleIcon className="h-6 w-6 text-blue-600" />
                            <h3 className="text-xl font-semibold">{user.name}</h3>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{user.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4" />
                                <span>{user.school}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {user.class && (
                                <div className="flex items-center space-x-2">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>Classe: {user.class}</span>
                                </div>
                              )}
                              {user.subject && (
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="h-4 w-4" />
                                  <span>Matière: {user.subject}</span>
                                </div>
                              )}
                              {user.children && (
                                <div className="flex items-center space-x-2">
                                  <UserCheck className="h-4 w-4" />
                                  <span>{user.children} enfant(s)</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Créé le: {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsViewDetailsOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <MoreHorizontal className="h-4 w-4" />
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

        {/* Similar content for other tabs would be filtered versions of the same list */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Étudiants</CardTitle>
              <CardDescription>
                {users.filter(u => u.role === 'Étudiant').length} étudiant(s) dans le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => u.role === 'Étudiant').map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.class} - {user.school}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enseignants</CardTitle>
              <CardDescription>
                {users.filter(u => u.role === 'Enseignant').length} enseignant(s) dans le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => u.role === 'Enseignant').map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.subject} - {user.school}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parents</CardTitle>
              <CardDescription>
                {users.filter(u => u.role === 'Parent').length} parent(s) dans le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => u.role === 'Parent').map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-5 w-5 text-orange-600" />
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.children} enfant(s) - {user.school}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Administrateurs</CardTitle>
              <CardDescription>
                {users.filter(u => u.role === 'Administrateur').length} administrateur(s) dans le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => u.role === 'Administrateur').map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-purple-600" />
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">Administrateur - {user.school}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
