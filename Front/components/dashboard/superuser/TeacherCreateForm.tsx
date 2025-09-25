import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MatiereTagsInput } from '@/components/ui/matiere-tags-input';
import { ClasseTagsInput } from '@/components/ui/classe-tags-input';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
}
interface Classe {
  _id: string;
  name: string;
}
interface Props {
  schools: School[];
  classes: Classe[];
  onSuccess?: () => void;
  onCancel: () => void;
}

export const TeacherCreateForm: React.FC<Props> = ({ schools, classes, onSuccess, onCancel }) => {
  const [selectedMatieres, setSelectedMatieres] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('teacher-name')?.toString().trim();
    const email = formData.get('teacher-email')?.toString().trim();
    const password = formData.get('password')?.toString() || 'password123';
    const phone = formData.get('teacher-phone')?.toString().trim();
    const school = formData.get('school')?.toString();
    const status = formData.get('status')?.toString();
    if (!name || !email || !password || !phone || !school || !status) {
      toast.error('Tous les champs sont obligatoires.');
      setLoading(false);
      return;
    }
    if (selectedMatieres.length === 0) {
      toast.error('Sélectionnez au moins une matière.');
      setLoading(false);
      return;
    }
    if (selectedClasses.length === 0) {
      toast.error('Sélectionnez au moins une classe.');
      setLoading(false);
      return;
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      toast.error('Format d\'email invalide.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }
    const payload = {
      name,
      email,
      password,
      phone,
      school,
      status,
      subjects: selectedMatieres,
      classes: selectedClasses
    };
    try {
      const res = await fetch('http://localhost:5000/api/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Enseignant créé avec succès !');
        if (onSuccess) onSuccess();
      } else {
        const error = await res.json();
        toast.error(`Erreur: ${error.message || 'Impossible de créer l\'enseignant.'}`);
      }
    } catch (err) {
      toast.error('Erreur réseau ou serveur.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nom complet</Label>
        <Input name="teacher-name" required />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="teacher-email" type="email" required />
      </div>
      <div>
        <Label>Mot de passe</Label>
        <Input name="password" type="password" required minLength={6} />
      </div>
      <div>
        <Label>Téléphone</Label>
        <Input name="teacher-phone" type="tel" required />
      </div>
      <div>
        <Label>École</Label>
        <select name="school" required className="w-full p-2 border rounded">
          <option value="">Sélectionnez une école</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Statut</Label>
        <select name="status" required className="w-full p-2 border rounded">
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
          <option value="Suspendu">Suspendu</option>
        </select>
      </div>
      <div>
        <Label>Matières</Label>
        <MatiereTagsInput value={selectedMatieres} onChange={setSelectedMatieres} />
      </div>
      <div>
        <Label>Classes</Label>
        <ClasseTagsInput
          options={classes.map(c => c.name)}
          value={selectedClasses}
          onChange={setSelectedClasses}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button type="submit" disabled={loading}>Créer l&apos;Enseignant</Button>
      </div>
    </form>
  );
};
