'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface CreateEvaluationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const CreateEvaluationDialog: React.FC<CreateEvaluationDialogProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    type: '',
    title: '',
    description: '',
    plannedDate: '',
    semester: '',
    academicYear: '2024-2025',
    duration: '',
    maxScore: '20',
    coefficient: '',
    instructions: '',
    topics: ''
  });

  useEffect(() => {
    if (open) {
      fetchClasses();
      fetchSubjects();
    }
  }, [open]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      const response = await fetch('http://localhost:5000/api/teachers/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setClasses(result.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement classes:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('daara_token');
      // Récupérer l'ID de l'école depuis le token ou le contexte
      const schoolId = '68c7700cd9f7c4207d3c9ea6'; // À rendre dynamique
      
      const response = await fetch(`http://localhost:5000/api/subjects/school/${schoolId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSubjects(result.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement matières:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.classId || !formData.subjectId || !formData.type || !formData.title || !formData.plannedDate) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Préparer les données
      const evaluationData = {
        ...formData,
        plannedDate: new Date(formData.plannedDate).toISOString(),
        semester: parseInt(formData.semester),
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        maxScore: parseInt(formData.maxScore),
        coefficient: formData.coefficient ? parseFloat(formData.coefficient) : undefined,
        topics: formData.topics ? formData.topics.split(',').map(t => t.trim()) : []
      };

      await onSubmit(evaluationData);
      
      // Réinitialiser le formulaire
      setFormData({
        classId: '',
        subjectId: '',
        type: '',
        title: '',
        description: '',
        plannedDate: '',
        semester: '',
        academicYear: '2024-2025',
        duration: '',
        maxScore: '20',
        coefficient: '',
        instructions: '',
        topics: ''
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programmer une nouvelle évaluation</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Classe et Matière */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="classId">Classe *</Label>
              <Select
                value={formData.classId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe._id} value={classe._id}>
                      {classe.name} ({classe.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subjectId">Matière *</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type et Titre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type d'évaluation *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="devoir">Devoir (Contrôle continu)</SelectItem>
                  <SelectItem value="examen">Examen</SelectItem>
                  <SelectItem value="projet">Projet</SelectItem>
                  <SelectItem value="presentation">Présentation</SelectItem>
                  <SelectItem value="participation">Participation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Titre de l'évaluation *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Devoir sur les équations"
              />
            </div>
          </div>

          {/* Date et Semestre */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="plannedDate">Date prévue *</Label>
              <Input
                id="plannedDate"
                type="date"
                value={formData.plannedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="semester">Semestre *</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semestre 1</SelectItem>
                  <SelectItem value="2">Semestre 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="60"
              />
            </div>
          </div>

          {/* Note max et Coefficient */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxScore">Note maximale</Label>
              <Input
                id="maxScore"
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData(prev => ({ ...prev, maxScore: e.target.value }))}
                placeholder="20"
              />
            </div>

            <div>
              <Label htmlFor="coefficient">Coefficient (optionnel)</Label>
              <Input
                id="coefficient"
                type="number"
                step="0.5"
                value={formData.coefficient}
                onChange={(e) => setFormData(prev => ({ ...prev, coefficient: e.target.value }))}
                placeholder="Auto (basé sur la matière)"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description optionnelle de l'évaluation"
              rows={2}
            />
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions">Instructions pour les élèves</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Instructions spécifiques pour cette évaluation"
              rows={2}
            />
          </div>

          {/* Sujets/Chapitres */}
          <div>
            <Label htmlFor="topics">Sujets/Chapitres couverts</Label>
            <Input
              id="topics"
              value={formData.topics}
              onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
              placeholder="Séparer par des virgules: Chapitre 1, Chapitre 2"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Programmation...' : 'Programmer l\'évaluation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEvaluationDialog;