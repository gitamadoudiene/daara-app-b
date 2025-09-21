'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  UserX,
  Download,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Étudiant' | 'Enseignant' | 'Parent' | 'Administrateur' | 'Super Utilisateur';
  school: string;
  schoolId: string;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  createdAt: string;
  lastLogin: string;
  class?: string;
  subject?: string;
  children?: number;
}

interface School {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  type: string;
  status: string;
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
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSuspendConfirmOpen, setIsSuspendConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Actif',
    schoolId: ''
  });
  
  // États pour les formulaires
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  
  // États pour les données de l'API
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [parents, setParents] = useState<{ id: string, name: string }[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredParents, setFilteredParents] = useState<{ id: string, name: string }[]>([]);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);
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
  
  // États pour le formulaire de parent
  const [parentForm, setParentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    schoolId: '',
    gender: '',
    status: 'Actif',
    profession: '',
    emergencyPhone: '',
    relation: ''
  });
  
  // États pour le formulaire d'étudiant
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    schoolId: '',
    classId: '',
    parentId: undefined as string | undefined,
    dateOfBirth: '',
    gender: '',
    status: 'Actif'
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
        setSchools(data);
      } catch (error) {
        console.error('Erreur lors du chargement des écoles:', error);
        setError('Impossible de charger la liste des écoles');
      }
    };
    
    fetchSchools();
  }, []);

  // Fonction pour récupérer les parents depuis l'API
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const token = localStorage.getItem('daara_token');
        if (!token) {
          console.warn('Aucun token trouvé pour récupérer les parents');
          return;
        }

        const response = await fetch('http://localhost:5000/api/users/parents', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des parents');
        }
        
        const data = await response.json();
        setParents(data.map((parent: any) => ({
          id: parent._id,
          name: parent.name
        })));
        
        // Initialiser la liste filtrée
        setFilteredParents(data.map((parent: any) => ({
          id: parent._id,
          name: parent.name
        })));
        
        console.log(`✅ ${data.length} parent(s) récupéré(s) depuis la BD`);
      } catch (error) {
        console.error('Erreur lors du chargement des parents:', error);
        setError('Impossible de charger la liste des parents');
        setParents([]);
      }
    };
    
    fetchParents();
  }, []);

  // Fonction pour rafraîchir la liste des parents
  const refreshParents = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/users/parents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const parentsData = data.map((parent: any) => ({
          id: parent._id,
          name: parent.name
        }));
        
        setParents(parentsData);
        setFilteredParents(parentsData);
        console.log(`✅ Liste des parents mise à jour: ${data.length} parent(s)`);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des parents:', error);
    }
  };

  // Fonction pour filtrer les parents selon la recherche
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

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-parent-search]')) {
        setShowParentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour rafraîchir la liste des utilisateurs
  const refreshUsers = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const mappedUsers = data.map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: mapRole(user.role),
          school: user.role === 'super_user' ? 'ACCÈS GLOBAL' : (user.schoolId?.name || 'Non assigné'),
          schoolId: user.schoolId?._id || '',
          status: user.status || 'Actif',
          createdAt: new Date(user.createdAt || Date.now()).toISOString().split('T')[0],
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : 'Jamais',
          subject: user.subjects?.join(', ') || '',
          class: user.class || '',
          children: Array.isArray(user.children) ? user.children.length : 0,
          gender: user.gender || ''
        }));
        
        setUsers(mappedUsers);
        console.log(`✅ Liste des utilisateurs mise à jour: ${mappedUsers.length} utilisateur(s)`);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des utilisateurs:', error);
    }
  };

  // Fonction pour récupérer les classes de l'école sélectionnée
  useEffect(() => {
    if (studentForm.schoolId || teacherForm.schoolId) {
      const fetchClasses = async () => {
        try {
          const schoolId = studentForm.schoolId || teacherForm.schoolId;
          console.log(`Tentative de récupération des classes pour l'école ID: ${schoolId}`);
          
          // Nettoyer l'ID d'école (supprimer les espaces éventuels)
          const cleanSchoolId = schoolId.trim();
          
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
  }, [teacherForm.schoolId, studentForm.schoolId]);

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
      
      // Vider les classes et matières sélectionnées quand on change d'école
      setSelectedClasses([]);
      setSelectedMatieres([]);
      
      // Charger les matières de la nouvelle école
      if (value) {
        const fetchSubjectsForSchool = async () => {
          try {
            const token = localStorage.getItem('daara_token');
            const response = await fetch(`http://localhost:5000/api/subjects/school/${value}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('Matières de l\'école récupérées:', data);
              setAvailableSubjects(data);
            } else {
              console.error('Erreur lors de la récupération des matières:', response.status);
              setAvailableSubjects([]);
            }
          } catch (err) {
            console.error('Erreur lors du chargement des matières:', err);
            setAvailableSubjects([]);
          }
        };
        
        fetchSubjectsForSchool();
        
        // Vérifier si l'ID a le bon format pour MongoDB
        const isValidObjectId = value.match(/^[0-9a-fA-F]{24}$/);
        if (!isValidObjectId) {
          console.warn('Format d\'ID d\'école potentiellement invalide:', value);
        }
      } else {
        // Vider les matières si aucune école n'est sélectionnée
        setAvailableSubjects([]);
      }
    }
    
    setTeacherForm({
      ...teacherForm,
      [name]: value
    });
  };

  // Les données des écoles viennent maintenant de l'API et sont stockées dans l'état schools

  // Fonction pour récupérer tous les utilisateurs de la BD
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('daara_token');
      if (!token) {
        console.warn('Aucun token trouvé pour récupérer les utilisateurs');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      
      const data = await response.json();
      
      // Mapper les données du backend vers le format du frontend
      const mappedUsers = data.map((user: any) => ({
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: mapRole(user.role),
        school: user.schoolId?.name || 'Non assigné',
        schoolId: user.schoolId?._id || '',
        status: user.status || 'Actif',
        createdAt: new Date(user.createdAt || Date.now()).toISOString().split('T')[0],
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : 'Jamais',
        subject: user.subjects?.join(', ') || '',
        class: user.class || '',
        children: Array.isArray(user.children) ? user.children.length : 0,
        gender: user.gender || ''
      }));
      
      setUsers(mappedUsers);
      console.log(`✅ ${mappedUsers.length} utilisateur(s) récupéré(s) depuis la BD`);
      
      // Debug: Afficher tous les rôles
      const roleStats = mappedUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 Statistiques des rôles:', roleStats);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError('Impossible de charger la liste des utilisateurs');
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fonction pour mapper les rôles du backend vers le frontend
  const mapRole = (role: string) => {
    switch (role) {
      case 'student': return 'Étudiant';
      case 'teacher': return 'Enseignant';
      case 'parent': return 'Parent';
      case 'admin': return 'Administrateur';
      case 'super_user': return 'Super Utilisateur';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Étudiant': return GraduationCap;
      case 'Enseignant': return BookOpen;
      case 'Parent': return UserCheck;
      case 'Administrateur': return Shield;
      case 'Super Utilisateur': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Étudiant': return 'bg-blue-100 text-blue-800';
      case 'Enseignant': return 'bg-green-100 text-green-800';
      case 'Parent': return 'bg-orange-100 text-orange-800';
      case 'Administrateur': return 'bg-purple-100 text-purple-800';
      case 'Super Utilisateur': return 'bg-red-100 text-red-800';
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
  
  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem('daara_token');
      
      if (!token) {
        throw new Error('Vous devez être connecté pour effectuer cette action');
      }
      
      const parentData = {
        name: parentForm.name,
        email: parentForm.email,
        phone: parentForm.phone,
        address: parentForm.address,
        schoolId: parentForm.schoolId,
        gender: parentForm.gender,
        status: parentForm.status
      };
      
      const response = await fetch('http://localhost:5000/api/users/parents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(parentData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(`Parent créé avec succès! Mot de passe temporaire: ${data.tempPassword}`);
        
        // Rafraîchir la liste des parents pour le formulaire étudiant
        await refreshParents();
        
        // Rafraîchir la liste des utilisateurs pour l'affichage
        await refreshUsers();
        
        // Réinitialiser le formulaire
        setParentForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          schoolId: '',
          gender: '',
          status: 'Actif',
          profession: '',
          emergencyPhone: '',
          relation: ''
        });
        
        // Fermer le dialog après un délai
        setTimeout(() => {
          setIsCreateParentOpen(false);
          setSuccessMessage(null);
        }, 3000);
        
      } else {
        throw new Error(data.message || 'Erreur lors de la création du parent');
      }
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du parent');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction de gérance d'édition d'utilisateur
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('✏️ Début de handleEditUser, utilisateur sélectionné:', selectedUser);
    console.log('📝 Données du formulaire:', editForm);
    
    if (!selectedUser) {
      console.error('❌ Aucun utilisateur sélectionné pour l\'édition');
      return;
    }

    setLoading(true);
    try {
      console.log('📡 Envoi de la requête PUT vers:', `http://localhost:5000/api/users/${selectedUser._id}`);
      
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          status: editForm.status,
          ...(editForm.schoolId && selectedUser.role !== 'Super Utilisateur' && { schoolId: editForm.schoolId })
        })
      });

      console.log('📡 Réponse PUT reçue:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }

      console.log('✅ Utilisateur modifié avec succès');
      setIsEditUserOpen(false);
      setSelectedUser(null);
      setEditForm({ name: '', email: '', phone: '', status: 'Actif', schoolId: '' });
      
      // Rafraîchir la liste des utilisateurs
      console.log('🔄 Rafraîchissement de la liste des utilisateurs...');
      await fetchUsers();
      
      alert('Utilisateur modifié avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async () => {
    console.log('🗑️ Début de handleDeleteUser, utilisateur sélectionné:', selectedUser);
    
    if (!selectedUser) {
      console.error('❌ Aucun utilisateur sélectionné pour la suppression');
      return;
    }

    setLoading(true);
    try {
      console.log('📡 Envoi de la requête DELETE vers:', `http://localhost:5000/api/users/${selectedUser._id}`);
      
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        }
      });

      console.log('📡 Réponse DELETE reçue:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      console.log('✅ Utilisateur supprimé avec succès');
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
      
      // Rafraîchir la liste des utilisateurs
      console.log('🔄 Rafraîchissement de la liste des utilisateurs...');
      await fetchUsers();
      
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour suspendre/réactiver un utilisateur
  const handleSuspendUser = async () => {
    console.log('⏸️ Début de handleSuspendUser, utilisateur sélectionné:', selectedUser);
    
    if (!selectedUser) {
      console.error('❌ Aucun utilisateur sélectionné pour la suspension');
      return;
    }

    const newStatus = selectedUser.status === 'Suspendu' ? 'Actif' : 'Suspendu';
    console.log('📝 Changement de statut:', selectedUser.status, '->', newStatus);
    
    setLoading(true);
    
    try {
      console.log('📡 Envoi de la requête PUT vers:', `http://localhost:5000/api/users/${selectedUser._id}`);
      
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      console.log('📡 Réponse PUT reçue:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du statut');
      }

      console.log('✅ Statut modifié avec succès');
      setIsSuspendConfirmOpen(false);
      setSelectedUser(null);
      
      // Rafraîchir la liste des utilisateurs
      console.log('🔄 Rafraîchissement de la liste des utilisateurs...');
      await fetchUsers();
      
      alert(`Utilisateur ${newStatus.toLowerCase()} avec succès`);
    } catch (error) {
      console.error('❌ Erreur lors de la modification du statut:', error);
      alert('Erreur lors de la modification du statut');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem('daara_token');
      
      if (!token) {
        throw new Error('Vous devez être connecté pour effectuer cette action');
      }
      
      const studentData = {
        name: studentForm.name,
        email: studentForm.email,
        phone: studentForm.phone,
        address: studentForm.address,
        schoolId: studentForm.schoolId,
        classId: studentForm.classId,
        parentId: studentForm.parentId || undefined,
        dateOfBirth: studentForm.dateOfBirth,
        gender: studentForm.gender,
        status: studentForm.status
      };
      
      const response = await fetch('http://localhost:5000/api/users/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(`Étudiant créé avec succès! Mot de passe temporaire: ${data.tempPassword}`);
        
        // Rafraîchir la liste des utilisateurs pour l'affichage
        await refreshUsers();
        
        // Réinitialiser le formulaire
        setStudentForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          schoolId: '',
          classId: '',
          parentId: undefined,
          dateOfBirth: '',
          gender: '',
          status: 'Actif'
        });
        
        // Réinitialiser la recherche de parent
        setParentSearchTerm('');
        setFilteredParents(parents);
        setShowParentDropdown(false);
        
        // Fermer le dialog après un délai
        setTimeout(() => {
          setIsCreateStudentOpen(false);
          setSuccessMessage(null);
        }, 3000);
        
      } else {
        throw new Error(data.message || 'Erreur lors de la création de l\'étudiant');
      }
      
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'étudiant:', err);
      setError(err.message || 'Erreur lors de la création de l\'étudiant');
    } finally {
      setLoading(false);
    }
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

  // Debug: Log des administrateurs
  const administrators = users.filter(u => u.role === 'Administrateur');
  console.log(`🔍 Debug administrateurs: ${administrators.length} trouvés`, administrators.map(a => ({ name: a.name, email: a.email, role: a.role })));

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
            <span className="sm:hidden">Ajouter Enseignant</span>
          </Button>

          <Button 
            className="w-full sm:w-auto"
            onClick={() => setIsCreateParentOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ajouter Parent</span>
            <span className="sm:hidden">Ajouter Parent</span>
          </Button>

          <Button 
            className="w-full sm:w-auto"
            onClick={() => setIsCreateStudentOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ajouter Étudiant</span>
            <span className="sm:hidden">Ajouter etudiant</span>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="students">Étudiants</TabsTrigger>
          <TabsTrigger value="teachers">Enseignants</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="admins">Administrateurs</TabsTrigger>
          <TabsTrigger value="superusers">Super Users</TabsTrigger>
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
                      <option key={school._id} value={school._id}>
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
                              {user.role === 'Parent' && (
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
                            onClick={() => {
                              setSelectedUser(user);
                              setEditForm({
                                name: user.name,
                                email: user.email,
                                phone: user.phone || '',
                                status: user.status,
                                schoolId: user.schoolId || ''
                              });
                              setIsEditUserOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  console.log('🔘 Clic sur Suspendre/Réactiver pour l\'utilisateur:', user);
                                  setSelectedUser(user);
                                  setIsSuspendConfirmOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                {user.status === 'Suspendu' ? 'Réactiver' : 'Suspendre'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  console.log('🔘 Clic sur Supprimer pour l\'utilisateur:', user);
                                  setSelectedUser(user);
                                  setIsDeleteConfirmOpen(true);
                                }}
                                className="cursor-pointer text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                {filteredUsers.filter(u => u.role === 'Administrateur').length} administrateur(s) dans le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.filter(u => u.role === 'Administrateur').map((user) => (
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

        <TabsContent value="superusers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-600" />
                <span>Super Utilisateurs</span>
              </CardTitle>
              <CardDescription>
                {users.filter(u => u.role === 'Super Utilisateur').length} super utilisateur(s) avec accès global
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => u.role === 'Super Utilisateur').map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-purple-50 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-red-600" />
                        <div>
                          <h3 className="font-semibold text-red-800">{user.name}</h3>
                          <p className="text-sm text-red-600 font-medium">🌟 {user.school} 🌟</p>
                          <p className="text-xs text-gray-600">Accès à toutes les écoles, tous les utilisateurs, toutes les données</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
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
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Nom Complet *</Label>
                <Input 
                  id="student-name" 
                  placeholder="Ex: Amadou Diallo" 
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-email">Email</Label>
                <Input 
                  id="student-email" 
                  type="email" 
                  placeholder="exemple@daara.sn" 
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">Optionnel - sera généré automatiquement si non fourni</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-phone">Téléphone *</Label>
                <Input 
                  id="student-phone" 
                  placeholder="+221 77 123 4567" 
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-dob">Date de Naissance</Label>
                <Input 
                  id="student-dob" 
                  type="date" 
                  value={studentForm.dateOfBirth}
                  onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-gender">Sexe *</Label>
                <Select value={studentForm.gender} onValueChange={(value) => setStudentForm({...studentForm, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le sexe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Féminin">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-school">École *</Label>
                <Select value={studentForm.schoolId} onValueChange={(value) => setStudentForm({...studentForm, schoolId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une école" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school._id} value={school._id}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-class">Classe *</Label>
                <Select value={studentForm.classId} onValueChange={(value) => setStudentForm({...studentForm, classId: value})}>
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
              <div className="space-y-2">
                <Label htmlFor="student-address">Adresse</Label>
                <Input 
                  id="student-address" 
                  placeholder="Adresse complète" 
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-parents">Parent(s)</Label>
                <div className="relative" data-parent-search>
                  <div className="flex">
                    <Input
                      id="student-parents"
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
                        variant="outline"
                        size="sm"
                        onClick={clearParentSelection}
                        className="ml-2 px-2"
                        title="Effacer la sélection"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  
                  {showParentDropdown && filteredParents.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                      {filteredParents.slice(0, 10).map((parent) => (
                        <div
                          key={parent.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleParentSelect(parent)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{parent.name}</span>
                            {studentForm.parentId === parent.id && (
                              <span className="text-xs text-green-600 font-medium">✓ Sélectionné</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredParents.length > 10 && (
                        <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
                          ... et {filteredParents.length - 10} autre(s). Continuez à taper pour affiner.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {showParentDropdown && filteredParents.length === 0 && parentSearchTerm && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Aucun parent trouvé pour &ldquo;{parentSearchTerm}&rdquo;
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {studentForm.parentId 
                    ? `Parent sélectionné • ${parents.length} parent(s) disponible(s)` 
                    : `Si le parent n'existe pas, ajoutez-le d'abord • ${parents.length} parent(s) disponible(s)`
                  }
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-status">Statut</Label>
                <Select value={studentForm.status} onValueChange={(value) => setStudentForm({...studentForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                    <SelectItem value="Suspendu">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Création...' : 'Créer Étudiant'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsCreateStudentOpen(false)} className="flex-1" disabled={loading}>
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
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleCreateParent} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent-name">Nom Complet *</Label>
                <Input 
                  id="parent-name" 
                  placeholder="Ex: Fatou Sow" 
                  value={parentForm.name}
                  onChange={(e) => setParentForm({...parentForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-email">Email *</Label>
                <Input 
                  id="parent-email" 
                  type="email" 
                  placeholder="exemple@daara.sn" 
                  value={parentForm.email}
                  onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-phone">Téléphone *</Label>
                <Input 
                  id="parent-phone" 
                  placeholder="+221 77 123 4567" 
                  value={parentForm.phone}
                  onChange={(e) => setParentForm({...parentForm, phone: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-profession">Profession</Label>
                <Input 
                  id="parent-profession" 
                  placeholder="Ex: Médecin" 
                  value={parentForm.profession}
                  onChange={(e) => setParentForm({...parentForm, profession: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-gender">Sexe *</Label>
                <Select value={parentForm.gender} onValueChange={(value) => setParentForm({...parentForm, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le sexe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Féminin">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="parent-address">Adresse</Label>
                <Input 
                  id="parent-address" 
                  placeholder="Adresse complète"
                  value={parentForm.address}
                  onChange={(e) => setParentForm({...parentForm, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-emergency">Téléphone d&apos;Urgence</Label>
                <Input 
                  id="parent-emergency" 
                  placeholder="+221 77 123 4567"
                  value={parentForm.emergencyPhone}
                  onChange={(e) => setParentForm({...parentForm, emergencyPhone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-school">École</Label>
                <Select value={parentForm.schoolId} onValueChange={(value) => setParentForm({...parentForm, schoolId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une école" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school._id} value={school._id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-relation">Relation avec l&apos;élève</Label>
                <Select value={parentForm.relation} onValueChange={(value) => setParentForm({...parentForm, relation: value})}>
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
              <div className="space-y-2">
                <Label htmlFor="parent-status">Statut</Label>
                <Select value={parentForm.status} onValueChange={(value) => setParentForm({...parentForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                    <SelectItem value="Suspendu">Suspendu</SelectItem>
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
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Création...' : 'Créer Parent'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsCreateParentOpen(false)} className="flex-1" disabled={loading}>
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
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>Matières enseignées</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {availableSubjects && availableSubjects.length > 0 ? (
                      availableSubjects.map((subject) => (
                        <label key={subject._id || subject.id || subject.name} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedMatieres.includes(subject.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMatieres([...selectedMatieres, subject.name]);
                              } else {
                                setSelectedMatieres(selectedMatieres.filter(m => m !== subject.name));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="truncate">{subject.name}</span>
                        </label>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        {teacherForm.schoolId 
                          ? 'Aucune matière disponible pour cette école'
                          : 'Sélectionnez d\'abord une école pour voir les matières disponibles'
                        }
                      </div>
                    )}
                  </div>
                  {selectedMatieres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedMatieres.map((matiere) => (
                        <span key={matiere} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {matiere}
                          <button
                            type="button"
                            onClick={() => setSelectedMatieres(selectedMatieres.filter(m => m !== matiere))}
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
                  Sélectionnez les matières que l&apos;enseignant va enseigner ({selectedMatieres.length} sélectionnée{selectedMatieres.length > 1 ? 's' : ''})
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

      {/* Dialog pour voir les détails d'un utilisateur */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Détails de l&apos;utilisateur</span>
            </DialogTitle>
            <DialogDescription>
              Informations détaillées de l&apos;utilisateur sélectionné
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nom complet</Label>
                  <p className="p-2 bg-gray-50 rounded-md">{selectedUser.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="p-2 bg-gray-50 rounded-md">{selectedUser.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="p-2 bg-gray-50 rounded-md">{selectedUser.phone || 'Non renseigné'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rôle</Label>
                  <div className="p-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">École</Label>
                  <p className="p-2 bg-gray-50 rounded-md">{selectedUser.school}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Statut</Label>
                  <div className="p-2">
                    <Badge variant="outline" className={getStatusColor(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informations spécifiques selon le rôle */}
              {selectedUser.role === 'Étudiant' && selectedUser.class && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Classe</Label>
                  <p className="p-2 bg-blue-50 rounded-md">{selectedUser.class}</p>
                </div>
              )}

              {selectedUser.role === 'Enseignant' && selectedUser.subject && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Matières enseignées</Label>
                  <p className="p-2 bg-green-50 rounded-md">{selectedUser.subject}</p>
                </div>
              )}

              {selectedUser.role === 'Parent' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nombre d&apos;enfants</Label>
                  <p className="p-2 bg-orange-50 rounded-md">{selectedUser.children} enfant(s)</p>
                </div>
              )}

              {/* Informations de création */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date de création</Label>
                  <p className="p-2 bg-gray-50 rounded-md">{new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Dernière connexion</Label>
                  <p className="p-2 bg-gray-50 rounded-md">{selectedUser.lastLogin}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier un utilisateur */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Modifier l&apos;utilisateur</span>
            </DialogTitle>
            <DialogDescription>
              Modifier les informations de l&apos;utilisateur sélectionné
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom complet *</Label>
                  <Input 
                    id="edit-name" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input 
                    id="edit-email" 
                    type="email" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input 
                    id="edit-phone" 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
                      <SelectItem value="Suspendu">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Champs spécifiques selon le rôle */}
              {selectedUser.role !== 'Super Utilisateur' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-school">École</Label>
                  <Select value={editForm.schoolId} onValueChange={(value) => setEditForm({...editForm, schoolId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une école" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school._id} value={school._id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Modification...' : 'Modifier'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation pour suppression */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-md sm:mx-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Confirmer la suppression</span>
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-md border border-red-200">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-600">{selectedUser.role} - {selectedUser.school}</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    console.log('🔘 Clic sur le bouton Supprimer dans le modal de confirmation');
                    handleDeleteUser();
                  }}
                  disabled={loading}
                >
                  {loading ? 'Suppression...' : 'Supprimer définitivement'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation pour suspension/réactivation */}
      <Dialog open={isSuspendConfirmOpen} onOpenChange={setIsSuspendConfirmOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-md sm:mx-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-orange-600">
              <UserX className="h-5 w-5" />
              <span>
                {selectedUser?.status === 'Suspendu' ? 'Réactiver l\'utilisateur' : 'Suspendre l\'utilisateur'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.status === 'Suspendu' 
                ? 'Êtes-vous sûr de vouloir réactiver cet utilisateur ? Il pourra de nouveau accéder au système.'
                : 'Êtes-vous sûr de vouloir suspendre cet utilisateur ? Il ne pourra plus accéder au système.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-md border border-orange-200">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-600">{selectedUser.role} - {selectedUser.school}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Statut actuel:</span>
                  <span className="text-sm font-medium">
                    {selectedUser.status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsSuspendConfirmOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  variant={selectedUser.status === 'Suspendu' ? 'default' : 'secondary'}
                  onClick={() => {
                    console.log('🔘 Clic sur le bouton Suspendre dans le modal de confirmation');
                    handleSuspendUser();
                  }}
                  disabled={loading}
                >
                  {loading 
                    ? (selectedUser.status === 'Suspendu' ? 'Réactivation...' : 'Suspension...')
                    : (selectedUser.status === 'Suspendu' ? 'Réactiver' : 'Suspendre')
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
