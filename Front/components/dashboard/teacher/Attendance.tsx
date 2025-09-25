'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckSquare, Search, Calendar as CalendarIcon, UserCheck, UserX, Clock } from 'lucide-react';
import { useState } from 'react';

interface AttendanceSession {
  id: string;
  date: string;
  class: string;
  subject: string;
  time: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  status: 'completed' | 'pending';
}

export function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock data for attendance sessions
  const attendanceSessions: AttendanceSession[] = [
    {
      id: '1',
      date: '2024-07-22',
      class: '6ème A',
      subject: 'Mathématiques',
      time: '08:00',
      totalStudents: 28,
      presentStudents: 26,
      absentStudents: 2,
      lateStudents: 0,
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-07-22',
      class: '5ème B',
      subject: 'Mathématiques',
      time: '09:30',
      totalStudents: 32,
      presentStudents: 30,
      absentStudents: 1,
      lateStudents: 1,
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-07-22',
      class: '4ème A',
      subject: 'Mathématiques',
      time: '11:00',
      totalStudents: 25,
      presentStudents: 0,
      absentStudents: 0,
      lateStudents: 0,
      status: 'pending'
    },
    {
      id: '4',
      date: '2024-07-22',
      class: '3ème C',
      subject: 'Mathématiques',
      time: '14:30',
      totalStudents: 30,
      presentStudents: 0,
      absentStudents: 0,
      lateStudents: 0,
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const getAttendanceRate = (present: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Présences</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enregistrez et suivez la présence de vos étudiants
          </p>
        </div>
        <Button>
          <CheckSquare className="mr-2 h-4 w-4" />
          Faire l&apos;Appel
        </Button>
      </div>

      {/* Date and Class Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher une classe..." className="pl-8" />
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? selectedDate.toLocaleDateString('fr-FR') : 'Sélectionner une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                <SelectItem value="6a">6ème A</SelectItem>
                <SelectItem value="5b">5ème B</SelectItem>
                <SelectItem value="4a">4ème A</SelectItem>
                <SelectItem value="3c">3ème C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">115</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Présents</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">106</div>
            <p className="text-xs text-muted-foreground">
              92% de présence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absents</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-muted-foreground">
              7% d&apos;absence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retards</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <p className="text-xs text-muted-foreground">
              1% de retard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Sessions */}
      <div className="space-y-4">
        {attendanceSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <CardTitle className="text-lg">{session.class} - {session.subject}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>{session.time}</span>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusLabel(session.status)}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {session.status === 'completed' ? getAttendanceRate(session.presentStudents, session.totalStudents) : '--'}%
                  </div>
                  <div className="text-xs text-muted-foreground">Présence</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Attendance Breakdown */}
                {session.status === 'completed' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-700">
                        {session.presentStudents}
                      </div>
                      <div className="text-xs text-green-600">Présents</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-semibold text-red-700">
                        {session.absentStudents}
                      </div>
                      <div className="text-xs text-red-600">Absents</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-700">
                        {session.lateStudents}
                      </div>
                      <div className="text-xs text-yellow-600">Retards</div>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {session.status === 'completed' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taux de présence</span>
                      <span>{session.presentStudents}/{session.totalStudents}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${getAttendanceRate(session.presentStudents, session.totalStudents)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  {session.status === 'pending' ? (
                    <Button size="sm" className="flex-1">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Faire l&apos;Appel
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1">
                      Modifier l&apos;Appel
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    Voir Détails
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Exporter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
