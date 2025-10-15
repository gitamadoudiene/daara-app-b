import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, BookOpen, Users, TrendingUp, Eye, Edit, Trash2, Plus } from 'lucide-react';

interface Evaluation {
  _id: string;
  title: string;
  description?: string;
  type: 'devoir' | 'examen' | 'projet' | 'presentation' | 'participation';
  plannedDate: string;
  semester: number;
  academicYear: string;
  status: 'programmee' | 'en_cours' | 'terminee' | 'corrigee' | 'publiee' | 'annulee';
  coefficient: number;
  maxScore: number;
  classId: {
    _id: string;
    name: string;
    level: string;
  };
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  stats?: {
    totalStudents: number;
    submittedGrades: number;
    averageScore?: number;
    absentCount: number;
  };
}

interface Class {
  _id: string;
  name: string;
  level: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

const EvaluationManagement: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025');

  // État pour le formulaire de création d'évaluation
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    type: 'devoir',
    title: '',
    description: '',
    plannedDate: '',
    semester: 1,
    academicYear: '2024-2025',
    coefficient: 1,
    maxScore: 20,
    duration: 60,
    instructions: ''
  });

  const token = localStorage.getItem('daara_token');

  useEffect(() => {
    loadData();
  }, [selectedSemester, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEvaluations(),
        loadClasses(),
        loadSubjects()
      ]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluations = async () => {
    const response = await fetch(`http://localhost:5000/api/evaluations/teacher?semester=${selectedSemester}&academicYear=${selectedYear}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des évaluations');
    }

    const data = await response.json();
    setEvaluations(data.data);
  };

  const loadClasses = async () => {
    const response = await fetch('http://localhost:5000/api/teachers/classes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des classes');
    }

    const data = await response.json();
    setClasses(data.data);
  };

  const loadSubjects = async () => {
    const response = await fetch('http://localhost:5000/api/subjects/school/68c7700cd9f7c4207d3c9ea6', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des matières');
    }

    const data = await response.json();
    setSubjects(data.data);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Validation côté client améliorée
      if (!formData.classId) {
        throw new Error('Veuillez sélectionner une classe');
      }
      if (!formData.subjectId) {
        throw new Error('Veuillez sélectionner une matière');
      }
      if (!formData.title.trim()) {
        throw new Error('Veuillez saisir un titre pour l\'évaluation');
      }
      if (!formData.plannedDate) {
        throw new Error('Veuillez sélectionner une date pour l\'évaluation');
      }
      if (!formData.type) {
        throw new Error('Veuillez sélectionner un type d\'évaluation');
      }

      console.log('Données du formulaire avant soumission:', formData);

      const response = await fetch('http://localhost:5000/api/evaluations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de l\'évaluation');
      }

      setSuccess('Évaluation programmée avec succès !');
      setFormData({
        classId: '',
        subjectId: '',
        type: 'devoir',
        title: '',
        description: '',
        plannedDate: '',
        semester: 1,
        academicYear: '2024-2025',
        coefficient: 1,
        maxScore: 20,
        duration: 60,
        instructions: ''
      });
      
      await loadEvaluations();
      setActiveTab('list');
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      setError(error.message || 'Une erreur est survenue lors de la création de l\'évaluation');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'programmee': { color: 'bg-blue-100 text-blue-800', label: 'Programmée' },
      'en_cours': { color: 'bg-yellow-100 text-yellow-800', label: 'En cours' },
      'terminee': { color: 'bg-green-100 text-green-800', label: 'Terminée' },
      'corrigee': { color: 'bg-purple-100 text-purple-800', label: 'Corrigée' },
      'publiee': { color: 'bg-green-100 text-green-800', label: 'Publiée' },
      'annulee': { color: 'bg-red-100 text-red-800', label: 'Annulée' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.programmee;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'devoir': <BookOpen className="h-4 w-4" />,
      'examen': <Calendar className="h-4 w-4" />,
      'projet': <Users className="h-4 w-4" />,
      'presentation': <Eye className="h-4 w-4" />,
      'participation': <TrendingUp className="h-4 w-4" />
    };
    
    return icons[type as keyof typeof icons] || icons.devoir;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Évaluations</h1>
        <div className="flex gap-4">
          <Select value={selectedSemester.toString()} onValueChange={(value) => setSelectedSemester(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Semestre 1</SelectItem>
              <SelectItem value="2">Semestre 2</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
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

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Mes Évaluations</TabsTrigger>
          <TabsTrigger value="create">Programmer une Évaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {evaluations.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Aucune évaluation programmée pour ce semestre.</p>
                  <Button className="mt-4" onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Programmer une évaluation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              evaluations.map((evaluation) => (
                <Card key={evaluation._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(evaluation.type)}
                          <h3 className="text-lg font-semibold">{evaluation.title}</h3>
                          {getStatusBadge(evaluation.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Classe:</span> {evaluation.classId.name}
                          </div>
                          <div>
                            <span className="font-medium">Matière:</span> {evaluation.subjectId.name}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(evaluation.plannedDate).toLocaleDateString('fr-FR')}
                          </div>
                          <div>
                            <span className="font-medium">Coefficient:</span> {evaluation.coefficient}
                          </div>
                        </div>

                        {evaluation.description && (
                          <p className="text-sm text-gray-600 mt-2">{evaluation.description}</p>
                        )}

                        {evaluation.stats && (
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-blue-600">
                              {evaluation.stats.submittedGrades}/{evaluation.stats.totalStudents} notes saisies
                            </span>
                            {evaluation.stats.averageScore && (
                              <span className="text-green-600">
                                Moyenne: {evaluation.stats.averageScore.toFixed(2)}/20
                              </span>
                            )}
                            {evaluation.stats.absentCount > 0 && (
                              <span className="text-orange-600">
                                {evaluation.stats.absentCount} absent(s)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {evaluation.status === 'programmee' && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {(evaluation.status === 'programmee' || evaluation.status === 'corrigee') && (
                          <Button size="sm" onClick={() => window.location.href = `/evaluations/${evaluation._id}/grades`}>
                            <BookOpen className="h-4 w-4 mr-1" />
                            Saisir notes
                          </Button>
                        )}
                        
                        {evaluation.status === 'corrigee' && (
                          <Button size="sm" variant="default">
                            <Eye className="h-4 w-4 mr-1" />
                            Publier
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Programmer une Nouvelle Évaluation</CardTitle>
              <CardDescription>
                Créez une évaluation pour planifier la saisie des notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitEvaluation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="classId">Classe *</Label>
                    <Select value={formData.classId} onValueChange={(value) => setFormData({...formData, classId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(classe => (
                          <SelectItem key={classe._id} value={classe._id}>
                            {classe.name} ({classe.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subjectId">Matière *</Label>
                    <Select value={formData.subjectId} onValueChange={(value) => setFormData({...formData, subjectId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type d'évaluation *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="devoir">Devoir</SelectItem>
                        <SelectItem value="examen">Examen</SelectItem>
                        <SelectItem value="projet">Projet</SelectItem>
                        <SelectItem value="presentation">Présentation</SelectItem>
                        <SelectItem value="participation">Participation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plannedDate">Date prévue *</Label>
                    <Input
                      id="plannedDate"
                      type="datetime-local"
                      value={formData.plannedDate}
                      onChange={(e) => setFormData({...formData, plannedDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coefficient">Coefficient</Label>
                    <Input
                      id="coefficient"
                      type="number"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={formData.coefficient}
                      onChange={(e) => setFormData({...formData, coefficient: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Note maximale</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'évaluation *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Contrôle de mathématiques - Chapitre 3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description optionnelle de l'évaluation"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('list')}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Programmer l'évaluation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvaluationManagement;