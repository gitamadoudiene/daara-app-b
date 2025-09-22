'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar,
  Clock,
  BookOpen,
  User,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  School,
  Users,
  Eye,
  Settings,
  Save,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Types et interfaces
interface ScheduleItem {
  _id?: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  duration: number;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  class: {
    _id: string;
    name: string;
    level: string;
  };
}

interface Class {
  _id: string;
  name: string;
  level: string;
  room: string;
  studentCount: number;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subjects: string[];
}

interface TeacherAvailability {
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  isAvailable: boolean;
  conflicts?: any[];
}

interface TimeSlotCreation {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  duration: number;
}

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Heures par défaut (peut être personnalisé)
const DEFAULT_TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '14:00', '15:00', '16:00', '17:00'
];

export default function ScheduleManagement() {
  const { user } = useAuth();
  
  // États principaux
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('2024-2025');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // États pour la création de créneaux
  const [isCreateSlotOpen, setIsCreateSlotOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotCreation | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [availableTeachers, setAvailableTeachers] = useState<TeacherAvailability[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // États pour l'édition
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Charger les classes de l'école de l'admin
  const loadClasses = useCallback(async () => {
    if (!user?.schoolId) return;
    
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
        setClasses(data);
      } else {
        toast.error('Erreur lors du chargement des classes');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des classes');
    }
  }, [user?.schoolId]);

  // Charger les matières de l'école
  const loadSubjects = useCallback(async () => {
    if (!user?.schoolId) return;
    
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
        setSubjects(data);
      } else {
        toast.error('Erreur lors du chargement des matières');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des matières');
    }
  }, [user?.schoolId]);

  // Charger l'emploi du temps d'une classe
  const loadClassSchedule = useCallback(async () => {
    if (!selectedClass) {
      setSchedules([]);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch(
        `http://localhost:5000/api/schedules/class/${selectedClass}?semester=${selectedSemester}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Convertir scheduleByDay en array plat
        const schedulesArray: ScheduleItem[] = [];
        Object.entries(data.scheduleByDay).forEach(([day, daySchedules]) => {
          (daySchedules as any[]).forEach(schedule => {
            schedulesArray.push({
              ...schedule,
              dayOfWeek: day,
              // Mapper les références populées
              subject: schedule.subjectId || schedule.subject || { name: 'Matière', code: 'N/A' },
              teacher: schedule.teacherId || schedule.teacher || { name: 'Enseignant', email: '' },
              class: schedule.classId || schedule.class || { name: 'Classe', level: '' }
            });
          });
        });
        setSchedules(schedulesArray);
      } else {
        toast.error('Erreur lors du chargement de l\'emploi du temps');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSemester]);

  // Vérifier la disponibilité des enseignants
  const checkTeacherAvailability = async (timeSlot: TimeSlotCreation, subjectId: string) => {
    if (!selectedClass || !subjectId) return;
    
    setCheckingAvailability(true);
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch(
        `http://localhost:5000/api/schedules/availability/check?` + 
        `dayOfWeek=${timeSlot.dayOfWeek}&startTime=${timeSlot.startTime}&endTime=${timeSlot.endTime}&` +
        `classId=${selectedClass}&subjectId=${subjectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableTeachers(data.availableTeachers);
      } else {
        toast.error('Erreur lors de la vérification des disponibilités');
        setAvailableTeachers([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la vérification des disponibilités');
      setAvailableTeachers([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Créer un nouveau créneau
  const createScheduleSlot = async () => {
    if (!selectedClass || !selectedSubject || !selectedTeacher || !selectedTimeSlot) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: selectedClass,
          subjectId: selectedSubject,
          teacherId: selectedTeacher,
          dayOfWeek: selectedTimeSlot.dayOfWeek,
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          room: room || 'Salle à définir',
          semester: selectedSemester
        })
      });

      if (response.ok) {
        toast.success('Créneau créé avec succès');
        setIsCreateSlotOpen(false);
        resetCreateForm();
        loadClassSchedule();
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          // Conflit détecté
          toast.error(`Conflit détecté: ${errorData.conflicts[0]?.message}`);
        } else {
          toast.error(errorData.message || 'Erreur lors de la création du créneau');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du créneau');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire de création
  const resetCreateForm = () => {
    setSelectedSubject('');
    setSelectedTeacher('');
    setStartTime('');
    setEndTime('');
    setRoom('');
    setSelectedTimeSlot(null);
    setAvailableTeachers([]);
  };

  // Supprimer un créneau
  const deleteScheduleSlot = async (scheduleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch(`http://localhost:5000/api/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Créneau supprimé avec succès');
        loadClassSchedule();
      } else {
        toast.error('Erreur lors de la suppression du créneau');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du créneau');
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le dialog de création pour un créneau spécifique
  const handleTimeSlotClick = (day: string, time: string) => {
    const endTimeCalc = calculateEndTime(time, 60); // 1h par défaut
    const timeSlot: TimeSlotCreation = {
      dayOfWeek: day,
      startTime: time,
      endTime: endTimeCalc,
      duration: 60
    };
    
    setSelectedTimeSlot(timeSlot);
    setStartTime(time);
    setEndTime(endTimeCalc);
    setIsCreateSlotOpen(true);
  };

  // Calculer l'heure de fin en fonction de la durée
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Calculer la durée en minutes entre deux heures
  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };

  // Obtenir les créneaux pour un jour et une heure spécifiques
  const getScheduleForSlot = (day: string, time: string): ScheduleItem | null => {
    return schedules.find(schedule => 
      schedule.dayOfWeek === day && 
      schedule.startTime === time
    ) || null;
  };

  // Vérifier si une case est occupée par un créneau qui commence plus tôt
  const isSlotOccupiedByEarlierSchedule = (day: string, time: string): ScheduleItem | null => {
    const currentTimeMinutes = timeToMinutes(time);
    
    // Chercher un créneau qui commence avant cette heure et qui se termine après
    return schedules.find(schedule => {
      if (schedule.dayOfWeek !== day) return false;
      
      const scheduleStartMinutes = timeToMinutes(schedule.startTime);
      const scheduleEndMinutes = timeToMinutes(schedule.endTime);
      
      return scheduleStartMinutes < currentTimeMinutes && scheduleEndMinutes > currentTimeMinutes;
    }) || null;
  };

  // Calculer la hauteur d'un créneau en nombre de cases
  const getScheduleSpanCount = (schedule: ScheduleItem): number => {
    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    const durationMinutes = endMinutes - startMinutes;
    
    // Chaque case représente 1 heure (60 minutes)
    return Math.ceil(durationMinutes / 60);
  };

  // Convertir une heure en minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Effet pour charger les données initiales
  useEffect(() => {
    if (user?.schoolId) {
      loadClasses();
      loadSubjects();
    }
  }, [user, loadClasses, loadSubjects]);

  // Effet pour charger l'emploi du temps quand la classe change
  useEffect(() => {
    loadClassSchedule();
  }, [loadClassSchedule]);

  // Effet pour vérifier la disponibilité quand les paramètres changent
  useEffect(() => {
    if (selectedTimeSlot && selectedSubject) {
      checkTeacherAvailability(selectedTimeSlot, selectedSubject);
    }
  }, [selectedTimeSlot, selectedSubject]);

  // Mettre à jour la durée quand les heures changent
  useEffect(() => {
    if (startTime && endTime && selectedTimeSlot) {
      const newDuration = calculateDuration(startTime, endTime);
      setSelectedTimeSlot({
        ...selectedTimeSlot,
        startTime,
        endTime,
        duration: newDuration
      });
    }
  }, [startTime, endTime]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Veuillez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Emplois du Temps</h2>
          <p className="text-muted-foreground">
            Créez et gérez les emplois du temps de vos classes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2025-2026">2025-2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sélection de la classe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Sélectionner une classe
          </CardTitle>
          <CardDescription>
            Choisissez la classe pour laquelle vous souhaitez gérer l'emploi du temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
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
            {selectedClass && (
              <div className="md:col-span-2 flex items-center gap-4 pt-6">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {classes.find(c => c._id === selectedClass)?.name}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClass('')}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Changer
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grille de l'emploi du temps */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Emploi du temps - {classes.find(c => c._id === selectedClass)?.name}
            </CardTitle>
            <CardDescription>
              Cliquez sur une case vide pour ajouter un cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* En-tête avec les jours */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  <div className="p-3 font-semibold text-center bg-muted rounded-md">
                    Heures
                  </div>
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day}
                      className="p-3 font-semibold text-center bg-muted rounded-md"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grille des créneaux horaires */}
                <div className="space-y-1">
                  {DEFAULT_TIME_SLOTS.map((time) => (
                    <div key={time} className="grid grid-cols-7 gap-1">
                      {/* Colonne des heures */}
                      <div className="p-3 text-sm font-medium text-center bg-muted/50 rounded-md flex items-center justify-center">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time}
                        </div>
                      </div>

                      {/* Cases des jours */}
                      {DAYS_OF_WEEK.map((day) => {
                        const existingSchedule = getScheduleForSlot(day, time);
                        const occupyingSchedule = isSlotOccupiedByEarlierSchedule(day, time);
                        
                        // Si cette case est occupée par un créneau qui commence plus tôt, ne pas l'afficher
                        if (occupyingSchedule && !existingSchedule) {
                          return (
                            <div
                              key={`${day}-${time}`}
                              className="relative min-h-[80px] bg-blue-50/50 border border-blue-200/50 rounded-md opacity-50"
                            >
                              <div className="flex items-center justify-center h-full text-xs text-blue-600/60">
                                Occupé par {occupyingSchedule.subject?.name || 'Cours précédent'}
                              </div>
                            </div>
                          );
                        }
                        
                        const spanCount = existingSchedule ? getScheduleSpanCount(existingSchedule) : 1;
                        
                        return (
                          <div
                            key={`${day}-${time}`}
                            className={`relative p-2 border rounded-md cursor-pointer transition-all duration-200 ${
                              existingSchedule
                                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                            style={{
                              minHeight: existingSchedule ? `${Math.max(80, spanCount * 80)}px` : '80px'
                            }}
                            onClick={() => !existingSchedule && handleTimeSlotClick(day, time)}
                          >
                            {existingSchedule ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <Badge variant="secondary" className="text-xs">
                                    {existingSchedule.subject?.code || existingSchedule.subject?.name || 'N/A'}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSchedule(existingSchedule);
                                        setIsEditDialogOpen(true);
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteScheduleSlot(existingSchedule._id!);
                                      }}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="text-xs font-medium text-gray-900">
                                  {existingSchedule.subject?.name || 'Matière'}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <User className="h-3 w-3" />
                                  {existingSchedule.teacher?.name || 'Enseignant'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {existingSchedule.startTime} - {existingSchedule.endTime}
                                  <span className="ml-2 font-medium text-blue-600">
                                    ({Math.floor(calculateDuration(existingSchedule.startTime, existingSchedule.endTime) / 60)}h
                                    {calculateDuration(existingSchedule.startTime, existingSchedule.endTime) % 60 > 0 && 
                                      ` ${calculateDuration(existingSchedule.startTime, existingSchedule.endTime) % 60}min`
                                    })
                                  </span>
                                </div>
                                {existingSchedule.room && (
                                  <div className="text-xs text-gray-500">
                                    📍 {existingSchedule.room}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                  <Plus className="h-4 w-4 mx-auto mb-1" />
                                  <span className="text-xs">Ajouter</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de création de créneau */}
      <Dialog open={isCreateSlotOpen} onOpenChange={setIsCreateSlotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ajouter un cours
            </DialogTitle>
            <DialogDescription>
              {selectedTimeSlot && (
                <>Créer un nouveau cours pour le {selectedTimeSlot.dayOfWeek} à {selectedTimeSlot.startTime}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Horaires */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Durée calculée */}
            {selectedTimeSlot && selectedTimeSlot.duration > 0 && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                Durée: {Math.floor(selectedTimeSlot.duration / 60)}h {selectedTimeSlot.duration % 60}min
              </div>
            )}

            {/* Matière */}
            <div className="space-y-2">
              <Label>Matière *</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3 w-3" />
                        {subject.name} ({subject.code})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enseignants disponibles */}
            {selectedSubject && (
              <div className="space-y-2">
                <Label>Enseignant disponible *</Label>
                {checkingAvailability ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Vérification des disponibilités...
                  </div>
                ) : availableTeachers.length > 0 ? (
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeachers.map(({ teacher, isAvailable }) => (
                        <SelectItem
                          key={teacher._id}
                          value={teacher._id}
                          disabled={!isAvailable}
                        >
                          <div className="flex items-center gap-2">
                            {isAvailable ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            {teacher.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : selectedSubject ? (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    Aucun enseignant disponible pour ce créneau
                  </div>
                ) : null}
              </div>
            )}

            {/* Salle */}
            <div className="space-y-2">
              <Label>Salle</Label>
              <Input
                placeholder="Ex: Salle A1, Laboratoire..."
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSlotOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={createScheduleSlot}
              disabled={loading || !selectedSubject || !selectedTeacher}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}