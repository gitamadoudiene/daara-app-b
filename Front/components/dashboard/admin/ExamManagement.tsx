'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText,
  Calendar,
  BookOpen,
  User,
  Plus,
  Edit,
  Trash2,
  Award,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Exam {
  _id: string;
  name: string;
  subject: string;
  className: string;
  date: string;
  duration: number; // en minutes
  maxScore: number;
  status: 'planifié' | 'en cours' | 'terminé';
}

interface Grade {
  _id: string;
  studentName: string;
  examId: string;
  examName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface Class {
  _id: string;
  name: string;
  level: string;
}

interface Student {
  _id: string;
  name: string;
  class: string;
}

export function ExamManagement() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [examForm, setExamForm] = useState({
    name: '',
    subject: '',
    className: '',
    date: '',
    duration: '',
    maxScore: ''
  });

  const [gradeForm, setGradeForm] = useState({
    examId: '',
    studentId: '',
    score: ''
  });

  const subjects = [
    'Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie', 
    'Anglais', 'Arts', 'Éducation Physique', 'Informatique'
  ];

  // Charger les données
  useEffect(() => {
    if (user?.schoolId) {
      fetchClasses();
      fetchStudents();
      // Charger des données mock pour les examens
      loadMockData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.schoolId]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch(`http://localhost:5000/api/classes/school/${user?.schoolId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/users/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrer les étudiants de l'école
        const schoolStudents = data.filter((student: any) => student.schoolId === user?.schoolId);
        setStudents(schoolStudents);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    }
  };

  const loadMockData = () => {
    // Données mock pour démonstration
    const mockExams: Exam[] = [];
    const mockGrades: Grade[] = [];
    
    setExams(mockExams);
    setGrades(mockGrades);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const newExam: Exam = {
        _id: Date.now().toString(),
        name: examForm.name,
        subject: examForm.subject,
        className: examForm.className,
        date: examForm.date,
        duration: parseInt(examForm.duration),
        maxScore: parseInt(examForm.maxScore),
        status: 'planifié'
      };

      setExams([...exams, newExam]);
      toast.success('Examen créé avec succès');
      setIsCreateExamOpen(false);
      
      // Reset form
      setExamForm({
        name: '',
        subject: '',
        className: '',
        date: '',
        duration: '',
        maxScore: ''
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de l\'examen');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const exam = exams.find(e => e._id === gradeForm.examId);
      const student = students.find(s => s._id === gradeForm.studentId);
      
      if (!exam || !student) {
        toast.error('Examen ou étudiant non trouvé');
        return;
      }

      const score = parseInt(gradeForm.score);
      const percentage = Math.round((score / exam.maxScore) * 100);

      const newGrade: Grade = {
        _id: Date.now().toString(),
        studentName: student.name,
        examId: exam._id,
        examName: exam.name,
        score: score,
        maxScore: exam.maxScore,
        percentage: percentage
      };

      setGrades([...grades, newGrade]);
      toast.success('Note ajoutée avec succès');
      setIsAddGradeOpen(false);
      
      // Reset form
      setGradeForm({
        examId: '',
        studentId: '',
        score: ''
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout de la note');
    } finally {
      setLoading(false);
    }
  };

  const getGradesForExam = (examId: string) => {
    return grades.filter(grade => grade.examId === examId);
  };

  const getAverageForExam = (examId: string) => {
    const examGrades = getGradesForExam(examId);
    if (examGrades.length === 0) return 0;
    return examGrades.reduce((sum, grade) => sum + grade.percentage, 0) / examGrades.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Examens & Notes</h2>
          <p className="text-muted-foreground">
            Gérez les examens et les notes de {user?.school?.name}
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateExamOpen} onOpenChange={setIsCreateExamOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un examen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouvel examen</DialogTitle>
                <DialogDescription>
                  Planifiez un examen pour vos classes
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="exam-name">Nom de l&apos;examen</Label>
                    <Input
                      id="exam-name"
                      value={examForm.name}
                      onChange={(e) => setExamForm({...examForm, name: e.target.value})}
                      placeholder="Ex: Contrôle de Mathématiques"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-subject">Matière</Label>
                    <Select 
                      value={examForm.subject} 
                      onValueChange={(value) => setExamForm({...examForm, subject: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-class">Classe</Label>
                    <Select 
                      value={examForm.className} 
                      onValueChange={(value) => setExamForm({...examForm, className: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls._id} value={cls.name}>
                            {cls.name} - {cls.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-date">Date</Label>
                    <Input
                      id="exam-date"
                      type="date"
                      value={examForm.date}
                      onChange={(e) => setExamForm({...examForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-duration">Durée (minutes)</Label>
                    <Input
                      id="exam-duration"
                      type="number"
                      value={examForm.duration}
                      onChange={(e) => setExamForm({...examForm, duration: e.target.value})}
                      placeholder="120"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-maxscore">Note maximale</Label>
                    <Input
                      id="exam-maxscore"
                      type="number"
                      value={examForm.maxScore}
                      onChange={(e) => setExamForm({...examForm, maxScore: e.target.value})}
                      placeholder="20"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateExamOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Créer l&apos;examen
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddGradeOpen} onOpenChange={setIsAddGradeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Award className="mr-2 h-4 w-4" />
                Ajouter une note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une note</DialogTitle>
                <DialogDescription>
                  Saisissez la note d&apos;un étudiant pour un examen
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade-exam">Examen</Label>
                    <Select 
                      value={gradeForm.examId} 
                      onValueChange={(value) => setGradeForm({...gradeForm, examId: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un examen" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam._id} value={exam._id}>
                            {exam.name} - {exam.className} ({exam.subject})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade-student">Étudiant</Label>
                    <Select 
                      value={gradeForm.studentId} 
                      onValueChange={(value) => setGradeForm({...gradeForm, studentId: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un étudiant" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name} {student.class && `(${student.class})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade-score">Note</Label>
                    <Input
                      id="grade-score"
                      type="number"
                      step="0.5"
                      value={gradeForm.score}
                      onChange={(e) => setGradeForm({...gradeForm, score: e.target.value})}
                      placeholder="Note obtenue"
                      required
                    />
                    {gradeForm.examId && (
                      <p className="text-sm text-muted-foreground">
                        Note maximale: {exams.find(e => e._id === gradeForm.examId)?.maxScore}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddGradeOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Ajouter la note
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="exams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exams">
            Examens ({exams.length})
          </TabsTrigger>
          <TabsTrigger value="grades">
            Notes ({grades.length})
          </TabsTrigger>
          <TabsTrigger value="stats">
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-4">
          <div className="grid gap-4">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <Card key={exam._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        {exam.name}
                      </div>
                      <Badge 
                        variant={
                          exam.status === 'planifié' ? 'default' :
                          exam.status === 'en cours' ? 'secondary' : 'outline'
                        }
                      >
                        {exam.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {exam.subject} - {exam.className} • {new Date(exam.date).toLocaleDateString()} • {exam.duration}min
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Note maximale</p>
                          <p className="text-muted-foreground">{exam.maxScore} points</p>
                        </div>
                        <div>
                          <p className="font-medium">Notes saisies</p>
                          <p className="text-muted-foreground">{getGradesForExam(exam._id).length}</p>
                        </div>
                        <div>
                          <p className="font-medium">Moyenne</p>
                          <p className="text-muted-foreground">
                            {getAverageForExam(exam._id).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 h-3 w-3" />
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aucun examen programmé</p>
                  <p className="text-sm">Commencez par créer un examen pour vos classes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes des étudiants</CardTitle>
              <CardDescription>
                Vue d&apos;ensemble de toutes les notes saisies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="space-y-2">
                  {grades.map((grade) => (
                    <div key={grade._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium">{grade.studentName}</p>
                            <p className="text-sm text-muted-foreground">{grade.examName}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{grade.score}/{grade.maxScore}</p>
                          <p className="text-sm text-muted-foreground">{grade.percentage}%</p>
                        </div>
                        <Badge 
                          variant={grade.percentage >= 70 ? 'default' : grade.percentage >= 50 ? 'secondary' : 'destructive'}
                        >
                          {grade.percentage >= 70 ? 'Excellent' : grade.percentage >= 50 ? 'Passable' : 'Insuffisant'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aucune note saisie</p>
                  <p className="text-sm">Les notes apparaîtront ici une fois saisies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Statistiques générales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{exams.length}</div>
                    <div className="text-sm text-muted-foreground">Examens créés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{grades.length}</div>
                    <div className="text-sm text-muted-foreground">Notes saisies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {grades.length > 0 ? (grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length).toFixed(1) : '0'}%
                    </div>
                    <div className="text-sm text-muted-foreground">Moyenne générale</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}