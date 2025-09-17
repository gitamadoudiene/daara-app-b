'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { toast } from 'sonner';

interface Class {
  id: string;
  name: string;
  level: string;
  capacity: number;
  enrolled: number;
  teacher: string;
  room: string;
  schedule: string;
  subject: string;
  status: 'Actif' | 'Inactif' | 'Complet';
  createdAt: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  hours: number;
  teacher: string;
  classes: string[];
  status: 'Actif' | 'Inactif';
}

interface Student {
  id: string;
  name: string;
  email: string;
  classId?: string;
  className?: string;
  level: string;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  enrollmentDate: string;
}

interface ClassAssignment {
  classId: string;
  className: string;
  level: string;
  capacity: number;
  enrolled: number;
  students: Student[];
  availableSpots: number;
}

export function SchoolStructure() {
  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      name: '6ème A',
      level: '6ème',
      capacity: 40,
      enrolled: 35,
      teacher: 'Amadou Diallo',
      room: 'Salle 101',
      schedule: 'Lun-Ven 8h-12h',
      subject: 'Mathématiques',
      status: 'Actif',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: '6ème B',
      level: '6ème',
      capacity: 40,
      enrolled: 40,
      teacher: 'Fatou Ba',
      room: 'Salle 102',
      schedule: 'Lun-Ven 14h-18h',
      subject: 'Français',
      status: 'Complet',
      createdAt: '2024-01-20'
    },
    {
      id: '3',
      name: '5ème A',
      level: '5ème',
      capacity: 35,
      enrolled: 28,
      teacher: 'Ousmane Seck',
      room: 'Salle 201',
      schedule: 'Lun-Ven 8h-12h',
      subject: 'Sciences',
      status: 'Actif',
      createdAt: '2024-02-01'
    },
    {
      id: '4',
      name: '4ème A',
      level: '4ème',
      capacity: 30,
      enrolled: 25,
      teacher: 'Aissatou Ndiaye',
      room: 'Salle 301',
      schedule: 'Lun-Ven 14h-18h',
      subject: 'Histoire-Géo',
      status: 'Actif',
      createdAt: '2024-02-15'
    }
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Mathématiques',
      code: 'MATH',
      description: 'Enseignement des mathématiques fondamentales',
      hours: 6,
      teacher: 'Amadou Diallo',
      classes: ['6ème A', '6ème B', '5ème A'],
      status: 'Actif'
    },
    {
      id: '2',
      name: 'Français',
      code: 'FR',
      description: 'Langue française et littérature',
      hours: 5,
      teacher: 'Fatou Ba',
      classes: ['6ème A', '6ème B'],
      status: 'Actif'
    },
    {
      id: '3',
      name: 'Sciences Naturelles',
      code: 'SVT',
      description: 'Sciences de la vie et de la terre',
      hours: 4,
      teacher: 'Ousmane Seck',
      classes: ['5ème A', '4ème A'],
      status: 'Actif'
    },
    {
      id: '4',
      name: 'Histoire-Géographie',
      code: 'HG',
      description: 'Histoire et géographie du Sénégal et du monde',
      hours: 3,
      teacher: 'Aissatou Ndiaye',
      classes: ['4ème A', '3ème A'],
      status: 'Actif'
    }
  ]);

  const [activeTab, setActiveTab] = useState('assignments');
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour les affectations
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<string>('');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Récupérer les étudiants non assignés
  const fetchUnassignedStudents = async () => {
    try {
      console.log('🔍 fetchUnassignedStudents: Début de la récupération');
      
      const token = localStorage.getItem('daara_token');
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'AUCUN TOKEN');
      
      if (!token) {
        console.warn('❌ Aucun token trouvé');
        return;
      }

      const userInfo = JSON.parse(localStorage.getItem('daara_user') || '{}');
      console.log('👤 UserInfo:', userInfo);
      
      const schoolId = userInfo.schoolId;
      console.log('🏫 School ID:', schoolId);

      if (!schoolId) {
        console.warn('❌ Aucun schoolId trouvé');
        return;
      }

      const url = `/api/users/students/unassigned/${schoolId}`;
      console.log('🌐 URL API:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Données reçues:', data);
        console.log('📊 Nombre d\'étudiants:', data.length);
        
        const mappedStudents = data.map((student: any) => ({
          id: student._id,
          name: student.name,
          email: student.email,
          level: student.level || 'Non défini',
          status: 'Actif',
          enrollmentDate: new Date(student.createdAt).toLocaleDateString('fr-FR')
        }));
        
        console.log('✅ Étudiants mappés:', mappedStudents);
        setUnassignedStudents(mappedStudents);
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des étudiants non assignés:', error);
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Classe créée avec succès !');
    setIsCreateClassOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Matière créée avec succès !');
    setIsCreateSubjectOpen(false);
  };

  // Fonctions de gestion des affectations
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0 || !selectedClassForAssignment) {
      toast.error('Veuillez sélectionner des élèves et une classe');
      return;
    }

    try {
      const token = localStorage.getItem('daara_token');
      if (!token) {
        toast.error('Token d\'authentification manquant');
        return;
      }

      const response = await fetch('/api/users/students/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
          classId: selectedClassForAssignment
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mettre à jour l'état local
        setUnassignedStudents(prev => 
          prev.filter(student => !selectedStudents.includes(student.id))
        );

        // Mettre à jour le nombre d'inscrits dans les classes
        setClasses(prev => prev.map(c => 
          c.id === selectedClassForAssignment 
            ? { ...c, enrolled: c.enrolled + selectedStudents.length }
            : c
        ));

        setSelectedStudents([]);
        setSelectedClassForAssignment('');
        setIsAssignmentModalOpen(false);
        
        toast.success(`${selectedStudents.length} élève(s) affecté(s) avec succès`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de l\'affectation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      toast.error('Erreur lors de l\'affectation des élèves');
    }
  };

  // Retirer un élève d'une classe
  const handleRemoveStudentFromClass = async (studentId: string, classId: string) => {
    try {
      const token = localStorage.getItem('daara_token');
      if (!token) {
        toast.error('Token d\'authentification manquant');
        return;
      }

      const response = await fetch(`/api/users/students/${studentId}/class`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ classId })
      });

      if (response.ok) {
        // Mettre à jour le nombre d'inscrits dans les classes
        setClasses(prev => prev.map(c => 
          c.id === classId 
            ? { ...c, enrolled: Math.max(0, c.enrolled - 1) }
            : c
        ));

        // Recharger les étudiants non assignés
        fetchUnassignedStudents();
        
        toast.success('Élève retiré de la classe avec succès');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors du retrait');
      }
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      toast.error('Erreur lors du retrait de l\'élève');
    }
  };

  const getAvailableClasses = () => {
    return classes.filter(c => c.enrolled < c.capacity);
  };

  // Effect pour charger les étudiants non assignés au montage du composant
  useEffect(() => {
    console.log('🚀 useEffect: Composant monté, appel de fetchUnassignedStudents');
    
    // Vérifier le localStorage
    const token = localStorage.getItem('daara_token');
    const userInfo = localStorage.getItem('daara_user');
    console.log('📱 localStorage token:', token ? 'PRÉSENT' : 'ABSENT');
    console.log('📱 localStorage userInfo:', userInfo ? JSON.parse(userInfo) : 'ABSENT');
    
    fetchUnassignedStudents();
  }, []);

  const handleViewDetails = (item: Class | Subject) => {
    if ('capacity' in item) {
      setSelectedClass(item as Class);
      setSelectedSubject(null);
    } else {
      setSelectedSubject(item as Subject);
      setSelectedClass(null);
    }
    setIsViewDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'Inactif': return 'bg-gray-100 text-gray-800';
      case 'Complet': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = subjects.filter(subj => 
    subj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subj.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, cls) => sum + cls.enrolled, 0);
  const totalCapacity = classes.reduce((sum, cls) => sum + cls.capacity, 0);
  const totalSubjects = subjects.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Structure Scolaire</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les classes, matières et organisation de votre établissement
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Classes ouvertes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Étudiants Inscrits</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Sur {totalCapacity} places
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Taux d&apos;Occupation</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{Math.round((totalStudents / totalCapacity) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Capacité utilisée
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Matières</CardTitle>
            <Building2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Matières enseignées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl">Gestion de la Structure</CardTitle>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Créer Classe</span>
                    <span className="sm:hidden">Classe</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Créer une Nouvelle Classe</DialogTitle>
                    <DialogDescription className="text-sm">
                      Ajouter une nouvelle classe à votre établissement.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateClass} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class-name">Nom de la Classe</Label>
                        <Input id="class-name" placeholder="Ex: 6ème A" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-level">Niveau</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le niveau" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6eme">6ème</SelectItem>
                            <SelectItem value="5eme">5ème</SelectItem>
                            <SelectItem value="4eme">4ème</SelectItem>
                            <SelectItem value="3eme">3ème</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-capacity">Capacité</Label>
                        <Input id="class-capacity" type="number" placeholder="40" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-teacher">Enseignant Principal</Label>
                        <Input id="class-teacher" placeholder="Nom de l'enseignant" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-room">Salle</Label>
                        <Input id="class-room" placeholder="Ex: Salle 101" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class-schedule">Horaires</Label>
                        <Input id="class-schedule" placeholder="Ex: Lun-Ven 8h-12h" required />
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

              <Dialog open={isCreateSubjectOpen} onOpenChange={setIsCreateSubjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Créer Matière</span>
                    <span className="sm:hidden">Matière</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Créer une Nouvelle Matière</DialogTitle>
                    <DialogDescription className="text-sm">
                      Ajouter une nouvelle matière d&apos;enseignement.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubject} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject-name">Nom de la Matière</Label>
                        <Input id="subject-name" placeholder="Ex: Mathématiques" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject-code">Code</Label>
                        <Input id="subject-code" placeholder="Ex: MATH" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject-hours">Heures par Semaine</Label>
                        <Input id="subject-hours" type="number" placeholder="6" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject-teacher">Enseignant Responsable</Label>
                        <Input id="subject-teacher" placeholder="Nom de l'enseignant" required />
                      </div>
                      <div className="lg:col-span-2 space-y-2">
                        <Label htmlFor="subject-description">Description</Label>
                        <Input id="subject-description" placeholder="Description de la matière" />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button type="submit" className="flex-1">Créer Matière</Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateSubjectOpen(false)} className="flex-1">
                        Annuler
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="classes" className="text-xs sm:text-sm">Classes</TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs sm:text-sm">Matières</TabsTrigger>
              <TabsTrigger value="assignments" className="text-xs sm:text-sm">Affectations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="classes" className="space-y-4">
              <div className="space-y-4">
                {filteredClasses.map((classItem) => (
                  <div key={classItem.id} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-3">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            <h3 className="text-lg sm:text-xl font-semibold">{classItem.name}</h3>
                          </div>
                          <Badge className={getStatusColor(classItem.status)}>
                            {classItem.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <UserCheck className="h-4 w-4 flex-shrink-0" />
                              <span>Enseignant: {classItem.teacher}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 flex-shrink-0" />
                              <span>Salle: {classItem.room}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>Horaires: {classItem.schedule}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>Inscrits: {classItem.enrolled}/{classItem.capacity}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4 flex-shrink-0" />
                              <span>Matière: {classItem.subject}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>Créée: {new Date(classItem.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(classItem)}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Détails
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-4">
              <div className="space-y-4">
                {filteredSubjects.map((subject) => (
                  <div key={subject.id} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-3">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                            <h3 className="text-lg sm:text-xl font-semibold">{subject.name}</h3>
                            <Badge variant="outline">{subject.code}</Badge>
                          </div>
                          <Badge className={getStatusColor(subject.status)}>
                            {subject.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <UserCheck className="h-4 w-4 flex-shrink-0" />
                              <span>Enseignant: {subject.teacher}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>Heures/semaine: {subject.hours}h</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 flex-shrink-0" />
                              <span>Classes: {subject.classes.length}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="break-words">{subject.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {subject.classes.map((className, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {className}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(subject)}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Détails
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              {/* En-tête avec statistiques */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Élèves non assignés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{unassignedStudents.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Classes disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{getAvailableClasses().length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Places disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {classes.reduce((total, c) => total + (c.capacity - c.enrolled), 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bouton d'affectation */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  onClick={() => setIsAssignmentModalOpen(true)}
                  disabled={unassignedStudents.length === 0}
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Affecter des élèves</span>
                </Button>
              </div>

              {/* Vue d'ensemble des classes avec leurs élèves */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Classes et leurs élèves</h3>
                {classes.map((classItem) => (
                  <Card key={classItem.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{classItem.name}</h4>
                          <p className="text-sm text-muted-foreground">{classItem.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={classItem.status === 'Complet' ? 'destructive' : 'secondary'}>
                          {classItem.enrolled}/{classItem.capacity} places
                        </Badge>
                        <Badge className={classItem.status === 'Complet' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {classItem.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Barre de progression de capacité */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (classItem.enrolled / classItem.capacity) >= 1 ? 'bg-red-500' :
                          (classItem.enrolled / classItem.capacity) >= 0.8 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((classItem.enrolled / classItem.capacity) * 100, 100)}%` }}
                      ></div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Enseignant: {classItem.teacher} • Salle: {classItem.room}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Liste des élèves non assignés */}
              {unassignedStudents.length > 0 && (
                <Card className="p-4">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      <span>Élèves non assignés ({unassignedStudents.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-2">
                    {unassignedStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="h-4 w-4 text-gray-600" />
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email} • {student.level}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-orange-100 text-orange-800">{student.status}</Badge>
                          <div className="text-xs text-muted-foreground">
                            Inscrit le {new Date(student.enrollmentDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedClass ? `Détails de la Classe: ${selectedClass.name}` : 
               selectedSubject ? `Détails de la Matière: ${selectedSubject.name}` : ''}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Informations détaillées
            </DialogDescription>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label>Nom de la Classe</Label>
                  <p className="font-medium">{selectedClass.name}</p>
                </div>
                <div>
                  <Label>Niveau</Label>
                  <p className="font-medium">{selectedClass.level}</p>
                </div>
                <div>
                  <Label>Capacité</Label>
                  <p className="font-medium">{selectedClass.capacity} étudiants</p>
                </div>
                <div>
                  <Label>Inscrits</Label>
                  <p className="font-medium">{selectedClass.enrolled} étudiants</p>
                </div>
                <div>
                  <Label>Enseignant Principal</Label>
                  <p className="font-medium">{selectedClass.teacher}</p>
                </div>
                <div>
                  <Label>Salle</Label>
                  <p className="font-medium">{selectedClass.room}</p>
                </div>
                <div>
                  <Label>Horaires</Label>
                  <p className="font-medium">{selectedClass.schedule}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={getStatusColor(selectedClass.status)}>
                    {selectedClass.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {selectedSubject && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label>Nom de la Matière</Label>
                  <p className="font-medium">{selectedSubject.name}</p>
                </div>
                <div>
                  <Label>Code</Label>
                  <p className="font-medium">{selectedSubject.code}</p>
                </div>
                <div>
                  <Label>Heures par Semaine</Label>
                  <p className="font-medium">{selectedSubject.hours}h</p>
                </div>
                <div>
                  <Label>Enseignant Responsable</Label>
                  <p className="font-medium">{selectedSubject.teacher}</p>
                </div>
                <div className="lg:col-span-2">
                  <Label>Description</Label>
                  <p className="font-medium">{selectedSubject.description}</p>
                </div>
                <div className="lg:col-span-2">
                  <Label>Classes Assignées</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSubject.classes.map((className, index) => (
                      <Badge key={index} variant="secondary">
                        {className}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={getStatusColor(selectedSubject.status)}>
                    {selectedSubject.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'affectation des élèves */}
      <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-4xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Affecter des élèves à une classe
            </DialogTitle>
            <DialogDescription className="text-sm">
              Sélectionnez les élèves à affecter et choisissez une classe de destination
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Liste des élèves non assignés */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Élèves disponibles ({unassignedStudents.length})</span>
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
                {unassignedStudents.map((student) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStudents.includes(student.id) 
                        ? 'bg-blue-50 border-blue-200 border' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => handleStudentSelection(student.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                      className="rounded"
                    />
                    <GraduationCap className="h-4 w-4 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.level} • {student.email}</div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">{student.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {selectedStudents.length} élève(s) sélectionné(s)
              </div>
            </div>

            {/* Sélection de classe */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Classes disponibles</span>
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getAvailableClasses().map((classItem) => (
                  <div 
                    key={classItem.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedClassForAssignment === classItem.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedClassForAssignment(classItem.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="selectedClass"
                          checked={selectedClassForAssignment === classItem.id}
                          onChange={() => setSelectedClassForAssignment(classItem.id)}
                        />
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{classItem.name}</div>
                          <div className="text-sm text-muted-foreground">{classItem.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {classItem.enrolled}/{classItem.capacity}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {classItem.capacity - classItem.enrolled} places libres
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all"
                          style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Enseignant: {classItem.teacher} • Salle: {classItem.room}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedStudents.length > 0 && selectedClassForAssignment && (
                <>Prêt à affecter {selectedStudents.length} élève(s)</>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignmentModalOpen(false);
                  setSelectedStudents([]);
                  setSelectedClassForAssignment('');
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAssignStudents}
                disabled={selectedStudents.length === 0 || !selectedClassForAssignment}
                className="flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Affecter les élèves</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
