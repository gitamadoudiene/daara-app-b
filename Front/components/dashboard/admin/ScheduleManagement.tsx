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
import ScheduleGrid from './ScheduleGrid';

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
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
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
        const responseData = await response.json();
        toast.success('Créneau créé avec succès');
        setIsCreateSlotOpen(false);
        resetCreateForm();
        
        // Recharger les données avec un petit délai pour s'assurer que le serveur a terminé
        setTimeout(() => {
          loadClassSchedule();
        }, 500);
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

  // Fonction pour obtenir la couleur d'une matière
  const getSubjectColor = (subjectName: string): string => {
    const colors = {
      'Mathématique': 'from-purple-500 to-purple-700',
      'Mathématiques': 'from-purple-500 to-purple-700',
      'Français': 'from-blue-500 to-blue-700',
      'Physique': 'from-green-500 to-green-700',
      'Physique-Chimie': 'from-emerald-500 to-emerald-700',
      'Chimie': 'from-teal-500 to-teal-700',
      'Histoire': 'from-amber-500 to-amber-700',
      'Géographie': 'from-orange-500 to-orange-700',
      'SVT': 'from-lime-500 to-lime-700',
      'Sciences': 'from-cyan-500 to-cyan-700',
      'Anglais': 'from-red-500 to-red-700',
      'EPS': 'from-pink-500 to-pink-700',
      'Arts': 'from-violet-500 to-violet-700',
      'Musique': 'from-indigo-500 to-indigo-700',
      'Technologie': 'from-gray-500 to-gray-700',
      'Informatique': 'from-slate-500 to-slate-700',
      'Philosophie': 'from-stone-500 to-stone-700',
      'Économie': 'from-yellow-500 to-yellow-700',
      'Gestion': 'from-rose-500 to-rose-700',
      'Comptabilité': 'from-fuchsia-500 to-fuchsia-700',
    };

    // Normaliser le nom de la matière et chercher une correspondance
    const normalizedName = subjectName?.trim();
    
    // Recherche exacte d'abord
    if (colors[normalizedName]) {
      return colors[normalizedName];
    }
    
    // Recherche partielle pour les variations
    const partialMatch = Object.keys(colors).find(key => 
      normalizedName?.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(normalizedName?.toLowerCase())
    );
    
    if (partialMatch) {
      return colors[partialMatch];
    }
    
    // Couleur par défaut basée sur le hash du nom pour avoir une couleur cohérente
    const defaultColors = [
      'from-blue-500 to-blue-700',
      'from-green-500 to-green-700',
      'from-purple-500 to-purple-700',
      'from-orange-500 to-orange-700',
      'from-teal-500 to-teal-700',
      'from-pink-500 to-pink-700'
    ];
    
    const hash = normalizedName?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) || 0;
    
    return defaultColors[Math.abs(hash) % defaultColors.length];
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
            Choisissez la classe pour laquelle vous souhaitez gérer l&apos;emploi du temps
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
                {/* Grille d'emploi du temps moderne */}
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  {/* En-tête de la grille - largeur adaptative */}
                 <div className="grid gap-4 mb-2" style={{ gridTemplateColumns: 'auto repeat(6, 1fr)' }}>
                    <div className="text-center p-2 bg-gray-100 rounded font-semibold text-sm">Horaires</div>
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="text-center p-2 bg-gray-100 rounded font-semibold text-sm truncate">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grille principale avec CSS Grid - hauteur cellules augmentée */}
                  <div 
                    className="grid gap-4 relative" 
                    style={{
                      gridTemplateColumns: 'auto repeat(6, 1fr)',
                     gridTemplateRows: `repeat(${DEFAULT_TIME_SLOTS.length}, 100px)`, // Augmenté de 60px à 80px
                      alignItems: 'stretch',
                    }}
                  >
                    {/* Colonnes des heures */}
                    {DEFAULT_TIME_SLOTS.map((time, timeIndex) => (
                      <div 
                        key={`time-${time}`} 
                        className="p-2 bg-gray-50 text-center text-sm font-medium flex items-center justify-center rounded"
                        style={{
                          gridColumn: '1',
                          gridRow: `${timeIndex + 1}`
                        }}
                      >
                        {time}
                      </div>
                    ))}

                    {/* Cases vides pour les slots disponibles */}
                    {DAYS_OF_WEEK.map((day, dayIndex) =>
                      DEFAULT_TIME_SLOTS.map((time, timeIndex) => {
                        // Vérifier si ce slot est le début d'un cours
                        const scheduleStartingHere = schedules.find(schedule => 
                          schedule.dayOfWeek === day && schedule.startTime === time
                        );
                        
                        // Vérifier si ce slot est occupé par un cours qui a commencé plus tôt
                        const isOccupiedByEarlierSchedule = schedules.find(schedule => {
                          const startIndex = DEFAULT_TIME_SLOTS.findIndex(slot => slot === schedule.startTime);
                          const endIndex = DEFAULT_TIME_SLOTS.findIndex(slot => slot === schedule.endTime);
                          return schedule.dayOfWeek === day && 
                                 startIndex <= timeIndex && 
                                 timeIndex < endIndex &&
                                 startIndex !== timeIndex; // Pas le slot de démarrage
                        });

                        // Ne créer que les cases vides (pas occupées)
                        if (!scheduleStartingHere && !isOccupiedByEarlierSchedule) {
                          return (
                            <div
                              key={`${day}-${time}-empty`}
                              className="border border-gray-200 rounded cursor-pointer hover:bg-gray-50 p-2 flex items-center justify-center"
                              style={{
                                gridColumn: `${dayIndex + 2}`,
                                gridRow: `${timeIndex + 1}`,
                              }}
                              onClick={() => handleTimeSlotClick(day, time)}
                            >
                              <div className="text-gray-400 text-xs">+</div>
                            </div>
                          );
                        }
                        return null;
                      })
                    )}

                    {/* Cartes de cours avec spanning correct */}
                    {schedules.map((schedule, scheduleIndex) => {
                      const dayIndex = DAYS_OF_WEEK.findIndex(day => day === schedule.dayOfWeek);
                      const startIndex = DEFAULT_TIME_SLOTS.findIndex(slot => slot === schedule.startTime);
                      const endIndex = DEFAULT_TIME_SLOTS.findIndex(slot => slot === schedule.endTime);
                      
                      // Correction: pour couvrir jusqu'à l'heure de fin INCLUSE
                      // Un cours 08:00-11:00 doit couvrir les cases 08:00, 09:00, 10:00 ET la case 11:00
                      let spanCount;
                      if (endIndex !== -1 && endIndex > startIndex) {
                        // Si l'heure de fin existe dans notre grille, on inclut cette case (+1)
                        spanCount = endIndex - startIndex + 1;
                      } else {
                        // Calcul de secours basé sur la durée en heures
                        const startTime = schedule.startTime.split(':').map(Number);
                        const endTime = schedule.endTime.split(':').map(Number);
                        const durationInHours = (endTime[0] + endTime[1]/60) - (startTime[0] + startTime[1]/60);
                        spanCount = Math.ceil(durationInHours);
                      }

                      if (dayIndex === -1 || startIndex === -1 || spanCount <= 0) {
                        return null;
                      }

                      return (
                        <div
                          key={`schedule-${scheduleIndex}`}
                          className="group relative rounded-lg cursor-pointer transition-all duration-200 z-10 min-w-0"
                          style={{
                            gridColumn: `${dayIndex + 2}`,
                            gridRow: `${startIndex + 1} / span ${spanCount}`,
                            width: '100%',
                            margin: '2px', // Force la largeur à 100% de la cellule
                          }}
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          {/* Carte moderne avec gradient par matière - hauteur minimum pour cours courts */}
                          <div className={`h-full w-full rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 text-white overflow-hidden bg-gradient-to-br ${getSubjectColor(schedule.subject?.name || 'Matière')} flex flex-col`} style={{ minHeight: spanCount === 1 ? '120px' : spanCount === 2 ? '140px' : 'auto' }}>
                            
                            {/* Pattern décoratif */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute top-0 right-0 w-10 h-10 bg-white rounded-full transform translate-x-5 -translate-y-5"></div>
                              <div className="absolute bottom-0 left-0 w-8 h-8 bg-white rounded-full transform -translate-x-4 translate-y-4"></div>
                            </div>
                            
                            {/* Contenu de la carte avec flexbox optimisé */}
                            <div className="relative z-10 h-full flex flex-col min-h-0 justify-between">
                              {/* Contenu principal optimisé pour cours courts */}
                              <div className="flex-shrink-0">
                                {/* Header avec matière et durée - espacement réduit pour cours courts */}
                                <div className={`flex items-start justify-between ${spanCount === 1 ? 'mb-1' : 'mb-2'}`}>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate leading-tight">
                                      {schedule.subject?.name || 'Matière'}
                                    </h4>
                                    {spanCount > 1 && (
                                      <div className="text-white/80 text-xs truncate">
                                        {schedule.subject?.code || 'CODE'}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Badge durée */}
                                  <div className="bg-white/20 rounded-full px-2 py-1 flex-shrink-0">
                                    <span className="text-xs font-bold">{spanCount}h</span>
                                  </div>
                                </div>
                                
                                {/* Horaires */}
                                <div className={`bg-white/10 rounded p-1 ${spanCount === 1 ? 'mb-1' : 'mb-2'}`}>
                                  <div className="text-center text-xs font-medium">
                                    {schedule.startTime} → {schedule.endTime}
                                  </div>
                                </div>
                                
                                {/* Enseignant - adapté selon la durée */}
                                {spanCount > 1 && (
                                  <div className="flex items-center bg-white/10 rounded p-1 mb-2">
                                    <User className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="text-xs truncate">
                                      {schedule.teacher?.name || 'Enseignant'}
                                    </span>
                                  </div>
                                )}
                                {spanCount === 1 && (
                                  <div className="text-xs text-white/80 text-center truncate mb-2">
                                    👤 {schedule.teacher?.name || 'Enseignant'}
                                  </div>
                                )}
                              </div>
                              
                              {/* Boutons d'action en bas - plus visibles et accessibles */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center gap-2 flex-shrink-0 mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSchedule(schedule);
                                    setIsEditDialogOpen(true);
                                  }}
                                  className="w-8 h-8 bg-white hover:bg-blue-50 rounded-full text-gray-600 hover:text-blue-600 flex items-center justify-center shadow-lg border border-white/50 transition-all duration-200 hover:scale-110"
                                  title="Modifier le cours"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteScheduleSlot(schedule._id!);
                                  }}
                                  className="w-8 h-8 bg-white hover:bg-red-50 rounded-full text-gray-600 hover:text-red-600 flex items-center justify-center shadow-lg border border-white/50 transition-all duration-200 hover:scale-110"
                                  title="Supprimer le cours"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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