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

  // Fonction pour récupérer les classes de l'école sélectionnée
  useEffect(() => {
    if (teacherForm.schoolId) {
      const fetchClasses = async () => {
        try {
          console.log(`Tentative de récupération des classes pour l'école ID: ${teacherForm.schoolId}`);
          
          // Nettoyer l'ID d'école (supprimer les espaces éventuels)
          const cleanSchoolId = teacherForm.schoolId.trim();
          
          // Vérifier si l'ID est au bon format pour MongoDB ObjectId
          if (!cleanSchoolId.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('Format d\'ID d\'école invalide:', cleanSchoolId);
            // Au lieu de lever une erreur, essayons de continuer
            console.warn('Tentative de récupération des classes malgré un format d\'ID potentiellement incorrect');
          }
          
          // S'assurer que l'URL est correctement encodée
          const encodedSchoolId = encodeURIComponent(cleanSchoolId);
          const apiUrl = `http://localhost:5000/api/classes/school/${encodedSchoolId}`;
          console.log('URL API pour les classes:', apiUrl);
          
          // Récupérer le token directement
          let token = localStorage.getItem('daara_token');
          
          if (!token) {
            console.error('⚠️ ERREUR: Aucun token d\'authentification trouvé');
            throw new Error('Vous devez être connecté pour accéder à ces données. Veuillez vous reconnecter.');
          }
          
          // Nettoyer le token pour éviter les problèmes de formatage
          token = token.trim();
          console.log(`Token utilisé (début): ${token.substring(0, 15)}...`);
          
          // CONTOURNEMENT CRITIQUE: Tenter avec et sans le préfixe "Bearer" si nécessaire
          console.log('Tentative d\'appel API avec le préfixe Bearer...');
          try {
            // Premier essai avec le format "Bearer {token}"
            const response = await fetch(apiUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            
            // Log détaillé de la réponse pour le debugging
            console.log(`Réponse API classes: status=${response.status}, statusText=${response.statusText}`);
            
            if (response.ok) {
              // Réussite avec "Bearer" - traiter la réponse
              const data = await response.json();
              console.log(`Classes récupérées: ${data.length}`);
              setClasses(data.map((cls: any) => cls.name || 'Classe sans nom'));
              return; // Sortir de la fonction après succès
            } else if (response.status === 401) {
              console.warn('Échec avec le préfixe Bearer (401). Tentative sans préfixe...');
              
              // Second essai sans le préfixe "Bearer"
              const response2 = await fetch(apiUrl, {
                headers: {
                  'Authorization': token,
                  'Accept': 'application/json'
                }
              });
              
              console.log(`Seconde tentative: status=${response2.status}, statusText=${response2.statusText}`);
              
              if (response2.ok) {
                // Réussite sans "Bearer" - traiter la réponse
                const data = await response2.json();
                console.log(`Classes récupérées (2e tentative): ${data.length}`);
                setClasses(data.map((cls: any) => cls.name || 'Classe sans nom'));
                return; // Sortir de la fonction après succès
              } else {
                // Si les deux tentatives échouent, lancer une erreur avec plus de détails
                const errorData = await response2.json().catch(() => ({ message: response2.statusText }));
                throw new Error(`Erreur lors de la récupération des classes: ${response2.status} ${errorData.message || response2.statusText}`);
              }
            } else {
              // Autre erreur (pas 401) - lancer l'erreur normalement
              const errorData = await response.json().catch(() => ({ message: response.statusText }));
              throw new Error(`Erreur serveur: ${response.status} ${errorData.message || response.statusText}`);
            }
          } catch (error: any) {
            console.error('Erreur lors de l\'appel API:', error);
            setError(error.message || 'Impossible de charger la liste des classes');
            setClasses([]);
          }
          
          console.log('Statut de réponse API classes:', response.status);
          
          if (!response.ok) {
            if (response.status === 401) {
              console.error('Erreur d\'authentification (401)');
              throw new Error('Session expirée. Veuillez vous reconnecter.');
            } else if (response.status === 404) {
              console.error('Classes non trouvées pour cette école (404)');
              throw new Error('Aucune classe trouvée pour cette école');
            } else {
              const errorText = await response.text();
              console.error(`Erreur API (${response.status}):`, errorText);
              throw new Error(`Erreur serveur: ${response.status}`);
            }
          }
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Réponse non-JSON:', contentType);
            throw new Error('Format de réponse inattendu');
          }
          
          const data = await response.json();
          console.log('Données de classes récupérées - Brut:', data);
          
          // Fonction pour extraire les noms de classes de manière plus robuste
          const extractClassNames = (rawData: any): string[] => {
            // Cas 1: C'est déjà un tableau
            if (Array.isArray(rawData)) {
              console.log(`Format: tableau de ${rawData.length} éléments`);
              
              if (rawData.length === 0) {
                return [];
              }
              
              // Vérifier la structure du premier élément pour comprendre le format
              const sample = rawData[0];
              console.log('Premier élément:', sample);
              
              return rawData.map((item: any, index: number) => {
                if (typeof item === 'object' && item !== null && item.name) {
                  // Objet avec une propriété name
                  return item.name;
                } else if (typeof item === 'string') {
                  // Chaîne de caractères directe
                  return item;
                } else if (typeof item === 'object' && item !== null) {
                  // Objet sans propriété name
                  console.warn(`Élément #${index} sans propriété 'name':`, item);
                  return `Classe ${index + 1}`;
                } else {
                  // Autre type inattendu
                  console.warn(`Format inattendu pour l'élément #${index}:`, item);
                  return `Classe ${index + 1}`;
                }
              });
            }
            
            // Cas 2: C'est un objet qui peut contenir un tableau de classes
            if (typeof rawData === 'object' && rawData !== null) {
              console.log('Format: objet. Clés:', Object.keys(rawData));
              
              // Chercher des propriétés qui pourraient contenir un tableau de classes
              if (rawData.classes && Array.isArray(rawData.classes)) {
                return extractClassNames(rawData.classes);
              } else if (rawData.data && Array.isArray(rawData.data)) {
                return extractClassNames(rawData.data);
              } else if (rawData.items && Array.isArray(rawData.items)) {
                return extractClassNames(rawData.items);
              }
              
              // Si aucune propriété évidente, essayer de créer des noms à partir des clés
              const possibleClasses = Object.entries(rawData)
                .filter(([_, value]) => 
                  typeof value === 'object' && value !== null && 'name' in value
                )
                .map(([key, value]: [string, any]) => value.name || `Classe ${key}`);
              
              if (possibleClasses.length > 0) {
                return possibleClasses;
              }
              
              console.warn('Impossible d\'extraire des noms de classes de l\'objet:', rawData);
              return [];
            }
            
            // Cas 3: Autre format imprévu
            console.error('Format totalement imprévu:', typeof rawData, rawData);
            return [];
          };
          
          const classNames = extractClassNames(data);
          console.log('Noms de classes extraits:', classNames);
          setClasses(classNames);
          console.log('Classes définies:', classNames);
        } catch (error) {
          console.error('Erreur lors du chargement des classes:', error);
          setError('Impossible de charger la liste des classes');
          setClasses([]); // Réinitialiser les classes en cas d'erreur
        }
      };
      
      fetchClasses();
    } else {
      // Réinitialiser les classes si aucune école n'est sélectionnée
      setClasses([]);
    }
  }, [teacherForm.schoolId]);

  // Fonction pour récupérer toutes les matières disponibles
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('daara_token');
        
        // Vérifier si le token existe
        if (!token) {
          console.warn('Token d\'authentification manquant. Utilisation de la liste de matières par défaut.');
          throw new Error('Token d\'authentification manquant');
        }
        
        console.log('Tentative de récupération des matières avec token:', token.substring(0, 15) + '...');
        
        const response = await fetch('http://localhost:5000/api/classes/subjects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          // Récupérer les détails de l'erreur
          const errorDetails = await response.text();
          console.error(`Erreur API (${response.status}):`, errorDetails);
          
          if (response.status === 401) {
            // Problème d'authentification - le token pourrait être invalide ou expiré
            console.error('Problème d\'authentification. Le token pourrait être invalide ou expiré.');
            localStorage.removeItem('daara_token'); // Supprimer le token invalide
          }
          
          throw new Error(`Erreur lors de la récupération des matières (${response.status})`);
        }
        
        const data = await response.json();
        console.log('Matières récupérées avec succès:', data);
        setAvailableSubjects(data);
      } catch (error) {
        console.error('Erreur lors du chargement des matières:', error);
        // Si l'API échoue, utilisons une liste par défaut
        setAvailableSubjects([
          "Mathématiques",
          "Physique",
          "Chimie",
          "SVT",
          "Français",
          "Anglais",
          "Histoire-Géographie",
          "Philosophie",
          "Informatique",
          "Autre"
        ]);
      }
    };
    
    fetchSubjects();
  }, []);
  
  // Gérer les changements dans le formulaire d'enseignant
  const handleTeacherFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour schoolId
    if (name === 'schoolId') {
      console.log('Sélection d\'école:', value);
      
      // Vider les classes sélectionnées quand on change d'école
      setSelectedClasses([]);
      
      // Si on a sélectionné une école valide, on vérifie son format
      if (value) {
        // Vérifier si l'ID a le bon format pour MongoDB
        const isValidObjectId = value.match(/^[0-9a-fA-F]{24}$/);
        if (!isValidObjectId) {
          console.warn('Format d\'ID d\'école potentiellement invalide:', value);
        }
      }
    }
    
    setTeacherForm({
      ...teacherForm,
      [name]: value
    });
  };

  // Les données des écoles viennent maintenant de l'API et sont stockées dans l'état schools

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
  
  // Fonctions pour gérer les soumissions de formulaires
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique pour créer un utilisateur général
    console.log('Création d\'utilisateur');
    setIsCreateUserOpen(false);
  };
  
  const handleCreateParent = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique pour créer un parent
    console.log('Création de parent');
    setIsCreateParentOpen(false);
  };
  
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique pour créer un étudiant
    console.log('Création d\'étudiant');
    setIsCreateStudentOpen(false);
  };
  
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem('daara_token');
      
      if (!token) {
        throw new Error('Vous devez être connecté pour effectuer cette action');
      }
      
      const teacherData = {
        name: teacherForm.name,
        email: teacherForm.email,
        phone: teacherForm.phone,
        schoolId: teacherForm.schoolId,
        subjects: selectedMatieres,
        classes: selectedClasses,
        qualification: teacherForm.qualification,
        experience: teacherForm.experience
      };
      
      const response = await fetch('http://localhost:5000/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teacherData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'enseignant');
      }
      
      const data = await response.json();
      
      // Réinitialiser le formulaire
      setTeacherForm({
        name: '',
        email: '',
        phone: '',
        schoolId: '',
        qualification: '',
        experience: ''
      });
      setSelectedMatieres([]);
      setSelectedClasses([]);
      
      setSuccessMessage(`Enseignant créé avec succès! Un mot de passe temporaire a été généré: ${data.tempPassword}`);
      
      // Fermer le modal après 3 secondes
      setTimeout(() => {
        setIsCreateTeacherOpen(false);
        setSuccessMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

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
          <a 
            href="/login" 
            className="ml-2 underline font-semibold"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/login';
            }}
          >
            Se connecter
          </a>
        </div>
      )}
      
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
          
          <Button 
            className="w-full sm:w-auto"
            onClick={() => setIsCreateTeacherOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ajouter Enseignant</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>

          <Button 
            className="w-full sm:w-auto"
            onClick={() => setIsCreateParentOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ajouter Parent</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>

          <Button 
            className="w-full sm:w-auto"
            onClick={() => setIsCreateStudentOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ajouter Étudiant</span>
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
      
      {/* Formulaire d'ajout d'étudiant */}
      <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Ajouter un Nouvel Étudiant</DialogTitle>
            <DialogDescription className="text-sm">
              Créer un nouveau compte étudiant dans le système.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Nom Complet</Label>
                <Input id="student-name" placeholder="Ex: Amadou Diallo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-email">Email</Label>
                <Input id="student-email" type="email" placeholder="exemple@daara.sn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-phone">Téléphone</Label>
                <Input id="student-phone" placeholder="+221 77 123 4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-dob">Date de Naissance</Label>
                <Input id="student-dob" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-school">École</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une école" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-class">Classe</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(classe => (
                      <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="student-address">Adresse</Label>
                <Input id="student-address" placeholder="Adresse complète" />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="student-parents">Parent(s)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Associer un parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => user.role === 'Parent')
                      .map(parent => (
                        <SelectItem key={parent.id} value={parent.id}>{parent.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Si le parent n&apos;existe pas, ajoutez-le d&apos;abord
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" className="flex-1">Créer Étudiant</Button>
              <Button type="button" variant="outline" onClick={() => setIsCreateStudentOpen(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Formulaire d'ajout de parent */}
      <Dialog open={isCreateParentOpen} onOpenChange={setIsCreateParentOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Ajouter un Nouveau Parent</DialogTitle>
            <DialogDescription className="text-sm">
              Créer un nouveau compte parent dans le système.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateParent} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent-name">Nom Complet</Label>
                <Input id="parent-name" placeholder="Ex: Fatou Sow" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-email">Email</Label>
                <Input id="parent-email" type="email" placeholder="exemple@daara.sn" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-phone">Téléphone</Label>
                <Input id="parent-phone" placeholder="+221 77 123 4567" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-profession">Profession</Label>
                <Input id="parent-profession" placeholder="Ex: Médecin" />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="parent-address">Adresse</Label>
                <Input id="parent-address" placeholder="Adresse complète" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-emergency">Téléphone d&apos;Urgence</Label>
                <Input id="parent-emergency" placeholder="+221 77 123 4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-relation">Relation avec l&apos;élève</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">Père</SelectItem>
                    <SelectItem value="mother">Mère</SelectItem>
                    <SelectItem value="guardian">Tuteur</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="parent-children">Enfants</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Les enfants peuvent être associés après la création du compte parent.
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" className="flex-1">Créer Parent</Button>
              <Button type="button" variant="outline" onClick={() => setIsCreateParentOpen(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Formulaire d'ajout d'enseignant */}
      <Dialog open={isCreateTeacherOpen} onOpenChange={setIsCreateTeacherOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Ajouter un Nouvel Enseignant</DialogTitle>
            <DialogDescription className="text-sm">
              Créer un nouveau compte enseignant dans le système.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Erreur:</strong> {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <strong>Succès:</strong> {successMessage}
            </div>
          )}
          
          <form onSubmit={handleCreateTeacher} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom Complet</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={teacherForm.name}
                  onChange={handleTeacherFormChange}
                  placeholder="Ex: Cheikh Diop" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={teacherForm.email}
                  onChange={handleTeacherFormChange}
                  placeholder="exemple@daara.sn" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={teacherForm.phone}
                  onChange={handleTeacherFormChange}
                  placeholder="+221 77 123 4567" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolId">École</Label>
                <select 
                  id="schoolId" 
                  name="schoolId"
                  value={teacherForm.schoolId}
                  onChange={handleTeacherFormChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Sélectionner une école</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>Matières enseignées</Label>
                <MatiereTagsInput 
                  value={selectedMatieres} 
                  onChange={setSelectedMatieres}
                  matieres={availableSubjects}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ajoutez les matières que l&apos;enseignant va enseigner
                </p>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>Classes enseignées</Label>
                {/* Error message moved to ClasseTagsInput component */}
                <ClasseTagsInput 
                  options={classes || []}
                  value={selectedClasses} 
                  onChange={setSelectedClasses}
                  error={error && error.includes('classes') ? error : undefined}
                  onRetry={() => {
                    setError(null);
                    if (teacherForm.schoolId) {
                      // Recharger les classes
                      const fetchClasses = async () => {
                        try {
                          const token = localStorage.getItem('daara_token');
                          const response = await fetch(`http://localhost:5000/api/classes/school/${teacherForm.schoolId}`, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          
                          if (!response.ok) {
                            throw new Error('Erreur lors de la récupération des classes');
                          }
                          
                          const data = await response.json();
                          if (Array.isArray(data)) {
                            const extractedClasses = data.map(cls => 
                              typeof cls === 'object' && cls !== null && cls.name ? cls.name : 
                              typeof cls === 'string' ? cls : null
                            ).filter(Boolean);
                            setClasses(extractedClasses);
                            console.log('Classes rechargées avec succès:', extractedClasses);
                          } else {
                            throw new Error('Format de données inattendu');
                          }
                        } catch (err) {
                          console.error('Erreur lors du rechargement des classes:', err);
                          setError('Impossible de charger la liste des classes. Veuillez réessayer.');
                        }
                      };
                      
                      fetchClasses();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez les classes où l&apos;enseignant va enseigner
                </p>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="qualification">Qualifications</Label>
                <Input 
                  id="qualification" 
                  name="qualification"
                  value={teacherForm.qualification}
                  onChange={handleTeacherFormChange}
                  placeholder="Ex: Doctorat en Mathématiques" 
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="experience">Expérience</Label>
                <Input 
                  id="experience" 
                  name="experience"
                  value={teacherForm.experience}
                  onChange={handleTeacherFormChange}
                  placeholder="Ex: 10 ans d'enseignement" 
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Création en cours...' : 'Créer Enseignant'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCreateTeacherOpen(false);
                  setError(null);
                  setSuccessMessage(null);
                }} 
                className="flex-1"
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Formulaire général (celui du code fourni) */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto hidden">
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
  );
}
