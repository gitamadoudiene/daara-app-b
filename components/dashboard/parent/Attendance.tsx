'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar as CalendarIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  Download
} from 'lucide-react';
import { useState } from 'react';

interface AttendanceRecord {
  id: string;
  childName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject?: string;
  teacher?: string;
  reason?: string;
  arrivalTime?: string;
  notifiedParent: boolean;
}

interface AttendanceSummary {
  childName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedAbsences: number;
  attendanceRate: number;
  weeklyTrend: number;
}

interface AttendanceAlert {
  id: string;
  childName: string;
  type: 'absence' | 'lateness' | 'pattern';
  message: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
}

export function Attendance() {
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');

  // Mock data for attendance records
  const attendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      childName: 'Emma',
      date: '2024-07-22',
      status: 'present',
      subject: 'Mathématiques',
      teacher: 'M. Dubois',
      notifiedParent: false
    },
    {
      id: '2',
      childName: 'Lucas',
      date: '2024-07-22',
      status: 'late',
      subject: 'Sciences',
      teacher: 'Mme. Laurent',
      arrivalTime: '08:15',
      reason: 'Retard transport',
      notifiedParent: true
    },
    {
      id: '3',
      childName: 'Emma',
      date: '2024-07-21',
      status: 'present',
      subject: 'Français',
      teacher: 'Mme. Leroy',
      notifiedParent: false
    },
    {
      id: '4',
      childName: 'Lucas',
      date: '2024-07-21',
      status: 'absent',
      subject: 'Mathématiques',
      teacher: 'Mme. Garcia',
      reason: 'Maladie',
      notifiedParent: true
    },
    {
      id: '5',
      childName: 'Emma',
      date: '2024-07-20',
      status: 'present',
      subject: 'Physique-Chimie',
      teacher: 'M. Bernard',
      notifiedParent: false
    },
    {
      id: '6',
      childName: 'Lucas',
      date: '2024-07-20',
      status: 'excused',
      subject: 'Histoire-Géo',
      teacher: 'M. Roux',
      reason: 'Rendez-vous médical',
      notifiedParent: true
    }
  ];

  // Mock data for attendance summaries
  const attendanceSummaries: AttendanceSummary[] = [
    {
      childName: 'Emma',
      totalDays: 20,
      presentDays: 19,
      absentDays: 1,
      lateDays: 0,
      excusedAbsences: 1,
      attendanceRate: 95,
      weeklyTrend: 2
    },
    {
      childName: 'Lucas',
      totalDays: 20,
      presentDays: 17,
      absentDays: 2,
      lateDays: 1,
      excusedAbsences: 1,
      attendanceRate: 85,
      weeklyTrend: -5
    }
  ];

  // Mock data for attendance alerts
  const attendanceAlerts: AttendanceAlert[] = [
    {
      id: '1',
      childName: 'Lucas',
      type: 'lateness',
      message: 'Lucas a été en retard 2 fois cette semaine',
      date: '2024-07-22',
      severity: 'medium'
    },
    {
      id: '2',
      childName: 'Lucas',
      type: 'absence',
      message: 'Absence non justifiée le 19 juillet',
      date: '2024-07-19',
      severity: 'high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'late': return 'En retard';
      case 'excused': return 'Absent excusé';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'absent': return <UserX className="h-4 w-4 text-red-600" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'excused': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <UserCheck className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-blue-600';
    if (rate >= 85) return 'text-yellow-600';
    if (rate >= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    return <div className="h-4 w-4 border-t-2 border-gray-400"></div>;
  };

  const filteredRecords = selectedChild === 'all' 
    ? attendanceRecords 
    : attendanceRecords.filter(record => record.childName === selectedChild);

  const filteredSummaries = selectedChild === 'all' 
    ? attendanceSummaries 
    : attendanceSummaries.filter(summary => summary.childName === selectedChild);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Présences</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Suivez l&apos;assiduité de vos enfants en temps réel
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Rapport d&apos;Assiduité
        </Button>
      </div>

      {/* Alerts Section */}
      {attendanceAlerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-yellow-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alertes Assiduité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.childName} - {new Date(alert.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity === 'high' ? 'Urgent' : 
                       alert.severity === 'medium' ? 'Attention' : 'Info'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sélectionner enfant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les enfants</SelectItem>
                <SelectItem value="Emma">Emma</SelectItem>
                <SelectItem value="Lucas">Lucas</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="term">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSummaries.map((summary, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5" />
                {summary.childName} - Résumé d&apos;Assiduité
              </CardTitle>
              <CardDescription>
                Statistiques sur {selectedPeriod === 'week' ? 'cette semaine' : 'cette période'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className={`text-3xl font-bold ${getAttendanceRateColor(summary.attendanceRate)}`}>
                      {summary.attendanceRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Taux de présence</div>
                    <div className="flex items-center justify-center mt-2">
                      {getTrendIcon(summary.weeklyTrend)}
                      <span className="text-xs ml-1">
                        {summary.weeklyTrend > 0 ? '+' : ''}{summary.weeklyTrend}% cette semaine
                      </span>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {summary.totalDays}
                    </div>
                    <div className="text-sm text-muted-foreground">Jours total</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Période sélectionnée
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-700">
                      {summary.presentDays}
                    </div>
                    <div className="text-xs text-green-600">Présent</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-semibold text-red-700">
                      {summary.absentDays}
                    </div>
                    <div className="text-xs text-red-600">Absent</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-semibold text-yellow-700">
                      {summary.lateDays}
                    </div>
                    <div className="text-xs text-yellow-600">Retard</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700">
                      {summary.excusedAbsences}
                    </div>
                    <div className="text-xs text-blue-600">Excusé</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Objectif: 95%</span>
                    <span>{summary.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        summary.attendanceRate >= 95 ? 'bg-green-600' :
                        summary.attendanceRate >= 90 ? 'bg-blue-600' :
                        summary.attendanceRate >= 85 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(summary.attendanceRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique Détaillé</CardTitle>
          <CardDescription>
            Journal complet des présences et absences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(record.status)}
                      <h4 className="text-base font-semibold">{record.childName}</h4>
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusLabel(record.status)}
                      </Badge>
                      {record.notifiedParent && (
                        <Badge variant="outline" className="text-xs">
                          Parent notifié
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Date:</span> {new Date(record.date).toLocaleDateString('fr-FR')}
                      </div>
                      {record.subject && (
                        <div>
                          <span className="font-medium">Matière:</span> {record.subject}
                        </div>
                      )}
                      {record.teacher && (
                        <div>
                          <span className="font-medium">Professeur:</span> {record.teacher}
                        </div>
                      )}
                      {record.arrivalTime && (
                        <div>
                          <span className="font-medium">Arrivée:</span> {record.arrivalTime}
                        </div>
                      )}
                    </div>

                    {record.reason && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Motif:</span> {record.reason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Justifier
                    </Button>
                    <Button variant="outline" size="sm">
                      Contacter École
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun enregistrement de présence pour cette période</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions Rapides</CardTitle>
          <CardDescription>
            Gérez les absences et communicez avec l&apos;école
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              <UserX className="mr-2 h-4 w-4" />
              Signaler Absence
            </Button>
            <Button variant="outline" className="w-full">
              <Clock className="mr-2 h-4 w-4" />
              Prévoir Retard
            </Button>
            <Button variant="outline" className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Justifier Absence
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
