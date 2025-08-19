'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, BookOpen, Eye, Edit, BarChart3 } from 'lucide-react';

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  level: string;
  students: number;
  schedule: string;
  nextClass: string;
  averageGrade: number;
  attendanceRate: number;
}

export function MyClasses() {
  // Mock data for classes
  const classes: ClassInfo[] = [
    {
      id: '1',
      name: '6ème A',
      subject: 'Mathématiques',
      level: '6ème',
      students: 28,
      schedule: 'Lun, Mer, Ven - 08:00',
      nextClass: '2024-07-23 08:00',
      averageGrade: 14.5,
      attendanceRate: 92
    },
    {
      id: '2',
      name: '5ème B',
      subject: 'Mathématiques',
      level: '5ème',
      students: 32,
      schedule: 'Mar, Jeu - 09:30',
      nextClass: '2024-07-23 09:30',
      averageGrade: 13.8,
      attendanceRate: 88
    },
    {
      id: '3',
      name: '4ème A',
      subject: 'Mathématiques',
      level: '4ème',
      students: 25,
      schedule: 'Lun, Mer, Ven - 11:00',
      nextClass: '2024-07-23 11:00',
      averageGrade: 15.2,
      attendanceRate: 95
    },
    {
      id: '4',
      name: '3ème C',
      subject: 'Mathématiques',
      level: '3ème',
      students: 30,
      schedule: 'Mar, Jeu - 14:30',
      nextClass: '2024-07-23 14:30',
      averageGrade: 12.9,
      attendanceRate: 89
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Mes Classes</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez toutes vos classes et suivez leurs progrès
          </p>
        </div>
        <Button>
          <BookOpen className="mr-2 h-4 w-4" />
          Nouvelle Classe
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {classes.map((classInfo) => (
          <Card key={classInfo.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{classInfo.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <span>{classInfo.subject}</span>
                    <Badge variant="outline">{classInfo.level}</Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{classInfo.students}</div>
                  <div className="text-xs text-muted-foreground">étudiants</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Schedule */}
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{classInfo.schedule}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-700">
                      {classInfo.averageGrade}/20
                    </div>
                    <div className="text-xs text-green-600">Moyenne</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700">
                      {classInfo.attendanceRate}%
                    </div>
                    <div className="text-xs text-blue-600">Présence</div>
                  </div>
                </div>

                {/* Next Class */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Prochain cours</div>
                  <div className="text-sm font-medium">
                    {new Date(classInfo.nextClass).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Stats
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
