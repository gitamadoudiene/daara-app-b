'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  Shield,
  LoaderCircle,
  UserX,
  UserMinus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  schoolId: {
    _id: string;
    name: string;
  };
  classId?: {
    _id: string;
    name: string;
    level: string;
  };
  class?: string;
  subject?: string;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  createdAt: string;
  lastLogin?: string;
  children?: string[]; // IDs des enfants pour les parents
  parentId?: string; // ID du parent pour les étudiants
}

interface ClassData {
  _id: string;
  name: string;
  level: string;
}

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // États pour le formulaire de création
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student' as 'student' | 'teacher' | 'parent' | 'admin',
    gender: '' as '' | 'Masculin' | 'Féminin',
    status: 'Actif' as 'Actif' | 'Inactif' | 'Suspendu',
    classId: '',
    subjects: [] as string[],
    qualification: '',
    experience: '',
    profession: '',
    emergencyPhone: '',
    relation: '',
    address: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Fonction pour charger les utilisateurs
  const fetchUsers = useCallback(async () => {
    if (!user?.schoolId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const allUsers = await response.json();
        // Filtrer uniquement les utilisateurs de l'école de l'admin
        const schoolUsers = allUsers.filter((u: User) => 
          u.schoolId && u.schoolId._id === user.schoolId
        );
        setUsers(schoolUsers);
        setFilteredUsers(schoolUsers);
      } else {
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId]);

  // Charger les utilisateurs de l'école de l'admin
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Charger les classes de l'école de l'admin
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.schoolId) {
        console.log('Pas de schoolId pour l\'utilisateur');
        return;
      }
      
      try {
        setLoadingClasses(true);
        const token = localStorage.getItem('daara_token');
        console.log('Chargement des classes pour l\'école:', user.schoolId);
        
        const response = await fetch('http://localhost:5000/api/classes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const allClasses = await response.json();
          console.log('Toutes les classes récupérées:', allClasses);
          
          // Filtrer uniquement les classes de l'école de l'admin
          const schoolClasses = allClasses.filter((c: any) => {
            const classSchoolId = typeof c.schoolId === 'object' ? c.schoolId?._id || c.schoolId : c.schoolId;
            const userSchoolId = typeof user.schoolId === 'object' ? (user.schoolId as any)?._id || user.schoolId : user.schoolId;
            return classSchoolId === userSchoolId;
          });
          
          console.log('Classes filtrées pour l\'école:', schoolClasses);
          setClasses(schoolClasses);
        } else {
          console.error('Erreur lors du chargement des classes:', response.status);
          toast.error('Erreur lors du chargement des classes');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [user?.schoolId]);

  // Fonction pour filtrer les classes selon la recherche
  const getFilteredClasses = () => {
    if (!classSearchTerm) return classes;
    return classes.filter(c => 
      c.name.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
      c.level.toLowerCase().includes(classSearchTerm.toLowerCase())
    );
  };

  // Fonction pour vérifier si un parent a des enfants dans la classe sélectionnée
  const hasChildrenInClass = useCallback((parent: User, selectedClassId: string): boolean => {
    if (parent.role !== 'parent' || !parent.children) return false;
    
    // Chercher si un des enfants du parent est dans la classe sélectionnée
    return users.some(user => 
      parent.children?.includes(user._id) && 
      user.role === 'student' &&
      (user.classId?._id === selectedClassId || user.class === selectedClassId)
    );
  }, [users]);

  // Filtrer les utilisateurs selon les critères de recherche
  useEffect(() => {
    let filtered = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    if (classFilter !== 'all') {
      filtered = filtered.filter(u => {
        // Étudiants de la classe
        if (u.role === 'student') {
          return u.classId?._id === classFilter || u.class === classFilter;
        }
        // Parents dont les enfants sont dans la classe
        else if (u.role === 'parent') {
          return hasChildrenInClass(u, classFilter);
        }
        // Autres rôles : ne pas filtrer par classe
        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, classFilter, hasChildrenInClass]);

  // Fermer le dropdown des classes quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.class-search-container')) {
        setShowClassDropdown(false);
      }
    };

    if (showClassDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClassDropdown]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreateLoading(true);

    try {
      const token = localStorage.getItem('daara_token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Validation des champs requis
      if (!createForm.name.trim()) {
        throw new Error('Le nom est obligatoire');
      }
      if (!createForm.email.trim()) {
        throw new Error('L\'email est obligatoire');
      }
      if (!createForm.phone.trim()) {
        throw new Error('Le téléphone est obligatoire');
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(createForm.email)) {
        throw new Error('Format d\'email invalide');
      }

      // Préparer les données selon le rôle
      const userData: any = {
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        phone: createForm.phone.trim(),
        role: createForm.role,
        status: createForm.status,
        schoolId: user?.schoolId
      };

      // Ajouter les champs spécifiques selon le rôle
      if (createForm.role === 'student') {
        if (!createForm.classId) {
          throw new Error('La classe est obligatoire pour un étudiant');
        }
        userData.classId = createForm.classId;
        userData.gender = createForm.gender;
      } else if (createForm.role === 'teacher') {
        userData.subjects = createForm.subjects;
        userData.qualification = createForm.qualification;
        userData.experience = createForm.experience;
      } else if (createForm.role === 'parent') {
        userData.gender = createForm.gender;
        userData.profession = createForm.profession;
        userData.emergencyPhone = createForm.emergencyPhone;
        userData.relation = createForm.relation;
        userData.address = createForm.address;
      }

      // Déterminer l'endpoint selon le rôle
      let endpoint = '';
      switch (createForm.role) {
        case 'student':
          endpoint = '/api/users/students';
          break;
        case 'teacher':
          endpoint = '/api/teachers';
          break;
        case 'parent':
          endpoint = '/api/users/parents';
          break;
        case 'admin':
          endpoint = '/api/admins';
          break;
        default:
          throw new Error('Rôle non supporté');
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création');
      }

      // Succès
      const tempPassword = data.tempPassword || 'password123';
      setCreateSuccess(`${createForm.role === 'student' ? 'Étudiant' : 
                        createForm.role === 'teacher' ? 'Enseignant' : 
                        createForm.role === 'parent' ? 'Parent' : 'Administrateur'} créé avec succès ! Mot de passe temporaire: ${tempPassword}`);

      // Réinitialiser le formulaire
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        role: 'student',
        gender: '',
        status: 'Actif',
        classId: '',
        subjects: [],
        qualification: '',
        experience: '',
        profession: '',
        emergencyPhone: '',
        relation: '',
        address: ''
      });

      // Rafraîchir la liste
      await fetchUsers();

      // Fermer le modal après un délai
      setTimeout(() => {
        setIsCreateUserOpen(false);
        setCreateSuccess('');
      }, 5000);

    } catch (error: any) {
      setCreateError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsViewDetailsOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status
    });
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleSuspendUser = (user: User) => {
    const newStatus = user.status === 'Suspendu' ? 'Actif' : 'Suspendu';
    const action = user.status === 'Suspendu' ? 'réactiver' : 'suspendre';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.name} ?`)) {
      updateUserStatus(user._id, newStatus);
    }
  };

  // Form states for editing
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student' as 'student' | 'teacher' | 'parent' | 'admin',
    status: 'Actif' as 'Actif' | 'Inactif' | 'Suspendu'
  });

  // Delete confirmation states
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Update user function
  const updateUser = async (userId: string, userData: any) => {
    try {
      const token = localStorage.getItem('daara_token');
      if (!token) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u._id === userId ? { ...u, ...updatedUser } : u));
        toast.success('Utilisateur modifié avec succès !');
        setIsEditUserOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Erreur lors de la modification de l\'utilisateur';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  // Delete user function
  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('daara_token');
      if (!token) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        toast.success('Utilisateur supprimé avec succès !');
        setIsDeleteConfirmOpen(false);
        setUserToDelete(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Erreur lors de la suppression de l\'utilisateur';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  // Update user status function
  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('daara_token');
      if (!token) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus as 'Actif' | 'Inactif' | 'Suspendu' } : u));
        const action = newStatus === 'Suspendu' ? 'suspendu' : 'réactivé';
        toast.success(`Utilisateur ${action} avec succès !`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Erreur lors de la modification du statut';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!editForm.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    
    if (!editForm.email.trim()) {
      toast.error('L\'email est requis');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error('Format d\'email invalide');
      return;
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (editForm.phone && editForm.phone.length < 8) {
      toast.error('Le numéro de téléphone doit contenir au moins 8 chiffres');
      return;
    }
    
    if (selectedUser) {
      updateUser(selectedUser._id, editForm);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return GraduationCap;
      case 'teacher': return UserCheck;
      case 'parent': return Users;
      case 'admin': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Étudiant';
      case 'teacher': return 'Enseignant';
      case 'parent': return 'Parent';
      case 'admin': return 'Administrateur';
      default: return role;
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

  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const parentCount = users.filter(u => u.role === 'parent').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.status === 'Actif').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des utilisateurs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Utilisateurs</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous les utilisateurs de {user?.school?.name || 'votre établissement'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateUserOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Créer Utilisateur
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">utilisateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
            <p className="text-xs text-muted-foreground">étudiants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCount}</div>
            <p className="text-xs text-muted-foreground">enseignants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parents</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parentCount}</div>
            <p className="text-xs text-muted-foreground">parents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et Recherche</CardTitle>
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
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="student">Étudiants</SelectItem>
                <SelectItem value="teacher">Enseignants</SelectItem>
                <SelectItem value="parent">Parents</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Recherche de classe avec autocomplétion */}
            <div className="relative w-full sm:w-[200px] class-search-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une classe..."
                  value={selectedClass ? `${selectedClass.name} - ${selectedClass.level}` : classSearchTerm}
                  onChange={(e) => {
                    setClassSearchTerm(e.target.value);
                    setSelectedClass(null);
                    setClassFilter('all');
                    setShowClassDropdown(true);
                  }}
                  onFocus={() => setShowClassDropdown(true)}
                  className="pl-10 pr-8"
                />
                {selectedClass && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedClass(null);
                      setClassFilter('all');
                      setClassSearchTerm('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Dropdown avec les résultats de recherche */}
              {showClassDropdown && !selectedClass && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
                      onClick={() => {
                        setClassFilter('all');
                        setSelectedClass(null);
                        setClassSearchTerm('');
                        setShowClassDropdown(false);
                      }}
                    >
                      Toutes les classes
                    </button>
                    {getFilteredClasses().map((classe) => (
                      <button
                        key={classe._id}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
                        onClick={() => {
                          setSelectedClass(classe);
                          setClassFilter(classe._id);
                          setClassSearchTerm('');
                          setShowClassDropdown(false);
                        }}
                      >
                        <div className="font-medium">{classe.name}</div>
                        <div className="text-xs text-gray-500">{classe.level}</div>
                      </button>
                    ))}
                    {getFilteredClasses().length === 0 && classSearchTerm && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Aucune classe trouvée
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userItem) => {
                const RoleIcon = getRoleIcon(userItem.role);
                return (
                  <div key={userItem._id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <RoleIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{userItem.name}</h3>
                        <p className="text-sm text-muted-foreground">{userItem.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getRoleColor(userItem.role)}>
                            {getRoleLabel(userItem.role)}
                            {userItem.role === 'teacher' && userItem.subject && (
                              <span className="ml-1">- {userItem.subject}</span>
                            )}
                          </Badge>
                          <Badge className={getStatusColor(userItem.status)}>
                            {userItem.status}
                          </Badge>
                          {userItem.role === 'student' && (userItem.classId || userItem.class) && (
                            <Badge className="bg-indigo-100 text-indigo-800">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {userItem.classId?.name || userItem.class}
                              {userItem.classId?.level && ` - ${userItem.classId.level}`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(userItem)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(userItem)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuspendUser(userItem)}
                        className={userItem.status === 'Suspendu' ? 'text-green-600' : 'text-orange-600'}
                      >
                        {userItem.status === 'Suspendu' ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(userItem)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Aucun utilisateur trouvé</p>
                <p className="text-sm">Ajustez vos critères de recherche</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de l&apos;utilisateur</DialogTitle>
              <DialogDescription>
                Informations complètes de {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <p className="text-sm">{selectedUser.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label>Rôle</Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {getRoleLabel(selectedUser.role)}
                  </Badge>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label>École</Label>
                  <p className="text-sm">{selectedUser.schoolId.name}</p>
                </div>
                {selectedUser.role === 'student' && (selectedUser.classId || selectedUser.class) && (
                  <div>
                    <Label>Classe</Label>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {selectedUser.classId?.name || selectedUser.class}
                      {selectedUser.classId?.level && ` - ${selectedUser.classId.level}`}
                    </Badge>
                  </div>
                )}
                {selectedUser.role === 'teacher' && selectedUser.subject && (
                  <div>
                    <Label>Matière</Label>
                    <Badge className="bg-green-100 text-green-800">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {selectedUser.subject}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
              <DialogDescription>
                Modifier les informations de {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="edit-name">Nom complet</Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Rôle</Label>
                  <Select value={editForm.role} onValueChange={(value: any) => setEditForm({ ...editForm, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Étudiant</SelectItem>
                      <SelectItem value="teacher">Enseignant</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select value={editForm.status} onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
                      <SelectItem value="Suspendu">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditUserOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer les modifications
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {userToDelete && (
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement l&apos;utilisateur{' '}
                <strong>{userToDelete.name}</strong> ? Cette action est irréversible et supprimera
                toutes les données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteConfirmOpen(false);
                setUserToDelete(null);
              }}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUser(userToDelete._id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Modal de création d'utilisateur */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau compte utilisateur.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            {/* Informations de base */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Nom complet *</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="exemple@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-phone">Téléphone *</Label>
                <Input
                  id="create-phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+221 XX XXX XX XX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Rôle *</Label>
                <Select value={createForm.role} onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Étudiant</SelectItem>
                    <SelectItem value="teacher">Enseignant</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Champs spécifiques selon le rôle */}
            {createForm.role === 'student' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-gender">Genre</Label>
                    <Select value={createForm.gender} onValueChange={(value) => setCreateForm(prev => ({ ...prev, gender: value as "Masculin" | "Féminin" | "" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculin">Masculin</SelectItem>
                        <SelectItem value="Féminin">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-class">Classe *</Label>
                    <Select value={createForm.classId} onValueChange={(value) => setCreateForm(prev => ({ ...prev, classId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classe) => (
                          <SelectItem key={classe._id} value={classe._id}>
                            {classe.name} - {classe.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {createForm.role === 'teacher' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-qualification">Qualification</Label>
                    <Input
                      id="create-qualification"
                      value={createForm.qualification}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, qualification: e.target.value }))}
                      placeholder="Ex: Professeur certifié"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-experience">Expérience</Label>
                    <Input
                      id="create-experience"
                      value={createForm.experience}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Ex: 5 ans d'enseignement"
                    />
                  </div>
                </div>
              </div>
            )}

            {createForm.role === 'parent' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-gender">Genre</Label>
                    <Select value={createForm.gender} onValueChange={(value) => setCreateForm(prev => ({ ...prev, gender: value as "Masculin" | "Féminin" | "" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculin">Masculin</SelectItem>
                        <SelectItem value="Féminin">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-profession">Profession</Label>
                    <Input
                      id="create-profession"
                      value={createForm.profession}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, profession: e.target.value }))}
                      placeholder="Ex: Ingénieur"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-emergency-phone">Téléphone d&apos;urgence</Label>
                    <Input
                      id="create-emergency-phone"
                      value={createForm.emergencyPhone}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      placeholder="+221 XX XXX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-relation">Relation</Label>
                    <Input
                      id="create-relation"
                      value={createForm.relation}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, relation: e.target.value }))}
                      placeholder="Ex: Père, Mère, Tuteur"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-address">Adresse</Label>
                  <Input
                    id="create-address"
                    value={createForm.address}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            )}

            {/* Messages d'erreur et de succès */}
            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{createError}</p>
              </div>
            )}

            {createSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{createSuccess}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateUserOpen(false)}
                disabled={createLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createLoading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer l&apos;utilisateur
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}