'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, Calendar, TrendingUp, Save, Send } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface ExistingGrade {
  studentId: string;
  score: number | null;
  isAbsent: boolean;
  comment: string;
}

interface Evaluation {
  _id: string;
  title: string;
  type: string;
  classId: {
    name: string;
    level: string;
  };
  subjectId: {
    name: string;
    code: string;
  };
  plannedDate: string;
  maxScore: number;
  coefficient: number;
  status: string;
}

interface GradeEntryDialogProps {
  open: boolean;
  onClose: () => void;
  evaluation: Evaluation;
  onGradesSubmitted: () => void;
}

interface GradeEntry {
  studentId: string;
  score: string;
  isAbsent: boolean;
  comment: string;
}

const GradeEntryDialog: React.FC<GradeEntryDialogProps> = ({
  open,
  onClose,
  evaluation,
  onGradesSubmitted
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (open && evaluation) {
      fetchEvaluationData();
    }
  }, [open, evaluation]);

  const fetchEvaluationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('daara_token');
      
      const response = await fetch(`http://localhost:5000/api/evaluations/${evaluation._id}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const result = await response.json();
      console.log('DEBUG - API Response:', result);
      console.log('DEBUG - Students data:', result.data?.students);
      console.log('DEBUG - First student:', result.data?.students?.[0]);
      
      setStudents(result.data.students || []);
      console.log('[DEBUG] Students set in state:', result.data.students);
      
      // Initialiser les notes avec les données existantes
      const existingGrades = result.data.existingGrades || [];
      const initialGrades: Record<string, GradeEntry> = {};
      
      result.data.students.forEach((student: Student) => {
        console.log('DEBUG - Student object:', student);
        const existingGrade = existingGrades.find((g: ExistingGrade) => g.studentId === student._id);
        initialGrades[student._id] = {
          studentId: student._id,
          score: existingGrade?.score?.toString() || '',
          isAbsent: existingGrade?.isAbsent || false,
          comment: existingGrade?.comment || ''
        };
      });
      
      setGrades(initialGrades);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (studentId: string, field: keyof GradeEntry, value: any) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleAbsentToggle = (studentId: string, isAbsent: boolean) => {
    updateGrade(studentId, 'isAbsent', isAbsent);
    if (isAbsent) {
      updateGrade(studentId, 'score', '');
    }
  };

  const validateGrades = () => {
    const errors: string[] = [];
    
    Object.values(grades).forEach((grade, index) => {
      const student = students[index];
      if (!grade.isAbsent && grade.score !== '') {
        const score = parseFloat(grade.score);
        if (isNaN(score) || score < 0 || score > evaluation.maxScore) {
          errors.push(`Note invalide pour ${student?.name}: doit être entre 0 et ${evaluation.maxScore}`);
        }
      }
    });
    
    return errors;
  };

  const handleSaveGrades = async () => {
    try {
      console.log('[DEBUG] Début sauvegarde des notes');
      console.log('[DEBUG] evaluation._id:', evaluation._id);
      setSaving(true);
      setError(null);

      const validationErrors = validateGrades();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      const token = localStorage.getItem('daara_token');
      
      const gradesData = Object.values(grades).map(grade => ({
        studentId: grade.studentId,
        score: grade.isAbsent ? null : (grade.score ? parseFloat(grade.score) : null),
        isAbsent: grade.isAbsent,
        comment: grade.comment
      }));

      console.log('[DEBUG] Notes à sauvegarder:', JSON.stringify(gradesData, null, 2));

      const response = await fetch(`http://localhost:5000/api/evaluations/${evaluation._id}/grades`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grades: gradesData })
      });
      
      console.log('[DEBUG] Réponse du serveur - Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      onGradesSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishGrades = async () => {
    try {
      setPublishing(true);
      setError(null);

      // D'abord sauvegarder les notes
      await handleSaveGrades();

      // Puis publier
      const token = localStorage.getItem('daara_token');
      
      const response = await fetch(`http://localhost:5000/api/evaluations/${evaluation._id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la publication');
      }

      onGradesSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la publication');
    } finally {
      setPublishing(false);
    }
  };

  const getCompletionStats = () => {
    const total = students.length;
    const completed = Object.values(grades).filter(g => g.isAbsent || g.score !== '').length;
    const absent = Object.values(grades).filter(g => g.isAbsent).length;
    const graded = Object.values(grades).filter(g => !g.isAbsent && g.score !== '').length;
    
    return { total, completed, absent, graded };
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Saisie des notes - {evaluation.title}</DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {evaluation.subjectId.name}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {evaluation.classId.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(evaluation.plannedDate).toLocaleDateString('fr-FR')}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Coeff: {evaluation.coefficient}
            </span>
            <Badge>{evaluation.type}</Badge>
            <Badge variant="outline">/{evaluation.maxScore}</Badge>
          </div>
        </DialogHeader>

        {error && (
          <Alert className="mb-4">
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistiques */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex gap-6">
                <span><strong>Total élèves:</strong> {stats.total}</span>
                <span><strong>Notes saisies:</strong> {stats.graded}</span>
                <span><strong>Absents:</strong> {stats.absent}</span>
                <span><strong>Progression:</strong> {stats.completed}/{stats.total}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleSaveGrades}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                {evaluation.status !== 'publiee' && (
                  <Button 
                    size="sm" 
                    onClick={handlePublishGrades}
                    disabled={publishing || stats.completed < stats.total}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {publishing ? 'Publication...' : 'Publier les notes'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des élèves */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {students.map((student) => {
              console.log('[DEBUG] Rendering student:', student);
              const grade = grades[student._id] || { studentId: student._id, score: '', isAbsent: false, comment: '' };
              
              return (
                <Card key={student._id} className={grade.isAbsent ? 'bg-gray-50' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      {/* Nom de l'élève */}
                      <div className="flex-1">
                        <div className="flex flex-col">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-sm text-gray-500">{student.email}</span>
                        </div>
                      </div>

                      {/* Checkbox absent */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={grade.isAbsent}
                          onCheckedChange={(checked) => handleAbsentToggle(student._id, checked as boolean)}
                        />
                        <Label className="text-sm">Absent</Label>
                      </div>

                      {/* Note */}
                      <div className="w-20">
                        <Input
                          type="number"
                          step="0.25"
                          min="0"
                          max={evaluation.maxScore}
                          value={grade.score}
                          onChange={(e) => updateGrade(student._id, 'score', e.target.value)}
                          disabled={grade.isAbsent}
                          placeholder={`/${evaluation.maxScore}`}
                          className="text-center"
                        />
                      </div>

                      {/* Commentaire */}
                      <div className="w-64">
                        <Input
                          value={grade.comment}
                          onChange={(e) => updateGrade(student._id, 'comment', e.target.value)}
                          placeholder="Commentaire (optionnel)"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button 
            onClick={handleSaveGrades}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          {evaluation.status !== 'publiee' && (
            <Button 
              onClick={handlePublishGrades}
              disabled={publishing || stats.completed < stats.total}
            >
              <Send className="h-4 w-4 mr-1" />
              {publishing ? 'Publication...' : 'Publier les notes'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeEntryDialog;