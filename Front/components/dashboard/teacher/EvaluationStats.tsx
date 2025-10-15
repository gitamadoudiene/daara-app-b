'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Target, Calculator } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EvaluationStats {
  evaluationId: string;
  title: string;
  subject: string;
  type: string;
  totalStudents: number;
  gradedStudents: number;
  absentStudents: number;
  averageScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  coefficient: number;
  maxPossibleScore: number;
  
  // Distribution des notes
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  
  // Statistiques par niveau
  performanceStats: {
    excellent: number; // 16-20
    good: number; // 12-15.99
    average: number; // 10-11.99
    below: number; // 0-9.99
  };
  
  // Comparaison avec la classe
  classComparison?: {
    classAverage: number;
    evaluationAverage: number;
    difference: number;
    betterThanClass: boolean;
  };
}

interface EvaluationStatsProps {
  evaluationId: string;
  onClose: () => void;
}

export function EvaluationStats({ evaluationId, onClose }: EvaluationStatsProps) {
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/evaluations/${evaluationId}/stats`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('daara_token')}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les statistiques.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du chargement des statistiques.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (evaluationId) {
      fetchStats();
    }
  }, [evaluationId, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Aucune statistique disponible.</p>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 16) return 'text-green-600 bg-green-50';
    if (score >= 12) return 'text-blue-600 bg-blue-50';
    if (score >= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 16) return 'Excellent';
    if (score >= 12) return 'Bien';
    if (score >= 10) return 'Moyen';
    return 'Insuffisant';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{stats.title}</h3>
          <p className="text-sm text-gray-600">
            {stats.subject} • {stats.type} • Coefficient {stats.coefficient}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <div className="text-xs text-gray-600">Total étudiants</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.gradedStudents}</div>
            <div className="text-xs text-gray-600">Corrigés</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calculator className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
            <div className="text-xs text-gray-600">Moyenne</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{stats.medianScore.toFixed(1)}</div>
            <div className="text-xs text-gray-600">Médiane</div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution des performances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition des performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-700">
                {stats.performanceStats.excellent}
              </div>
              <div className="text-xs text-green-600">Excellent (16-20)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">
                {stats.performanceStats.good}
              </div>
              <div className="text-xs text-blue-600">Bien (12-16)</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-700">
                {stats.performanceStats.average}
              </div>
              <div className="text-xs text-yellow-600">Moyen (10-12)</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-700">
                {stats.performanceStats.below}
              </div>
              <div className="text-xs text-red-600">Insuffisant (&lt;10)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution détaillée */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribution des notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.scoreDistribution.map((dist, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm font-medium">{dist.range}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300" 
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {dist.count} ({dist.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistiques détaillées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Note minimale:</span>
              <Badge className={getPerformanceColor(stats.minScore)}>
                {stats.minScore.toFixed(1)}/20
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Note maximale:</span>
              <Badge className={getPerformanceColor(stats.maxScore)}>
                {stats.maxScore.toFixed(1)}/20
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Étudiants absents:</span>
              <Badge variant="secondary">{stats.absentStudents}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Taux de participation:</span>
              <Badge variant="outline">
                {((stats.gradedStudents / stats.totalStudents) * 100).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {stats.classComparison && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparaison avec la classe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Moyenne de la classe:</span>
                <span className="font-medium">{stats.classComparison.classAverage.toFixed(1)}/20</span>
              </div>
              <div className="flex justify-between">
                <span>Moyenne évaluation:</span>
                <span className="font-medium">{stats.classComparison.evaluationAverage.toFixed(1)}/20</span>
              </div>
              <div className="flex justify-between">
                <span>Différence:</span>
                <Badge className={
                  stats.classComparison.betterThanClass 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }>
                  {stats.classComparison.betterThanClass ? '+' : ''}
                  {stats.classComparison.difference.toFixed(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}