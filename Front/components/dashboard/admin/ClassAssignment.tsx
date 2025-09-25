'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users,
  Search,
  UserPlus,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Student {
  _id: string;
  name: string;
  email: string;
  schoolId?: string;
  classId?: string;
  class?: string; // Garder pour la compatibilité
  status: string;
}

interface Class {
  _id: string;
  id: string; // Pour la compatibilité
  name: string;
  level: string;
  students?: string[];
  capacity?: number;
  enrolled?: number;
  teacherIds?: string[];
  subjects?: string[];
  room?: string;
  status?: string;
}

export function ClassAssignment() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les données
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/users/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrer les étudiants de l'école de l'admin
        const schoolStudents = data.filter((student: Student) => student.schoolId === user?.schoolId);
        setStudents(schoolStudents);
        
        // Séparer les étudiants non assignés
        const unassigned = schoolStudents.filter((student: Student) => !student.classId);
        setUnassignedStudents(unassigned);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      toast.error('Erreur lors du chargement des étudiants');
    }
  };

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
          _id: cls._id, // Garder l'ID original pour la compatibilité
          name: cls.name,
          level: cls.level,
          capacity: cls.capacity || 40,
          enrolled: cls.studentCount || 0,
          room: cls.room || 'Salle à définir',
          teacherIds: cls.teacherIds || [],
          subjects: cls.subjects || [],
          studentCount: cls.studentCount || 0
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      toast.error('Erreur lors du chargement des classes');
    }
  };

  useEffect(() => {
    if (user?.schoolId) {
      fetchStudents();
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.schoolId]);

  const assignStudentToClass = async (studentId: string, className: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('daara_token');
      
      // Mettre à jour l'étudiant avec sa nouvelle classe
      const response = await fetch(`http://localhost:5000/api/users/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: className // Utilisation de classId au lieu de class
        })
      });

      if (response.ok) {
        toast.success(`Étudiant assigné à la classe ${className}`);
        // Rafraîchir les données
        fetchStudents();
        fetchClasses();
      } else {
        throw new Error('Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'assignation de l\'étudiant');
    } finally {
      setLoading(false);
    }
  };

  const removeStudentFromClass = async (studentId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('daara_token');
      
      const response = await fetch(`http://localhost:5000/api/users/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: null // Utilisation de classId au lieu de class
        })
      });

      if (response.ok) {
        toast.success('Étudiant retiré de sa classe');
        fetchStudents();
        fetchClasses();
      } else {
        throw new Error('Erreur lors du retrait');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du retrait de l\'étudiant');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentsInClass = (className: string) => {
    return students.filter(student => student.classId === className);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Affectation des Classes</h2>
          <p className="text-muted-foreground">
            Gérez l&apos;affectation des étudiants aux classes de {user?.school?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="mr-1 h-3 w-3" />
            {students.length} étudiants
          </Badge>
          <Badge variant="secondary">
            <BookOpen className="mr-1 h-3 w-3" />
            {classes.length} classes
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="unassigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unassigned">
            Étudiants non assignés ({unassignedStudents.length})
          </TabsTrigger>
          <TabsTrigger value="classes">
            Par Classes ({classes.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Tous les étudiants ({students.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Étudiants non assignés
              </CardTitle>
              <CardDescription>
                Ces étudiants n&apos;ont pas encore été assignés à une classe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un étudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <div className="grid gap-4">
                  {unassignedStudents
                    .filter(student => 
                      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((student) => (
                      <div key={student._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select onValueChange={(className) => assignStudentToClass(student._id, className)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Choisir une classe" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls._id} value={cls.name}>
                                  {cls.name} - {cls.level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                </div>

                {unassignedStudents.filter(student => 
                  student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.email.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Tous les étudiants sont assignés à des classes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="grid gap-4">
            {classes.map((cls) => {
              const studentsInClass = getStudentsInClass(cls.name);
              return (
                <Card key={cls._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        {cls.name} - {cls.level}
                      </div>
                      <Badge variant="outline">
                        {studentsInClass.length} étudiants
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {studentsInClass.map((student) => (
                        <div key={student._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <h5 className="font-medium">{student.name}</h5>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeStudentFromClass(student._id)}
                            disabled={loading}
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Retirer
                          </Button>
                        </div>
                      ))}
                      {studentsInClass.length === 0 && (
                        <p className="text-center py-4 text-muted-foreground">
                          Aucun étudiant assigné à cette classe
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tous les étudiants</CardTitle>
              <CardDescription>
                Vue d&apos;ensemble de tous les étudiants avec leur statut d&apos;affectation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un étudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <div className="grid gap-2">
                  {filteredStudents.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h5 className="font-medium">{student.name}</h5>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                          {student.class ? (
                            <Badge variant="default" className="flex items-center">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              {student.class}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center">
                              <XCircle className="mr-1 h-3 w-3" />
                              Non assigné
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {student.class ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeStudentFromClass(student._id)}
                            disabled={loading}
                          >
                            Retirer de la classe
                          </Button>
                        ) : (
                          <Select onValueChange={(className) => assignStudentToClass(student._id, className)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assigner à une classe" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls._id} value={cls.name}>
                                  {cls.name} - {cls.level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}