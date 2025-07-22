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
  Clock
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

  const [activeTab, setActiveTab] = useState('classes');
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="classes" className="text-xs sm:text-sm">Classes</TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs sm:text-sm">Matières</TabsTrigger>
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
    </div>
  );
}
