'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  Clock,
  BookOpen,
  User,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface TimeSlot {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  classroom?: string;
}

interface Schedule {
  _id: string;
  className: string;
  day: string;
  timeSlots: TimeSlot[];
}

interface Class {
  _id: string;
  name: string;
  level: string;
}

interface Teacher {
  _id: string;
  name: string;
  subjects: string[];
}

export function ScheduleManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    className: '',
    day: '',
    time: '',
    subject: '',
    teacher: '',
    classroom: ''
  });

  const daysOfWeek = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  const timeSlots = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
  ];

  const subjects = [
    'Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie', 
    'Anglais', 'Arts', 'Éducation Physique', 'Informatique'
  ];

  // Charger les données
  useEffect(() => {
    if (user?.schoolId) {
      fetchClasses();
      fetchTeachers();
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.schoolId]);

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
        setClasses(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/users/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrer les enseignants de l'école
        const schoolTeachers = data.filter((teacher: any) => teacher.schoolId === user?.schoolId);
        setTeachers(schoolTeachers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
    }
  };

  const fetchSchedules = async () => {
    // Pour l'instant, on utilise des données mock
    // Dans une vraie application, on ferait un appel API
    setSchedules([]);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Simuler la création d'emploi du temps
      const newSchedule = {
        id: Date.now().toString(),
        className: scheduleForm.className,
        day: scheduleForm.day,
        time: scheduleForm.time,
        subject: scheduleForm.subject,
        teacher: scheduleForm.teacher,
        classroom: scheduleForm.classroom
      };

      toast.success('Créneau ajouté à l\'emploi du temps');
      setIsCreateScheduleOpen(false);
      
      // Reset form
      setScheduleForm({
        className: '',
        day: '',
        time: '',
        subject: '',
        teacher: '',
        classroom: ''
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du créneau');
    } finally {
      setLoading(false);
    }
  };

  const getScheduleForClass = (className: string) => {
    return schedules.filter(schedule => schedule.className === className);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Emplois du Temps</h2>
          <p className="text-muted-foreground">
            Gérez les emplois du temps des classes de {user?.school?.name}
          </p>
        </div>
        <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un créneau
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un créneau</DialogTitle>
              <DialogDescription>
                Définissez un nouveau créneau dans l&apos;emploi du temps
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-class">Classe</Label>
                  <Select 
                    value={scheduleForm.className} 
                    onValueChange={(value) => setScheduleForm({...scheduleForm, className: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
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
                <div className="space-y-2">
                  <Label htmlFor="schedule-day">Jour</Label>
                  <Select 
                    value={scheduleForm.day} 
                    onValueChange={(value) => setScheduleForm({...scheduleForm, day: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un jour" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Horaire</Label>
                  <Select 
                    value={scheduleForm.time} 
                    onValueChange={(value) => setScheduleForm({...scheduleForm, time: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un horaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-subject">Matière</Label>
                  <Select 
                    value={scheduleForm.subject} 
                    onValueChange={(value) => setScheduleForm({...scheduleForm, subject: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-teacher">Enseignant</Label>
                  <Select 
                    value={scheduleForm.teacher} 
                    onValueChange={(value) => setScheduleForm({...scheduleForm, teacher: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher._id} value={teacher.name}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-classroom">Salle (optionnel)</Label>
                  <Input
                    id="schedule-classroom"
                    value={scheduleForm.classroom}
                    onChange={(e) => setScheduleForm({...scheduleForm, classroom: e.target.value})}
                    placeholder="Ex: Salle A1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateScheduleOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  Créer le créneau
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="by-class">
            Par classe
          </TabsTrigger>
          <TabsTrigger value="by-teacher">
            Par enseignant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Emplois du temps cette semaine
                </CardTitle>
                <CardDescription>
                  Vue générale des cours programmés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aucun emploi du temps configuré</p>
                  <p className="text-sm">Commencez par ajouter des créneaux pour vos classes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-class" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Emplois du temps par classe</CardTitle>
                <CardDescription>
                  Sélectionnez une classe pour voir son emploi du temps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="max-w-sm">
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

                  {selectedClass && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Emploi du temps - {selectedClass}
                      </h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Aucun cours programmé pour cette classe</p>
                        <p className="text-sm">Ajoutez des créneaux pour construire l&apos;emploi du temps</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-teacher" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Emplois du temps par enseignant</CardTitle>
                <CardDescription>
                  Vue des cours assignés aux enseignants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <div key={teacher._id} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{teacher.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Matières: {teacher.subjects?.join(', ') || 'Non spécifiées'}
                            </p>
                          </div>
                        </div>
                        <div className="text-center py-4 text-muted-foreground">
                          <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">Aucun cours assigné</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Aucun enseignant trouvé</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}