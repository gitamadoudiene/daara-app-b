'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Bell,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Database,
  FileText,
  School,
  UserCheck,
  ClipboardList,
  Activity,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  UserPlus,
  Baby,
  Phone,
  Mail,
  MapPin,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

import { UserManagement } from './admin/UserManagement';
import { SchoolStructure } from './admin/SchoolStructure';
import { ReportsAnalytics } from './admin/ReportsAnalytics';
import { SecuritySettings } from './admin/SecuritySettings';
import { DataManagement } from './admin/DataManagement';
import { SystemSettings } from './admin/SystemSettings';
import { ClassAssignment } from './admin/ClassAssignment';
import ScheduleManagement from './admin/ScheduleManagement';
import { ExamManagement } from './admin/ExamManagement';

type ActivePage = 'overview' | 'users' | 'structure' | 'reports' | 'schedule' | 'security' | 'data' | 'system';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  pendingReports: number;
  systemHealth: number;
}

interface RecentActivity {
  id: string;
  type: 'user_creation' | 'class_update' | 'report_generated' | 'security_alert';
  message: string;
  timestamp: string;
  user: string;
}

export function AdminDashboard() {
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  // États pour les formulaires d'ajout
  const [isCreateParentOpen, setIsCreateParentOpen] = useState(false);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [classes, setClasses] = useState<{ id: string, name: string, level: string }[]>([]);
  const [parents, setParents] = useState<{ id: string, name: string }[]>([]);
  
  // États pour les formulaires
  const [parentForm, setParentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    schoolId: user?.schoolId || '',
    gender: '',
    status: 'Actif',
    profession: '',
    emergencyPhone: '',
    relation: ''
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    schoolId: user?.schoolId || '',
    qualification: '',
    experience: '',
    specialization: '',
    subjects: [] as string[]
  });
  
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    schoolId: user?.schoolId || '',
    classId: '',
    parentId: undefined as string | undefined,
    dateOfBirth: '',
    gender: '',
    status: 'Actif'
  });
  
  // Pour la recherche de parents
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [filteredParents, setFilteredParents] = useState<{id: string, name: string}[]>([]);
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  const [classForm, setClassForm] = useState({
    name: '',
    level: '',
    capacity: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    schoolId: user?.schoolId || '',
    teacherId: 'none', // Professeur titulaire
    room: '', // Salle de classe
    subjects: [] as string[] // Liste des matières
  });

  // États pour les listes de données
  const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<{ id: string, name: string }[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [rooms] = useState(() => {
    // Générer les salles de 1 à 100
    return Array.from({ length: 100 }, (_, i) => ({
      id: (i + 1).toString(),
      name: `Salle ${i + 1}`
    }));
  });

  // Mock dashboard stats
  const stats: DashboardStats = {
    totalUsers: 1580,
    totalStudents: 1234,
    totalTeachers: 89,
    totalClasses: 45,
    activeClasses: 42,
    pendingReports: 12,
    systemHealth: 98
  };

  // Mock recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user_creation',
      message: 'Nouvel étudiant ajouté: Aïssa Diallo',
      timestamp: '2024-07-22 14:30:00',
      user: 'Admin Principal'
    },
    {
      id: '2',
      type: 'class_update',
      message: 'Classe CE2 mise à jour - 28 élèves',
      timestamp: '2024-07-22 13:15:00',
      user: 'Directeur Pédagogique'
    },
    {
      id: '3',
      type: 'report_generated',
      message: 'Rapport mensuel généré avec succès',
      timestamp: '2024-07-22 12:00:00',
      user: 'Système'
    },
    {
      id: '4',
      type: 'security_alert',
      message: 'Tentative de connexion suspecte détectée',
      timestamp: '2024-07-22 11:45:00',
      user: 'Système de Sécurité'
    },
    {
      id: '5',
      type: 'user_creation',
      message: 'Nouveau professeur ajouté: M. Mamadou Sow',
      timestamp: '2024-07-22 10:30:00',
      user: 'Admin Principal'
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'users', label: 'Gestion Utilisateurs', icon: Users },
    { id: 'structure', label: 'Classes & Affectation', icon: School },
    { id: 'schedule', label: 'Emploi du Temps', icon: Calendar },
    { id: 'security', label: 'Paramètres Sécurité', icon: Shield },
    { id: 'data', label: 'Gestion Données', icon: Database },
    { id: 'system', label: 'Examens & Notes', icon: ClipboardList }
  ];

  const handlePageChange = (pageId: ActivePage) => {
    setActivePage(pageId);
    setMobileMenuOpen(false); // Close mobile menu when page changes
  };

  const handleLogout = () => {
    logout();
    // Optionally redirect to login page
    window.location.href = '/';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_user': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_user': return 'Super Utilisateur';
      case 'admin': return 'Administrateur';
      case 'teacher': return 'Enseignant';
      case 'parent': return 'Parent';
      case 'student': return 'Étudiant';
      default: return 'Utilisateur';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_creation': return UserCheck;
      case 'class_update': return ClipboardList;
      case 'report_generated': return FileText;
      case 'security_alert': return Shield;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_creation': return 'bg-green-100 text-green-800';
      case 'class_update': return 'bg-blue-100 text-blue-800';
      case 'report_generated': return 'bg-purple-100 text-purple-800';
      case 'security_alert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour charger les classes de l'école
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch(`http://localhost:5000/api/classes/school/${user?.schoolId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data.map((cls: any) => ({ 
          id: cls._id,
          name: cls.name,
          level: cls.level,
          capacity: cls.capacity || 40,
          enrolled: cls.studentCount || 0,
          room: cls.room || 'Salle à définir',
          teacherIds: cls.teacherIds || [],
          subjects: cls.subjects || []
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  };

  // Charger les données nécessaires pour les formulaires
  useEffect(() => {
    if (user?.schoolId) {
      // Charger les classes de l'école de l'admin
      const fetchClassesLocal = async () => {
        try {
          const token = localStorage.getItem('daara_token');
          const response = await fetch(`http://localhost:5000/api/classes/school/${user.schoolId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setClasses(data.map((cls: any) => ({ id: cls._id, name: cls.name, level: cls.level })));
          }
        } catch (error) {
          console.error('Erreur lors du chargement des classes:', error);
        }
      };

      // Charger les parents de l'école de l'admin
      const fetchParents = async () => {
        try {
          const token = localStorage.getItem('daara_token');
          const response = await fetch('http://localhost:5000/api/users/parents', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            // Filtrer les parents par l'école de l'admin
            const schoolParents = data.filter((parent: any) => parent.schoolId?._id === user.schoolId);
            const mappedParents = schoolParents.map((parent: any) => ({ id: parent._id, name: parent.name }));
            setParents(mappedParents);
            setFilteredParents(mappedParents); // Initialiser également les parents filtrés
          }
        } catch (error) {
          console.error('Erreur lors du chargement des parents:', error);
        }
      };

      fetchClassesLocal();
      fetchParents();
      // Appeler les fonctions définies en dehors de useEffect
      const loadTeachers = async () => {
        try {
          const token = localStorage.getItem('daara_token');
          const response = await fetch(`http://localhost:5000/api/teachers`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const allTeachers = await response.json();
            // Filtrer les enseignants par école
            const schoolTeachers = allTeachers.filter((teacher: any) => {
              const teacherSchoolId = typeof teacher.schoolId === 'object' ? teacher.schoolId?._id : teacher.schoolId;
              return teacherSchoolId === user?.schoolId;
            });
            setTeachers(schoolTeachers.map((teacher: any) => ({ id: teacher._id, name: teacher.name })));
          }
        } catch (error) {
          console.error('Erreur lors du chargement des professeurs:', error);
        }
      };
      
      const loadSubjects = async () => {
        console.log('🔍 Chargement des matières pour l\'école:', user?.schoolId);
        try {
          const token = localStorage.getItem('daara_token');
          const response = await fetch(`http://localhost:5000/api/subjects/school/${user.schoolId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log('📚 Matières reçues du serveur:', data);
            setAvailableSubjects(data);
          } else {
            console.error('❌ Erreur de réponse du serveur:', response.status);
            // En cas d'erreur, charger les matières par défaut
            const defaultSubjects = [
              { id: 'Mathématiques', name: 'Mathématiques' },
              { id: 'Français', name: 'Français' },
              { id: 'Histoire-Géographie', name: 'Histoire-Géographie' },
              { id: 'Sciences', name: 'Sciences' },
              { id: 'Anglais', name: 'Anglais' },
              { id: 'Arts Plastiques', name: 'Arts Plastiques' },
              { id: 'Éducation Physique', name: 'Éducation Physique' },
              { id: 'Philosophie', name: 'Philosophie' },
              { id: 'Physique-Chimie', name: 'Physique-Chimie' },
              { id: 'Sciences de la Vie et de la Terre', name: 'Sciences de la Vie et de la Terre' },
              { id: 'Littérature', name: 'Littérature' },
              { id: 'Économie', name: 'Économie' }
            ];
            setAvailableSubjects(defaultSubjects);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des matières:', error);
          // En cas d'erreur, charger les matières par défaut
          const defaultSubjects = [
            { id: 'Mathématiques', name: 'Mathématiques' },
            { id: 'Français', name: 'Français' },
            { id: 'Histoire-Géographie', name: 'Histoire-Géographie' },
            { id: 'Sciences', name: 'Sciences' },
            { id: 'Anglais', name: 'Anglais' },
            { id: 'Arts Plastiques', name: 'Arts Plastiques' },
            { id: 'Éducation Physique', name: 'Éducation Physique' },
            { id: 'Philosophie', name: 'Philosophie' },
            { id: 'Physique-Chimie', name: 'Physique-Chimie' },
            { id: 'Sciences de la Vie et de la Terre', name: 'Sciences de la Vie et de la Terre' },
            { id: 'Littérature', name: 'Littérature' },
            { id: 'Économie', name: 'Économie' }
          ];
          setAvailableSubjects(defaultSubjects);
        }
      };
      
      loadTeachers();
      loadSubjects();
    }
  }, [user?.schoolId]);

  // Fonction pour créer un parent
  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/users/parents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: parentForm.name,
          email: parentForm.email,
          phone: parentForm.phone,
          address: parentForm.address,
          schoolId: user?.schoolId, // École verrouillée
          gender: parentForm.gender,
          status: parentForm.status,
          profession: parentForm.profession,
          emergencyPhone: parentForm.emergencyPhone,
          relation: parentForm.relation
        })
      });

      if (response.ok) {
        toast.success('Parent créé avec succès');
        setIsCreateParentOpen(false);
        // Reset form
        setParentForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          schoolId: user?.schoolId || '',
          gender: '',
          status: 'Actif',
          profession: '',
          emergencyPhone: '',
          relation: ''
        });
        // Rafraîchir la liste des parents
        const fetchParents = async () => {
          const parentsResponse = await fetch('http://localhost:5000/api/users/parents', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (parentsResponse.ok) {
            const parentsData = await parentsResponse.json();
            const schoolParents = parentsData.filter((parent: any) => parent.schoolId?._id === user?.schoolId);
            setParents(schoolParents.map((parent: any) => ({ id: parent._id, name: parent.name })));
          }
        };
        fetchParents();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erreur lors de la création du parent');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du parent');
    }
  };

  // Fonction pour créer un enseignant
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/teachers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: teacherForm.name,
          email: teacherForm.email,
          phone: teacherForm.phone,
          schoolId: user?.schoolId, // École verrouillée
          qualification: teacherForm.qualification,
          experience: teacherForm.experience,
          specialization: teacherForm.specialization,
          subjects: teacherForm.subjects
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Enseignant créé avec succès! Mot de passe temporaire: ${data.tempPassword}`);
        setIsCreateTeacherOpen(false);
        // Reset form
        setTeacherForm({
          name: '',
          email: '',
          phone: '',
          schoolId: user?.schoolId || '',
          qualification: '',
          experience: '',
          specialization: '',
          subjects: []
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erreur lors de la création de l\'enseignant');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de l\'enseignant');
    }
  };

  // Fonction pour la recherche de parents
  const handleParentSearch = (searchTerm: string) => {
    setParentSearchTerm(searchTerm);
    
    if (searchTerm.trim() === '') {
      setFilteredParents(parents);
    } else {
      const filtered = parents.filter(parent =>
        parent.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParents(filtered);
    }
    
    setShowParentDropdown(true);
  };

  // Fonction pour sélectionner un parent
  const handleParentSelect = (parent: { id: string, name: string }) => {
    setStudentForm({...studentForm, parentId: parent.id});
    setParentSearchTerm(parent.name);
    setShowParentDropdown(false);
  };

  // Fonction pour effacer la sélection de parent
  const clearParentSelection = () => {
    setStudentForm({...studentForm, parentId: undefined});
    setParentSearchTerm('');
    setFilteredParents(parents);
    setShowParentDropdown(false);
  };
  
  // Fonction pour créer un étudiant
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/users/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: studentForm.name,
          email: studentForm.email,
          phone: studentForm.phone,
          address: studentForm.address,
          schoolId: user?.schoolId, // École verrouillée
          classId: studentForm.classId,
          parentId: studentForm.parentId,
          dateOfBirth: studentForm.dateOfBirth,
          gender: studentForm.gender,
          status: studentForm.status
        })
      });

      if (response.ok) {
        toast.success('Étudiant créé avec succès');
        setIsCreateStudentOpen(false);
        // Reset form
        setStudentForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          schoolId: user?.schoolId || '',
          classId: '',
          parentId: undefined,
          dateOfBirth: '',
          gender: '',
          status: 'Actif'
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erreur lors de la création de l\'étudiant');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de l\'étudiant');
    }
  };

  // Fonction pour créer une classe
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: classForm.name,
          level: classForm.level,
          capacity: parseInt(classForm.capacity),
          academicYear: classForm.academicYear,
          schoolId: user?.schoolId,
          resTeacher: classForm.teacherId && classForm.teacherId !== 'none' ? classForm.teacherId : null, // Professeur principal
          room: classForm.room,
          subjects: classForm.subjects // Liste des matières
        })
      });

      if (response.ok) {
        toast.success('Classe créée avec succès');
        setIsCreateClassOpen(false);
        // Reset form
        setClassForm({
          name: '',
          level: '',
          capacity: '',
          academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          schoolId: user?.schoolId || '',
          teacherId: 'none',
          room: '',
          subjects: []
        });
        // Rafraîchir la liste des classes
        fetchClasses();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erreur lors de la création de la classe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de la classe');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center flex-shrink-0 px-4 py-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">DAARA</h1>
            <p className="text-xs text-gray-500">Administration</p>
            {user?.school?.name && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                {user.school.name}
              </p>
            )}
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id as ActivePage)}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activePage === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* User Profile Section */}
      <div className="border-t px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin Principal'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@daara.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Admin Principal'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'admin@daara.com'}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full w-fit ${getRoleColor(user?.role || 'admin')}`}>
                  {getRoleLabel(user?.role || 'admin')}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderActivePage = () => {
    switch (activePage) {
      case 'users':
        return <UserManagement />;
      case 'structure':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Classes & Affectation</h2>
              <p className="text-muted-foreground">
                Gérez les classes et l&apos;affectation des étudiants
              </p>
            </div>
            <div className="grid gap-6">
              <SchoolStructure />
            </div>
          </div>
        );
      case 'reports':
        return <ReportsAnalytics />;
      case 'schedule':
        return <ScheduleManagement />;
      case 'security':
        return <SecuritySettings />;
      case 'data':
        return <DataManagement />;
      case 'system':
        return <SystemSettings />;
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Tableau de Bord Administrateur</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Vue d&apos;ensemble de votre établissement scolaire
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button size="sm" className="w-full sm:w-auto">
                  <Bell className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Notifications</span>
                  <span className="xs:hidden">Notif</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Calendrier</span>
                  <span className="xs:hidden">Cal</span>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{Math.floor(stats.totalUsers * 0.02)} ce mois
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Étudiants Actifs</CardTitle>
                  <GraduationCap className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalTeachers} enseignants
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Classes Actives</CardTitle>
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.activeClasses}</div>
                  <p className="text-xs text-muted-foreground">
                    sur {stats.totalClasses} classes
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Santé Système</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.systemHealth}%</div>
                  <p className="text-xs text-muted-foreground">
                    Performances optimales
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              {/* Quick Actions */}
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Actions Rapides</CardTitle>
                  <CardDescription>
                    Accès rapide aux fonctionnalités principales
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 sm:space-y-3">
                {/* Ajouter Enseignant */}
                <Dialog open={isCreateTeacherOpen} onOpenChange={setIsCreateTeacherOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-3"
                      >
                        <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Ajouter Enseignant</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Ajouter un nouvel Enseignant</DialogTitle>
                        <DialogDescription>
                          Veuillez remplir les informations de l&apos;enseignant pour {user?.school?.name || 'votre école'}.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateTeacher} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="teacher-name">Nom complet</Label>
                            <Input
                              id="teacher-name"
                              value={teacherForm.name}
                              onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                              placeholder="Ex: Cheikh Diop"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacher-email">Email</Label>
                            <Input
                              id="teacher-email"
                              type="email"
                              value={teacherForm.email}
                              onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                              placeholder="exemple@daara.sn"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacher-phone">Téléphone</Label>
                            <Input
                              id="teacher-phone"
                              value={teacherForm.phone}
                              onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                              placeholder="+221 77 123 4567"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacher-qualification">Qualification</Label>
                            <Input
                              id="teacher-qualification"
                              value={teacherForm.qualification}
                              onChange={(e) => setTeacherForm({...teacherForm, qualification: e.target.value})}
                              placeholder="Ex: Master en Mathématiques"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacher-experience">Expérience</Label>
                            <Input
                              id="teacher-experience"
                              value={teacherForm.experience}
                              onChange={(e) => setTeacherForm({...teacherForm, experience: e.target.value})}
                              placeholder="Ex: 5 ans d'enseignement"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacher-specialization">Spécialisation</Label>
                            <Input
                              id="teacher-specialization"
                              value={teacherForm.specialization}
                              onChange={(e) => setTeacherForm({...teacherForm, specialization: e.target.value})}
                              placeholder="Ex: Mathématiques, Sciences"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <Label>Matières enseignées</Label>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                {availableSubjects && availableSubjects.length > 0 ? (
                                  availableSubjects.map((subject) => (
                                    <label key={subject._id || subject.id || subject.name} className="flex items-center space-x-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={teacherForm.subjects.includes(subject.name)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setTeacherForm({
                                              ...teacherForm, 
                                              subjects: [...teacherForm.subjects, subject.name]
                                            });
                                          } else {
                                            setTeacherForm({
                                              ...teacherForm,
                                              subjects: teacherForm.subjects.filter(s => s !== subject.name)
                                            });
                                          }
                                        }}
                                        className="rounded border-gray-300"
                                      />
                                      <span className="truncate">{subject.name}</span>
                                    </label>
                                  ))
                                ) : (
                                  <div className="col-span-full text-center py-4 text-gray-500">
                                    Aucune matière disponible pour cette école
                                  </div>
                                )}
                              </div>
                              {teacherForm.subjects.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {teacherForm.subjects.map((subject) => (
                                    <span key={subject} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      {subject}
                                      <button
                                        type="button"
                                        onClick={() => setTeacherForm({
                                          ...teacherForm,
                                          subjects: teacherForm.subjects.filter(s => s !== subject)
                                        })}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Sélectionnez les matières que l&apos;enseignant va enseigner ({teacherForm.subjects.length} sélectionnée{teacherForm.subjects.length > 1 ? 's' : ''})
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>École</Label>
                            <div className="p-2 bg-gray-50 rounded border">
                              <span className="text-sm text-gray-600">🏫 {user?.school?.name || 'École non spécifiée'}</span>
                              <p className="text-xs text-gray-500 mt-1">École verrouillée pour cet administrateur</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsCreateTeacherOpen(false)}>
                            Annuler
                          </Button>
                          <Button type="submit">Créer l&apos;Enseignant</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                {/* fin ajouter Enseignant */}

                  <Dialog open={isCreateParentOpen} onOpenChange={setIsCreateParentOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-3"
                      >
                        <UserPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Ajouter Parent</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Ajouter un nouveau Parent</DialogTitle>
                        <DialogDescription>
                          Veuillez remplir les informations du parent pour {user?.school?.name || 'votre école'}.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateParent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="parent-name">Nom complet</Label>
                            <Input
                              id="parent-name"
                              value={parentForm.name}
                              onChange={(e) => setParentForm({...parentForm, name: e.target.value})}
                              placeholder="Nom du parent"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parent-email">Email</Label>
                            <Input
                              id="parent-email"
                              type="email"
                              value={parentForm.email}
                              onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                              placeholder="email@example.com"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parent-phone">Téléphone</Label>
                            <Input
                              id="parent-phone"
                              value={parentForm.phone}
                              onChange={(e) => setParentForm({...parentForm, phone: e.target.value})}
                              placeholder="+221 XX XXX XX XX"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parent-gender">Genre</Label>
                            <Select value={parentForm.gender} onValueChange={(value) => setParentForm({...parentForm, gender: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le genre" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Masculin">Masculin</SelectItem>
                                <SelectItem value="Féminin">Féminin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parent-profession">Profession</Label>
                            <Input
                              id="parent-profession"
                              value={parentForm.profession}
                              onChange={(e) => setParentForm({...parentForm, profession: e.target.value})}
                              placeholder="Profession du parent"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parent-emergency">Téléphone d&apos;urgence</Label>
                            <Input
                              id="parent-emergency"
                              value={parentForm.emergencyPhone}
                              onChange={(e) => setParentForm({...parentForm, emergencyPhone: e.target.value})}
                              placeholder="+221 XX XXX XX XX"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="parent-address">Adresse</Label>
                            <Input
                              id="parent-address"
                              value={parentForm.address}
                              onChange={(e) => setParentForm({...parentForm, address: e.target.value})}
                              placeholder="Adresse complète"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>École</Label>
                            <div className="p-2 bg-gray-50 rounded border">
                              <span className="text-sm text-gray-600">🏫 {user?.school?.name || 'École non spécifiée'}</span>
                              <p className="text-xs text-gray-500 mt-1">École verrouillée pour cet administrateur</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsCreateParentOpen(false)}>
                            Annuler
                          </Button>
                          <Button type="submit">Créer le Parent</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-3"
                      >
                        <Baby className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Ajouter Étudiant</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Ajouter un nouvel Étudiant</DialogTitle>
                        <DialogDescription>
                          Veuillez remplir les informations de l&apos;étudiant pour {user?.school?.name || 'votre école'}.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateStudent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="student-name">Nom complet</Label>
                            <Input
                              id="student-name"
                              value={studentForm.name}
                              onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                              placeholder="Nom de l'étudiant"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-email">Email</Label>
                            <Input
                              id="student-email"
                              type="email"
                              value={studentForm.email}
                              onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                              placeholder="email@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-phone">Téléphone</Label>
                            <Input
                              id="student-phone"
                              value={studentForm.phone}
                              onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                              placeholder="+221 XX XXX XX XX"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-birth">Date de naissance</Label>
                            <Input
                              id="student-birth"
                              type="date"
                              value={studentForm.dateOfBirth}
                              onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-gender">Genre</Label>
                            <Select value={studentForm.gender} onValueChange={(value) => setStudentForm({...studentForm, gender: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le genre" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Masculin">Masculin</SelectItem>
                                <SelectItem value="Féminin">Féminin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-class">Classe</Label>
                            <Select value={studentForm.classId} onValueChange={(value) => setStudentForm({...studentForm, classId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une classe" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map((classItem) => (
                                  <SelectItem key={classItem.id} value={classItem.id}>
                                    {classItem.name} - {classItem.level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-parent">Parent</Label>
                            <div className="relative" data-parent-search>
                              <div className="flex">
                                <Input
                                  id="student-parent"
                                  type="text"
                                  placeholder="Rechercher un parent..."
                                  value={parentSearchTerm}
                                  onChange={(e) => handleParentSearch(e.target.value)}
                                  onFocus={() => setShowParentDropdown(true)}
                                  className="flex-1"
                                />
                                {studentForm.parentId && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="px-2 ml-1"
                                    onClick={clearParentSelection}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              {showParentDropdown && filteredParents.length > 0 && (
                                <div className="absolute mt-1 w-full z-10 bg-white rounded-md border border-gray-200 shadow-lg max-h-60 overflow-auto">
                                  {filteredParents.map((parent) => (
                                    <div
                                      key={parent.id}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => handleParentSelect(parent)}
                                    >
                                      {parent.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="student-address">Adresse</Label>
                            <Input
                              id="student-address"
                              value={studentForm.address}
                              onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                              placeholder="Adresse complète"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>École</Label>
                            <div className="p-2 bg-gray-50 rounded border">
                              <span className="text-sm text-gray-600">🏫 {user?.school?.name || 'École non spécifiée'}</span>
                              <p className="text-xs text-gray-500 mt-1">École verrouillée pour cet administrateur</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsCreateStudentOpen(false)}>
                            Annuler
                          </Button>
                          <Button type="submit">Créer l&apos;Étudiant</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-3"
                      >
                        <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Créer Classe</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle Classe</DialogTitle>
                        <DialogDescription>
                          Veuillez remplir les informations de la classe pour {user?.school?.name || 'votre école'}.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateClass} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="class-name">Nom de la Classe</Label>
                            <Input 
                              id="class-name" 
                              value={classForm.name}
                              onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: 6ème A" 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-level">Niveau</Label>
                            <Select 
                              value={classForm.level}
                              onValueChange={(value) => setClassForm(prev => ({ ...prev, level: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le niveau" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CP">CP - Cours Préparatoire</SelectItem>
                                <SelectItem value="CE1">CE1 - Cours Élémentaire 1</SelectItem>
                                <SelectItem value="CE2">CE2 - Cours Élémentaire 2</SelectItem>
                                <SelectItem value="CM1">CM1 - Cours Moyen 1</SelectItem>
                                <SelectItem value="CM2">CM2 - Cours Moyen 2</SelectItem>
                                <SelectItem value="6eme">6ème</SelectItem>
                                <SelectItem value="5eme">5ème</SelectItem>
                                <SelectItem value="4eme">4ème</SelectItem>
                                <SelectItem value="3eme">3ème</SelectItem>
                                <SelectItem value="2nde">2nde</SelectItem>
                                <SelectItem value="1ere">1ère</SelectItem>
                                <SelectItem value="Terminal_S">Terminal S</SelectItem>
                                <SelectItem value="Terminal_L">Terminal L</SelectItem>
                                <SelectItem value="Terminal_G">Terminal G</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-capacity">Capacité</Label>
                            <Input 
                              id="class-capacity" 
                              type="number"
                              value={classForm.capacity}
                              onChange={(e) => setClassForm(prev => ({ ...prev, capacity: e.target.value }))}
                              placeholder="40" 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-teacher">Enseignant Principal</Label>
                            <Select 
                              value={classForm.teacherId}
                              onValueChange={(value) => setClassForm(prev => ({ ...prev, teacherId: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un enseignant" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class-room">Salle</Label>
                            <Input 
                              id="class-room" 
                              value={classForm.room}
                              onChange={(e) => setClassForm(prev => ({ ...prev, room: e.target.value }))}
                              placeholder="Ex: Salle 101" 
                              required 
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                          <Button type="submit" className="flex-1">Créer Classe</Button>
                          <Button type="button" variant="outline" onClick={() => setIsCreateClassOpen(false)} className="flex-1">
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handlePageChange('structure')}
                  >
                    <UserCheck className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Gestion des Classes</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handlePageChange('reports')}
                  >
                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Emploi du Temps</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handlePageChange('system')}
                  >
                    <ClipboardList className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Examens et Notes</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Activités Récentes</CardTitle>
                  <CardDescription>
                    Dernières actions effectuées dans le système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivities.map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="flex-shrink-0">
                            <ActivityIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {activity.message}
                            </p>
                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 mt-1">
                              <Badge className={getActivityColor(activity.type)}>
                                {activity.type === 'user_creation' ? 'Utilisateur' :
                                 activity.type === 'class_update' ? 'Classe' :
                                 activity.type === 'report_generated' ? 'Rapport' : 'Sécurité'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Par: {activity.user}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <SidebarContent />
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <School className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">DAARA</h1>
                  {user?.school?.name && (
                    <p className="text-xs text-blue-600 font-medium">
                      {user.school.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Admin Principal'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'admin@daara.com'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${getRoleColor(user?.role || 'admin')}`}>
                        {getRoleLabel(user?.role || 'admin')}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderActivePage()}
          </div>
        </main>
      </div>
    </div>
  );
}