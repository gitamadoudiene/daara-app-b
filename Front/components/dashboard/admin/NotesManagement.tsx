'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileBarChart,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  BarChart3,
  PieChart,
  ListFilter,
  CalendarRange,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  School
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface NoteStats {
  average: number;
  highest: number;
  lowest: number;
  passRate: number;
  totalStudents: number;
}

interface EvaluationType {
  id: string;
  name: string;
  coef: number;
}

interface ClasseType {
  id: string;
  name: string;
  level: string;
}

interface SemestreType {
  id: string;
  name: string;
}

interface MatiereType {
  id: string;
  name: string;
}

interface NoteEntry {
  id: string;
  studentName: string;
  value: number;
  mention: string;
  status: 'success' | 'warning' | 'fail';
  date: string;
  semester: string;
  subject: string;
  evaluationType: string;
}

export function NotesManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('apercu');
  const [loading, setLoading] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState<string>('all');
  const [selectedSemestre, setSelectedSemestre] = useState<string>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('all');
  const [selectedMatiere, setSelectedMatiere] = useState<string>('all');

  const [classes, setClasses] = useState<ClasseType[]>([]);
  const [semestres, setSemestres] = useState<SemestreType[]>([
    { id: '1', name: 'Premier Semestre' },
    { id: '2', name: 'Deuxième Semestre' },
    { id: '3', name: 'Troisième Trimestre' }
  ]);
  
  const [matieres, setMatieres] = useState<MatiereType[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>([
    { id: '1', name: 'Devoir', coef: 1 },
    { id: '2', name: 'Examen', coef: 2 },
    { id: '3', name: 'Contrôle Continu', coef: 1.5 },
    { id: '4', name: 'Projet', coef: 2 }
  ]);

  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteEntry[]>([]);

  // Statistiques globales des notes
  const [noteStats, setNoteStats] = useState<NoteStats>({
    average: 0,
    highest: 0,
    lowest: 0,
    passRate: 0,
    totalStudents: 0
  });

  // Charger les classes de l'école
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('daara_token');
        const response = await fetch(`http://localhost:5000/api/classes/school/${user.schoolId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setClasses(data.map((cls: any) => ({ 
            id: cls._id,
            name: cls.name,
            level: cls.level
          })));
        } else {
          toast.error('Erreur lors du chargement des classes');
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.schoolId]);

  // Charger les matières
  useEffect(() => {
    // Simulation de chargement des matières (à remplacer par un appel API réel)
    const mockMatieres = [
      { id: '1', name: 'Mathématiques' },
      { id: '2', name: 'Français' },
      { id: '3', name: 'Sciences' },
      { id: '4', name: 'Histoire-Géographie' },
      { id: '5', name: 'Anglais' },
      { id: '6', name: 'Éducation Physique' }
    ];
    setMatieres(mockMatieres);
  }, []);

  // Charger les notes (mock data pour l'instant)
  useEffect(() => {
    // Fonction pour générer des notes aléatoires (à l'intérieur du useEffect)
    const generateMockNotesInternal = (count: number): NoteEntry[] => {
      const mockNotes: NoteEntry[] = [];
      
      for (let i = 0; i < count; i++) {
        const value = Math.round((Math.random() * 18 + 2) * 10) / 10; // Note entre 2 et 20
        let status: 'success' | 'warning' | 'fail';
        let mention = '';
        
        if (value >= 14) {
          status = 'success';
          mention = value >= 16 ? 'Très Bien' : 'Bien';
        } else if (value >= 10) {
          status = 'warning';
          mention = value >= 12 ? 'Assez Bien' : 'Passable';
        } else {
          status = 'fail';
          mention = 'Insuffisant';
        }
        
        const classeIndex = Math.floor(Math.random() * 6);
        const semestreIndex = Math.floor(Math.random() * semestres.length);
        const matiereIndex = Math.floor(Math.random() * 6);
        const evalTypeIndex = Math.floor(Math.random() * evaluationTypes.length);
        
        mockNotes.push({
          id: `C${classeIndex + 1}-${i}`,
          studentName: `Étudiant ${i + 1}`,
          value,
          mention,
          status,
          date: `2025-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 28) + 1}`,
          semester: semestres[semestreIndex].name,
          subject: ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie', 'Anglais', 'Éducation Physique'][matiereIndex],
          evaluationType: evaluationTypes[evalTypeIndex].name
        });
      }
      
      return mockNotes;
    };
    
    // Simulation de chargement des notes (à remplacer par un appel API réel)
    const mockNotes = generateMockNotesInternal(100);
    setNotes(mockNotes);
    setFilteredNotes(mockNotes);
    
    // Calculer les statistiques
    calculateStats(mockNotes);
  }, [semestres, evaluationTypes]);

  // Filtrer les notes selon les critères sélectionnés
  useEffect(() => {
    let filtered = [...notes];
    
    if (selectedClasse !== 'all') {
      filtered = filtered.filter(note => note.id.startsWith(selectedClasse)); // Simulé pour l'exemple
    }
    
    if (selectedSemestre !== 'all') {
      filtered = filtered.filter(note => note.semester === semestres.find(s => s.id === selectedSemestre)?.name);
    }
    
    if (selectedEvaluation !== 'all') {
      filtered = filtered.filter(note => note.evaluationType === evaluationTypes.find(e => e.id === selectedEvaluation)?.name);
    }
    
    if (selectedMatiere !== 'all') {
      filtered = filtered.filter(note => note.subject === matieres.find(m => m.id === selectedMatiere)?.name);
    }
    
    setFilteredNotes(filtered);
    calculateStats(filtered);
  }, [selectedClasse, selectedSemestre, selectedEvaluation, selectedMatiere, notes, semestres, evaluationTypes, matieres]);

  // La fonction generateMockNotes a été déplacée à l'intérieur du useEffect

  // Calculer les statistiques à partir des notes
  const calculateStats = (notesArray: NoteEntry[]) => {
    if (notesArray.length === 0) {
      setNoteStats({
        average: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
        totalStudents: 0
      });
      return;
    }
    
    const values = notesArray.map(n => n.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / values.length) * 10) / 10;
    const passing = notesArray.filter(n => n.value >= 10).length;
    
    setNoteStats({
      average: avg,
      highest: Math.max(...values),
      lowest: Math.min(...values),
      passRate: Math.round((passing / notesArray.length) * 100),
      totalStudents: new Set(notesArray.map(n => n.studentName)).size
    });
  };

  // Gérer l'export des données
  const handleExport = () => {
    toast.info('Export des données en cours...');
    setTimeout(() => {
      toast.success('Données exportées avec succès!');
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Examens & Notes</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Consultez et analysez les performances académiques des élèves
          </p>
        </div>
        <Button onClick={handleExport} size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exporter les Données
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Moyenne Générale</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{noteStats.average}/20</div>
            <p className="text-xs text-muted-foreground">
              {noteStats.average > 10 ? '↑ Bon niveau' : '↓ À améliorer'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Note la Plus Haute</CardTitle>
            <ChevronUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{noteStats.highest}/20</div>
            <p className="text-xs text-muted-foreground">
              Excellence
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Note la Plus Basse</CardTitle>
            <ChevronDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{noteStats.lowest}/20</div>
            <p className="text-xs text-muted-foreground">
              À surveiller
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Taux de Réussite</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{noteStats.passRate}%</div>
            <p className="text-xs text-muted-foreground">
              Des élèves ont la moyenne
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{noteStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Évalués
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classe-filter">Classe</Label>
              <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {classes.map(classe => (
                    <SelectItem key={classe.id} value={classe.id}>
                      {classe.name} ({classe.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="semestre-filter">Semestre/Trimestre</Label>
              <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les semestres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les semestres</SelectItem>
                  {semestres.map(semestre => (
                    <SelectItem key={semestre.id} value={semestre.id}>
                      {semestre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matiere-filter">Matière</Label>
              <Select value={selectedMatiere} onValueChange={setSelectedMatiere}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {matieres.map(matiere => (
                    <SelectItem key={matiere.id} value={matiere.id}>
                      {matiere.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="evaluation-filter">Type d&apos;Évaluation</Label>
              <Select value={selectedEvaluation} onValueChange={setSelectedEvaluation}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {evaluationTypes.map(evalType => (
                    <SelectItem key={evalType.id} value={evalType.id}>
                      {evalType.name} (Coef. {evalType.coef})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résultats et Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="apercu" className="text-xs sm:text-sm">Aperçu des Notes</TabsTrigger>
              <TabsTrigger value="performances" className="text-xs sm:text-sm">Performances</TabsTrigger>
              <TabsTrigger value="comparatif" className="text-xs sm:text-sm">Analyse Comparative</TabsTrigger>
              <TabsTrigger value="evolution" className="text-xs sm:text-sm">Évolution</TabsTrigger>
            </TabsList>

            <TabsContent value="apercu" className="space-y-4 pt-4">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Étudiant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Note
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mention
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Matière
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredNotes.slice(0, 10).map((note) => (
                        <tr key={note.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {note.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge className={getStatusColor(note.status)}>{note.value}/20</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {note.mention}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {note.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {note.evaluationType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {note.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredNotes.length > 10 && (
                  <div className="px-6 py-3 text-center bg-gray-50 text-sm text-gray-500">
                    Affichage des 10 premiers résultats sur {filteredNotes.length} au total
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performances" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribution des Notes</CardTitle>
                    <CardDescription>Répartition des notes par tranche</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Graphique de distribution des notes</p>
                        <p className="text-xs text-gray-400">(Simulation graphique - à implémenter)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performances par Matière</CardTitle>
                    <CardDescription>Moyennes comparées par discipline</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Graphique des moyennes par matière</p>
                        <p className="text-xs text-gray-400">(Simulation graphique - à implémenter)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Performances</CardTitle>
                  <CardDescription>Meilleures notes et mentions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rang
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Étudiant
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Matière
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Note
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Évaluation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredNotes
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 5)
                          .map((note, index) => (
                            <tr key={note.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {note.studentName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {note.subject}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Badge className="bg-green-100 text-green-800">{note.value}/20</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {note.evaluationType}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparatif" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Comparaison par Classe</CardTitle>
                    <CardDescription>Moyennes par classe</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Graphique comparatif entre classes</p>
                        <p className="text-xs text-gray-400">(Simulation graphique - à implémenter)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Comparaison par Semestre</CardTitle>
                    <CardDescription>Évolution entre périodes</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Graphique d&apos;évolution par période</p>
                        <p className="text-xs text-gray-400">(Simulation graphique - à implémenter)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Taux de Réussite par Type d&apos;Évaluation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type d&apos;Évaluation
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Moyenne
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Taux de Réussite
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre d&apos;Évaluations
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {evaluationTypes.map((type) => {
                          const typeNotes = filteredNotes.filter(n => n.evaluationType === type.name);
                          const avg = typeNotes.length > 0 
                            ? Math.round((typeNotes.reduce((sum, note) => sum + note.value, 0) / typeNotes.length) * 10) / 10 
                            : 0;
                          const passRate = typeNotes.length > 0 
                            ? Math.round((typeNotes.filter(n => n.value >= 10).length / typeNotes.length) * 100) 
                            : 0;
                          
                          return (
                            <tr key={type.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {type.name} (Coef. {type.coef})
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {avg}/20
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Badge className={passRate >= 70 ? 'bg-green-100 text-green-800' : passRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                                  {passRate}%
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {typeNotes.length}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evolution" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Évolution des Moyennes</CardTitle>
                  <CardDescription>Tendances sur l&apos;année scolaire</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Graphique d&apos;évolution temporelle</p>
                      <p className="text-xs text-gray-400">(Simulation graphique - à implémenter)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Award className="mr-2 h-4 w-4" />
                      Élèves en Progression
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(noteStats.totalStudents * 0.62)}
                      </div>
                      <div className="ml-2 text-xs">
                        <div className="text-green-600 font-semibold">+{Math.round(Math.random() * 15 + 5)}%</div>
                        <div className="text-gray-500">vs période précédente</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Élèves en Difficulté
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.round(noteStats.totalStudents * 0.28)}
                      </div>
                      <div className="ml-2 text-xs">
                        <div className="text-red-600 font-semibold">+{Math.round(Math.random() * 8 + 2)}%</div>
                        <div className="text-gray-500">vs période précédente</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Excellence Académique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(noteStats.totalStudents * 0.15)}
                      </div>
                      <div className="ml-2 text-xs">
                        <div className="text-blue-600 font-semibold">+{Math.round(Math.random() * 10 + 1)}%</div>
                        <div className="text-gray-500">vs période précédente</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}