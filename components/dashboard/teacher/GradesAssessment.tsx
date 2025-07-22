'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, Upload, Filter } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  class: string;
  type: 'devoir' | 'controle' | 'oral' | 'projet';
  date: string;
  totalStudents: number;
  gradedStudents: number;
  averageGrade: number;
  status: 'pending' | 'inProgress' | 'completed';
}

export function GradesAssessment() {
  // Mock data for assessments
  const assessments: Assessment[] = [
    {
      id: '1',
      title: 'Contrôle Fractions',
      class: '6ème A',
      type: 'controle',
      date: '2024-07-20',
      totalStudents: 28,
      gradedStudents: 28,
      averageGrade: 14.5,
      status: 'completed'
    },
    {
      id: '2',
      title: 'Devoir Géométrie',
      class: '5ème B',
      type: 'devoir',
      date: '2024-07-22',
      totalStudents: 32,
      gradedStudents: 25,
      averageGrade: 13.2,
      status: 'inProgress'
    },
    {
      id: '3',
      title: 'Exposé Mathématiques',
      class: '4ème A',
      type: 'oral',
      date: '2024-07-23',
      totalStudents: 25,
      gradedStudents: 0,
      averageGrade: 0,
      status: 'pending'
    },
    {
      id: '4',
      title: 'Projet Algèbre',
      class: '3ème C',
      type: 'projet',
      date: '2024-07-21',
      totalStudents: 30,
      gradedStudents: 18,
      averageGrade: 15.8,
      status: 'inProgress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'inProgress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'inProgress': return 'En cours';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'devoir': return 'Devoir';
      case 'controle': return 'Contrôle';
      case 'oral': return 'Oral';
      case 'projet': return 'Projet';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'devoir': return 'bg-blue-100 text-blue-800';
      case 'controle': return 'bg-purple-100 text-purple-800';
      case 'oral': return 'bg-orange-100 text-orange-800';
      case 'projet': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Notes & Évaluations</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les évaluations et saisissez les notes de vos étudiants
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Évaluation
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher une évaluation..." className="pl-8" />
              </div>
            </div>
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
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="devoir">Devoir</SelectItem>
                <SelectItem value="controle">Contrôle</SelectItem>
                <SelectItem value="oral">Oral</SelectItem>
                <SelectItem value="projet">Projet</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{assessment.class}</Badge>
                    <Badge className={getTypeColor(assessment.type)}>
                      {getTypeLabel(assessment.type)}
                    </Badge>
                    <Badge className={getStatusColor(assessment.status)}>
                      {getStatusLabel(assessment.status)}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(assessment.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression de la correction</span>
                    <span>{assessment.gradedStudents}/{assessment.totalStudents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(assessment.gradedStudents / assessment.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700">
                      {assessment.totalStudents}
                    </div>
                    <div className="text-xs text-blue-600">Étudiants</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-semibold text-yellow-700">
                      {assessment.gradedStudents}
                    </div>
                    <div className="text-xs text-yellow-600">Corrigés</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-semibold text-red-700">
                      {assessment.totalStudents - assessment.gradedStudents}
                    </div>
                    <div className="text-xs text-red-600">En attente</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-700">
                      {assessment.averageGrade > 0 ? `${assessment.averageGrade}/20` : '--'}
                    </div>
                    <div className="text-xs text-green-600">Moyenne</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button size="sm" className="flex-1">
                    Saisir Notes
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Importer
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Statistiques
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
