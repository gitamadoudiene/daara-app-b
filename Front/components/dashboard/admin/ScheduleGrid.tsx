import React from 'react';
import { Clock, User, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types pour les props (alignés avec ScheduleManagement)
interface Schedule {
  _id?: string;
  dayOfWeek: string;  // Changé de 'day' à 'dayOfWeek' pour correspondre à ScheduleItem
  startTime: string;
  endTime: string;
  subject?: { name: string; code?: string };
  teacher?: { name: string };
  room?: string;
}

interface ScheduleGridProps {
  classSchedules: Schedule[];
  onTimeSlotClick: (day: string, time: string) => void;
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  calculateDuration: (startTime: string, endTime: string) => number;
}

// Constantes (alignées avec ScheduleManagement)
const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DEFAULT_TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '14:00', '15:00', '16:00', '17:00'
];

export default function ScheduleGrid({ 
  classSchedules, 
  onTimeSlotClick, 
  onEditSchedule, 
  onDeleteSchedule, 
  calculateDuration 
}: ScheduleGridProps) {
  
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-auto max-h-[600px]">
      {/* En-tête de la grille */}
      <div className="grid gap-1 p-4 pb-2 border-b bg-gray-50/50" 
           style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}>
        <div className="text-sm font-semibold text-center text-gray-600">Horaires</div>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-sm font-semibold text-center text-gray-600 capitalize">
            {day}
          </div>
        ))}
      </div>

      {/* Grille complète avec CSS Grid pour spanning correct */}
      <div className="p-4">
        <div 
          className="grid gap-1 relative"
          style={{
            gridTemplateColumns: 'auto repeat(7, 1fr)',
            gridTemplateRows: `repeat(${DEFAULT_TIME_SLOTS.length}, 80px)`,
          }}
        >
          {/* Colonnes des heures */}
          {DEFAULT_TIME_SLOTS.map((time, timeIndex) => (
            <div 
              key={`time-${time}`} 
              className="p-3 text-sm font-medium text-center bg-muted/50 rounded-md flex items-center justify-center"
              style={{
                gridColumn: '1',
                gridRow: `${timeIndex + 1}`
              }}
            >
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {time}
              </div>
            </div>
          ))}

          {/* Cases vides pour les slots disponibles */}
          {DAYS_OF_WEEK.map((day, dayIndex) =>
            DEFAULT_TIME_SLOTS.map((time, timeIndex) => {
              // Vérifier si ce slot est occupé par un cours
              const hasScheduleStartingHere = classSchedules.find(schedule => 
                schedule.dayOfWeek === day && schedule.startTime === time
              );
              
              const isOccupiedByOtherSchedule = classSchedules.find(schedule => {
                const startIndex = DEFAULT_TIME_SLOTS.findIndex(slot => slot === schedule.startTime);
                const endIndex = DEFAULT_TIME_SLOTS.findIndex(slot => slot === schedule.endTime);
                return schedule.dayOfWeek === day && 
                       startIndex <= timeIndex && 
                       timeIndex < endIndex &&
                       startIndex !== timeIndex; // Pas le slot de démarrage
              });

              // Ne créer que les cases vides (pas occupées par des cours)
              if (!hasScheduleStartingHere && !isOccupiedByOtherSchedule) {
                return (
                  <div
                    key={`${day}-${time}-empty`}
                    className="bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-md cursor-pointer transition-all duration-200 p-2 flex items-center justify-center"
                    style={{
                      gridColumn: `${dayIndex + 2}`,
                      gridRow: `${timeIndex + 1}`,
                    }}
                    onClick={() => onTimeSlotClick(day, time)}
                  >
                    <div className="text-gray-400 text-xs text-center">
                      <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center border border-dashed border-gray-300 rounded">+</div>
                      <span>Ajouter</span>
                    </div>
                  </div>
                );
              }
              return null;
            })
          )}

          {/* Cartes de cours avec spanning correct */}
          {classSchedules.map((schedule, scheduleIndex) => {
            const dayIndex = DAYS_OF_WEEK.findIndex(day => day === schedule.dayOfWeek);
            const startIndex = DEFAULT_TIME_SLOTS.findIndex(slot => slot === schedule.startTime);
            const endIndex = DEFAULT_TIME_SLOTS.findIndex(slot => slot === schedule.endTime);
            const spanCount = endIndex - startIndex;

            if (dayIndex === -1 || startIndex === -1 || endIndex === -1 || spanCount <= 0) {
              return null;
            }

            return (
              <div
                key={`schedule-${scheduleIndex}`}
                className="group relative border rounded-xl cursor-pointer transition-all duration-200 z-10"
                style={{
                  gridColumn: `${dayIndex + 2}`,
                  gridRow: `${startIndex + 1} / span ${spanCount}`,
                }}
                onClick={() => onEditSchedule(schedule)}
              >
                <div className="relative h-full w-full">
                  {/* Carte moderne avec gradient */}
                  <div className={`absolute inset-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-4 text-white overflow-hidden
                    ${spanCount >= 3 ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 
                      spanCount >= 2 ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 
                      'bg-gradient-to-br from-teal-500 to-teal-600'}`}>
                    
                    {/* Pattern décoratif */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-10 -translate-y-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-8 translate-y-8"></div>
                    </div>
                    
                    {/* Header avec matière et durée */}
                    <div className="relative z-10 flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg truncate mb-1">
                          {schedule.subject?.name || 'Matière'}
                        </h4>
                        <div className="text-white/80 text-sm">
                          {schedule.subject?.code || 'CODE'}
                        </div>
                      </div>
                      
                      {/* Badge durée */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm font-bold">
                            {Math.floor(calculateDuration(schedule.startTime, schedule.endTime) / 60)}h
                            {calculateDuration(schedule.startTime, schedule.endTime) % 60 > 0 && 
                              `${calculateDuration(schedule.startTime, schedule.endTime) % 60}m`
                            }
                          </span>
                        </div>
                        
                        {spanCount >= 3 && (
                          <div className="bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                            {spanCount}h
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Horaires */}
                    <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-lg p-2 mb-3">
                      <div className="text-center font-semibold">
                        {schedule.startTime} → {schedule.endTime}
                      </div>
                    </div>
                    
                    {/* Enseignant et salle */}
                    <div className="relative z-10 space-y-2 text-sm">
                      <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-2">
                        <User className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate font-medium">
                          {schedule.teacher?.name || 'Enseignant'}
                        </span>
                      </div>
                      
                      {schedule.room && (
                        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-2">
                          <span className="mr-2">📍</span>
                          <span className="truncate">{schedule.room}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions au survol */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSchedule(schedule);
                        }}
                        className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSchedule(schedule._id!);
                        }}
                        className="h-8 w-8 p-0 bg-red-500/20 hover:bg-red-500/30 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Barre de progression */}
                    {spanCount > 1 && (
                      <div className="absolute bottom-1 left-4 right-4 z-10">
                        <div className="bg-white/20 rounded-full h-1.5">
                          <div className="bg-white rounded-full h-1.5 transition-all duration-1000" 
                               style={{width: `${Math.min(100, (spanCount / 6) * 100)}%`}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}