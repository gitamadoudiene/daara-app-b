import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Types
interface Teacher {
  _id: string;
  id?: string;
  name: string;
  subjects?: string[];
}

interface Subject {
  id: string;
  name: string;
}

interface CreateClassFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  initialData?: any;
  schoolTeachers: Teacher[];
  availableSubjects: Subject[];
  loadingTeachers: boolean;
  loadingSubjects: boolean;
  schoolName?: string;
  isEdit?: boolean;
}

export function CreateClassForm({
  onSubmit,
  onCancel,
  initialData = {},
  schoolTeachers = [],
  availableSubjects = [],
  loadingTeachers = false,
  loadingSubjects = false,
  schoolName = '',
  isEdit = false
}: CreateClassFormProps) {
  // État du formulaire avec valeurs par défaut ou valeurs initiales si fournies
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    level: initialData.level || '',
    capacity: initialData.capacity || 40,
    room: initialData.room || '',
    teacherId: initialData.teacherId || 'none',
    subjects: initialData.subjects || [],
    academicYear: initialData.academicYear || ''
  });

  // Gestionnaire de soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Gestionnaires de changement
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Gestion des sujets avec cases à cocher
  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subjectId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(id => id !== subjectId)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}class-name`}>Nom de la Classe</Label>
          <Input 
            id={`${isEdit ? 'edit-' : ''}class-name`} 
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: 6ème A, CM2 B" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}class-level`}>Niveau</Label>
          <Select 
            value={formData.level}
            onValueChange={(value) => handleChange('level', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CP">CP - Cours Préparatoire</SelectItem>
              <SelectItem value="CE1">CE1 - Cours Élémentaire 1</SelectItem>
              <SelectItem value="CE2">CE2 - Cours Élémentaire 2</SelectItem>
              <SelectItem value="CM1">CM1 - Cours Moyen 1</SelectItem>
              <SelectItem value="CM2">CM2 - Cours Moyen 2</SelectItem>
              <SelectItem value="6eme">6ème</SelectItem>
              <SelectItem value="5eme">5ème</SelectItem>
              <SelectItem value="4eme">4ème</SelectItem>
              <SelectItem value="3eme">3ème</SelectItem>
              <SelectItem value="2nde">2nde</SelectItem>
              <SelectItem value="1ere">1ère</SelectItem>
              <SelectItem value="Terminal_S">Terminal S</SelectItem>
              <SelectItem value="Terminal_L">Terminal L</SelectItem>
              <SelectItem value="Terminal_G">Terminal G</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}class-capacity`}>Capacité</Label>
          <Input 
            id={`${isEdit ? 'edit-' : ''}class-capacity`} 
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
            placeholder="Ex: 35"
            min="1"
            max="50" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}class-academic-year`}>Année Académique</Label>
          <Select 
            value={formData.academicYear || ""}
            onValueChange={(value) => handleChange('academicYear', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner l'année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023-2024">2023-2024</SelectItem>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2025-2026">2025-2026</SelectItem>
              <SelectItem value="2026-2027">2026-2027</SelectItem>
              <SelectItem value="2027-2028">2027-2028</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}class-teacher`}>Enseignant Principal</Label>
          <Select 
            value={formData.teacherId}
            onValueChange={(value) => handleChange('teacherId', value)}
            disabled={loadingTeachers}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingTeachers ? "Chargement des professeurs..." : "Sélectionner un professeur"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun professeur</SelectItem>
              {schoolTeachers.map((teacher) => (
                <SelectItem key={teacher._id || teacher.id} value={teacher._id || teacher.id || 'teacher-id'}>
                  {teacher.name} {teacher.subjects?.length > 0 ? `(${teacher.subjects.join(', ')})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}class-room`}>Salle de Classe</Label>
          <Input 
            id={`${isEdit ? 'edit-' : ''}class-room`} 
            value={formData.room}
            onChange={(e) => handleChange('room', e.target.value)}
            placeholder="Ex: Salle 101" 
            required 
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Matières</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
            {loadingSubjects ? (
              <div className="col-span-full text-center py-4 text-sm text-gray-500">
                Chargement des matières...
              </div>
            ) : availableSubjects.length === 0 ? (
              <div className="col-span-full text-center py-4 text-sm text-gray-500">
                Aucune matière disponible
              </div>
            ) : (
              availableSubjects.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${isEdit ? 'edit-' : ''}subject-${subject.id}`}
                    checked={formData.subjects?.includes(subject.id) || false}
                    onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                    className="rounded"
                  />
                  <Label
                    htmlFor={`${isEdit ? 'edit-' : ''}subject-${subject.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {subject.name}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>
        {schoolName && (
          <div className="space-y-2">
            <Label>École</Label>
            <div className="p-2 bg-gray-50 rounded border">
              <span className="text-sm text-gray-600">🏫 {schoolName || 'École non spécifiée'}</span>
              <p className="text-xs text-gray-500 mt-1">École verrouillée pour cet administrateur</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{isEdit ? 'Mettre à Jour' : 'Créer la Classe'}</Button>
      </div>
    </form>
  );
}