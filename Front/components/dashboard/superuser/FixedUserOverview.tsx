'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MatiereTagsInput } from '@/components/ui/matiere-tags-input';
import { ClasseTagsInput } from '@/components/ui/classe-tags-input';
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
  
  // États pour les formulaires d'ajout d'utilisateurs
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateParentOpen, setIsCreateParentOpen] = useState(false);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);
  
  // États pour les formulaires
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  
  // États pour les données de l'API
  const [schools, setSchools] = useState<{ id: string, name: string }[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // États pour le formulaire d'enseignant
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    schoolId: '',
    qualification: '',
    experience: ''
  });
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    const token = localStorage.getItem('daara_token');
    const user = localStorage.getItem('daara_user');
    
    if (token && user) {
      setIsAuthenticated(true);
      console.log('Utilisateur authentifié avec token:', token.substring(0, 15) + '...');
    } else {
      setIsAuthenticated(false);
      console.warn('Utilisateur non authentifié ou token manquant');
      setError('Vous devez être connecté pour accéder à toutes les fonctionnalités. Certaines données ne seront pas disponibles.');
    }
  }, []);

  // Fonction pour récupérer les écoles depuis l'API
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem('daara_token');
        const response = await fetch('http://localhost:5000/api/school', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des écoles');
        }
        
        const data = await response.json();
        setSchools(data.map((school: any) => ({
          id: school._id,
          name: school.name
        })));
      } catch (error) {
        console.error('Erreur lors du chargement des écoles:', error);
        setError('Impossible de charger la liste des écoles');
      }
    };
    
    fetchSchools();
  }, []);

  // Fonction pour récupérer les utilisateurs depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      setUserLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('daara_token');
        
        if (!token) {
          console.warn('Aucun token disponible pour récupérer les utilisateurs');
          setUserLoading(false);
          return;
        }
        
        console.log('Récupération des utilisateurs depuis l\'API...');
        
        // Récupérer tous les utilisateurs avec un seul appel API
        const response = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        
        const userData = await response.json();
        console.log(`Données récupérées: ${userData.length} utilisateurs`);
        
        // Convertir en format User
        const formattedUsers: User[] = userData.map((user: any) => ({
          id: user._id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Sans nom',
          email: user.email || '',
          phone: user.phone || 'Non renseigné',
          role: mapRole(user.role),
          school: user.school?.name || 'Non assigné',
          schoolId: user.school?._id || user.schoolId || '',
          status: user.active ? 'Actif' : 'Inactif',
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || user.createdAt || new Date().toISOString(),
          class: user.class || null,
          subject: Array.isArray(user.subjects) ? user.subjects.join(', ') : null,
          children: Array.isArray(user.children) ? user.children.length : null
        }));
        
        // Mettre à jour l'état
        setUsers(formattedUsers);
        console.log(`Total ${formattedUsers.length} utilisateurs chargés`);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setError('Impossible de charger la liste des utilisateurs');
      } finally {
        setUserLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Fonction de mappage des rôles
  const mapRole = (role: string): 'Étudiant' | 'Enseignant' | 'Parent' | 'Administrateur' => {
    switch (role?.toLowerCase()) {
      case 'student': return 'Étudiant';
      case 'teacher': return 'Enseignant';
      case 'parent': return 'Parent';
      case 'admin': return 'Administrateur';
      default: return 'Étudiant';
    }
  };

  // Utilitaires pour l'UI
  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'Étudiant': return GraduationCap;
      case 'Enseignant': return BookOpen;
      case 'Parent': return UserCheck;
      case 'Administrateur': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'Étudiant': return 'bg-blue-100 text-blue-800';
      case 'Enseignant': return 'bg-green-100 text-green-800';
      case 'Parent': return 'bg-orange-100 text-orange-800';
      case 'Administrateur': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
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
      {!isAuthenticated && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Attention!</strong>
          <span className="block sm:inline"> Vous n&apos;êtes pas authentifié ou votre session a expiré. </span>
          <span className="block sm:inline">Certaines fonctionnalités ne seront pas disponibles.</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vue d&apos;ensemble des utilisateurs</h1>
        <Button onClick={() => setIsCreateUserOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter utilisateur
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600 mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-600 mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers} actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersByRole['Étudiant']}</div>
            <p className="text-xs text-muted-foreground">
              Élèves inscrits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersByRole['Enseignant']}</div>
            <p className="text-xs text-muted-foreground">
              Professeurs actifs
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

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <div className="w-full md:w-auto">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les rôles</SelectItem>
                <SelectItem value="Étudiant">Étudiants</SelectItem>
                <SelectItem value="Enseignant">Enseignants</SelectItem>
                <SelectItem value="Parent">Parents</SelectItem>
                <SelectItem value="Administrateur">Administrateurs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <Select value={filterSchool} onValueChange={setFilterSchool}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="École" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les écoles</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Tous les utilisateurs</CardTitle>
              <CardDescription>
                {userLoading ? 'Chargement des utilisateurs...' : `${filteredUsers.length} utilisateur(s) trouvé(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                </div>
              ) : (
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
                            <div className="grid gap-2 md:grid-cols-2">
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
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
