'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Eye, 
  TrendingUp, 
  UserCheck, 
  GraduationCap, 
  Calendar,
  Star,
  ClipboardList,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Award
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  class: string;
  teacher: string;
  averageGrade: string;
  numericGrade: number;
  attendanceRate: number;
  profileImage?: string;
  birthDate: string;
  subjects: Subject[];
  recentPerformance: PerformanceData[];
  upcomingEvents: ChildEvent[];
}

interface Subject {
  name: string;
  grade: number;
  teacher: string;
  lastUpdate: string;
}

interface PerformanceData {
  period: string;
  average: number;
  rank: number;
  totalStudents: number;
}

interface ChildEvent {
  title: string;
  date: string;
  type: 'test' | 'assignment' | 'meeting';
}

export function MyChildren() {
  // Mock data for children with detailed information
  const children: Child[] = [
    {
      id: '1',
      name: 'Emma Dupont',
      class: '2nde A',
      teacher: 'Mme. Martin',
      averageGrade: 'A-',
      numericGrade: 16.2,
      attendanceRate: 95,
      profileImage: '/avatars/emma.jpg',
      birthDate: '2008-03-15',
      subjects: [
        { name: 'Mathématiques', grade: 17.5, teacher: 'M. Dubois', lastUpdate: '2024-07-20' },
        { name: 'Français', grade: 16.0, teacher: 'Mme. Leroy', lastUpdate: '2024-07-19' },
        { name: 'Physique-Chimie', grade: 15.8, teacher: 'M. Bernard', lastUpdate: '2024-07-18' },
        { name: 'Histoire-Géo', grade: 16.5, teacher: 'Mme. Rousseau', lastUpdate: '2024-07-17' },
        { name: 'Anglais', grade: 15.2, teacher: 'Mme. Smith', lastUpdate: '2024-07-16' }
      ],
      recentPerformance: [
        { period: 'Trimestre 1', average: 16.2, rank: 3, totalStudents: 35 },
        { period: 'Contrôle continu', average: 16.8, rank: 2, totalStudents: 35 }
      ],
      upcomingEvents: [
        { title: 'Contrôle Mathématiques', date: '2024-07-28', type: 'test' },
        { title: 'Dissertation Français', date: '2024-07-30', type: 'assignment' }
      ]
    },
    {
      id: '2',
      name: 'Lucas Dupont',
      class: '4ème B',
      teacher: 'M. Petit',
      averageGrade: 'B+',
      numericGrade: 14.8,
      attendanceRate: 92,
      profileImage: '/avatars/lucas.jpg',
      birthDate: '2010-09-22',
      subjects: [
        { name: 'Mathématiques', grade: 15.2, teacher: 'Mme. Garcia', lastUpdate: '2024-07-20' },
        { name: 'Français', grade: 14.5, teacher: 'M. Moreau', lastUpdate: '2024-07-19' },
        { name: 'Sciences', grade: 15.8, teacher: 'Mme. Laurent', lastUpdate: '2024-07-18' },
        { name: 'Histoire-Géo', grade: 13.9, teacher: 'M. Roux', lastUpdate: '2024-07-17' },
        { name: 'Anglais', grade: 14.2, teacher: 'Mme. Johnson', lastUpdate: '2024-07-16' }
      ],
      recentPerformance: [
        { period: 'Trimestre 1', average: 14.8, rank: 8, totalStudents: 28 },
        { period: 'Contrôle continu', average: 15.1, rank: 6, totalStudents: 28 }
      ],
      upcomingEvents: [
        { title: 'Exposé Sciences', date: '2024-07-26', type: 'assignment' },
        { title: 'Rencontre Professeur Principal', date: '2024-08-02', type: 'meeting' }
      ]
    }
  ];

  const getGradeColor = (numericGrade: number) => {
    if (numericGrade >= 16) return 'bg-green-100 text-green-800';
    if (numericGrade >= 14) return 'bg-blue-100 text-blue-800';
    if (numericGrade >= 12) return 'bg-yellow-100 text-yellow-800';
    if (numericGrade >= 10) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSubjectGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 14) return 'text-blue-600';
    if (grade >= 12) return 'text-yellow-600';
    if (grade >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'test': return ClipboardList;
      case 'assignment': return GraduationCap;
      case 'meeting': return MessageSquare;
      default: return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'test': return 'bg-red-100 text-red-800';
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Mes Enfants</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Profils académiques détaillés de vos enfants
          </p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Contacter École
        </Button>
      </div>

      {/* Children Detailed Cards */}
      <div className="space-y-6">
        {children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={child.profileImage} alt={child.name} />
                    <AvatarFallback className="text-lg">
                      {child.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-sm">{child.class}</Badge>
                      <Badge variant="outline">Prof. Principal: {child.teacher}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Né(e) le {new Date(child.birthDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${getGradeColor(child.numericGrade)}`}>
                    {child.averageGrade}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {child.numericGrade}/20 - Moyenne Générale
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{child.numericGrade}</div>
                    <div className="text-xs text-blue-600">Moyenne /20</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{child.attendanceRate}%</div>
                    <div className="text-xs text-green-600">Présence</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {child.recentPerformance[0]?.rank || '--'}
                    </div>
                    <div className="text-xs text-purple-600">Rang de classe</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700">{child.subjects.length}</div>
                    <div className="text-xs text-orange-600">Matières</div>
                  </div>
                </div>

                {/* Subjects Performance */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Performance par Matière
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {child.subjects.map((subject, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-sm">{subject.name}</h5>
                          <span className={`text-lg font-bold ${getSubjectGradeColor(subject.grade)}`}>
                            {subject.grade}/20
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{subject.teacher}</p>
                        <p className="text-xs text-muted-foreground">
                          Mis à jour: {new Date(subject.lastUpdate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Performance Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Évolution des Résultats
                    </h4>
                    <div className="space-y-3">
                      {child.recentPerformance.map((performance, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{performance.period}</p>
                            <p className="text-xs text-muted-foreground">
                              Rang {performance.rank}/{performance.totalStudents}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getSubjectGradeColor(performance.average)}`}>
                              {performance.average}/20
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Événements à Venir
                    </h4>
                    <div className="space-y-3">
                      {child.upcomingEvents.map((event, index) => {
                        const EventIcon = getEventIcon(event.type);
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                <EventIcon className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{event.title}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getEventColor(event.type)} variant="secondary">
                                  {event.type === 'test' ? 'Contrôle' : 
                                   event.type === 'assignment' ? 'Devoir' : 'Rendez-vous'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(event.date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir Notes
                  </Button>
                  <Button variant="outline" className="w-full">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Présences
                  </Button>
                  <Button variant="outline" className="w-full">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Devoirs
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Rapide</CardTitle>
          <CardDescription>
            Contactez l&apos;établissement pour toute question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Appeler École</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Direction</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Localiser École</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
