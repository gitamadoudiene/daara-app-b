import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Save, Eye, Users, Calculator, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/router';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface ExistingGrade {
  studentId: string;
  score?: number;
  isAbsent: boolean;
  comment?: string;
}

interface Evaluation {
  _id: string;
  title: string;
  description?: string;
  type: string;
  plannedDate: string;
  maxScore: number;
  coefficient: number;
  status: string;
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
}

interface GradeForm {
  studentId: string;
  score?: number;
  isAbsent: boolean;
  comment?: string;
}

const GradeSubmission: React.FC = () => {
  const router = useRouter();
  const { evaluationId } = router.query;
  
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [existingGrades, setExistingGrades] = useState<ExistingGrade[]>([]);
  const [grades, setGrades] = useState<GradeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const token = localStorage.getItem('daara_token');

  useEffect(() => {
    if (evaluationId) {
      loadEvaluationData();
    }
  }, [evaluationId]);

  const loadEvaluationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/evaluations/${evaluationId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'évaluation');
      }

      const data = await response.json();
      setEvaluation(data.data.evaluation);
      setStudents(data.data.students);
      setExistingGrades(data.data.existingGrades);

      // Initialiser le formulaire avec les notes existantes ou des valeurs vides
      const initialGrades = data.data.students.map((student: Student) => {
        const existingGrade = data.data.existingGrades.find(
          (grade: ExistingGrade) => grade.studentId === student._id
        );
        
        return {
          studentId: student._id,
          score: existingGrade?.score,
          isAbsent: existingGrade?.isAbsent || false,
          comment: existingGrade?.comment || ''
        };
      });
      
      setGrades(initialGrades);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (studentId: string, field: keyof GradeForm, value: any) => {
    setGrades(prev => prev.map(grade => 
      grade.studentId === studentId 
        ? { ...grade, [field]: value }
        : grade
    ));
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const score = value === '' ? undefined : parseFloat(value);
    if (score !== undefined && (score < 0 || score > (evaluation?.maxScore || 20))) {
      return; // Ignore les valeurs invalides
    }
    updateGrade(studentId, 'score', score);
  };

  const handleAbsentChange = (studentId: string, isAbsent: boolean) => {
    updateGrade(studentId, 'isAbsent', isAbsent);
    if (isAbsent) {
      updateGrade(studentId, 'score', undefined);
    }
  };

  const calculateStats = () => {
    const validGrades = grades.filter(g => !g.isAbsent && g.score !== undefined);
    const absentCount = grades.filter(g => g.isAbsent).length;
    const totalGrades = validGrades.length;
    
    if (totalGrades === 0) {
      return { average: 0, min: 0, max: 0, absentCount, totalGrades, totalStudents: students.length };
    }
    
    const scores = validGrades.map(g => g.score!);
    const average = scores.reduce((sum, score) => sum + score, 0) / totalGrades;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    return {
      average: Math.round(average * 100) / 100,
      min,
      max,
      absentCount,
      totalGrades,
      totalStudents: students.length
    };
  };

  const validateGrades = () => {
    const errors: string[] = [];
    
    grades.forEach((grade, index) => {
      const student = students.find(s => s._id === grade.studentId);
      if (!student) return;
      
      if (!grade.isAbsent && (grade.score === undefined || grade.score === null)) {
        errors.push(`Note manquante pour ${student.name}`);
      }
      
      if (grade.score !== undefined && (grade.score < 0 || grade.score > (evaluation?.maxScore || 20))) {
        errors.push(`Note invalide pour ${student.name} (doit être entre 0 et ${evaluation?.maxScore || 20})`);
      }
    });
    
    return errors;
  };

  const handleSaveGrades = async () => {
    const validationErrors = validateGrades();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const gradesData = grades.map(grade => ({
        studentId: grade.studentId,
        score: grade.isAbsent ? null : grade.score,
        isAbsent: grade.isAbsent,
        comment: grade.comment
      }));

      const response = await fetch(`http://localhost:5000/api/evaluations/${evaluationId}/grades`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grades: gradesData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde des notes');
      }

      setSuccess('Notes sauvegardées avec succès !');
      
      // Recharger les données pour mettre à jour le statut
      await loadEvaluationData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishGrades = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/evaluations/${evaluationId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la publication des notes');
      }

      setSuccess('Notes publiées avec succès ! Les élèves peuvent maintenant les consulter.');
      setShowPublishDialog(false);
      
      // Recharger les données
      await loadEvaluationData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (!evaluation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Évaluation non trouvée</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{evaluation.title}</h1>
          <p className="text-gray-600">
            {evaluation.classId.name} - {evaluation.subjectId.name} - 
            {new Date(evaluation.plannedDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              <div className="text-sm text-gray-600">Élèves total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalGrades}</div>
              <div className="text-sm text-gray-600">Notes saisies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.absentCount}</div>
              <div className="text-sm text-gray-600">Absents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.average}</div>
              <div className="text-sm text-gray-600">Moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Min: <span className="font-bold">{stats.min}</span> / 
                Max: <span className="font-bold">{stats.max}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau de saisie des notes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Saisie des Notes
              </CardTitle>
              <CardDescription>
                Note sur {evaluation.maxScore} - Coefficient: {evaluation.coefficient}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveGrades} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              
              {evaluation.status === 'corrigee' && (
                <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
                  <DialogTrigger asChild>
                    <Button variant="default">
                      <Eye className="h-4 w-4 mr-2" />
                      Publier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Publier les notes</DialogTitle>
                      <DialogDescription>
                        Êtes-vous sûr de vouloir publier ces notes ? Une fois publiées, 
                        les élèves et parents pourront les consulter. Cette action est irréversible.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handlePublishGrades} disabled={saving}>
                        {saving ? 'Publication...' : 'Publier'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead className="w-24">Note /{evaluation.maxScore}</TableHead>
                <TableHead className="w-20">Absent</TableHead>
                <TableHead>Commentaire</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const grade = grades.find(g => g.studentId === student._id);
                if (!grade) return null;

                return (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={evaluation.maxScore}
                        step="0.25"
                        value={grade.score || ''}
                        onChange={(e) => handleScoreChange(student._id, e.target.value)}
                        disabled={grade.isAbsent}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={grade.isAbsent}
                        onCheckedChange={(checked) => handleAbsentChange(student._id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={grade.comment || ''}
                        onChange={(e) => updateGrade(student._id, 'comment', e.target.value)}
                        placeholder="Commentaire optionnel"
                        className="w-full"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions finales */}
      <div className="flex justify-between items-center">
        <Badge variant={evaluation.status === 'publiee' ? 'default' : 'secondary'}>
          Statut: {evaluation.status === 'publiee' ? 'Publié' : 'Brouillon'}
        </Badge>
        
        <div className="text-sm text-gray-600">
          {stats.totalGrades} notes saisies sur {stats.totalStudents} élèves
        </div>
      </div>
    </div>
  );
};

export default GradeSubmission;