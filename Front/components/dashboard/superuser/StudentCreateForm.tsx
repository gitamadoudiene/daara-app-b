import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
}
interface Classe {
  _id: string;
  name: string;
}
interface Parent {
  id?: string;
  _id?: string;
  name: string;
}
interface Props {
  schools: School[];
  classes: Classe[];
  parents: Parent[];
  onSuccess?: () => void;
  onCancel: () => void;
}

export const StudentCreateForm: React.FC<Props> = ({ schools, classes, parents, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('student-name')?.toString().trim();
    const email = formData.get('student-email')?.toString().trim();
    const password = formData.get('password')?.toString() || 'password123';
    const phone = formData.get('student-phone')?.toString().trim();
    const address = formData.get('student-address')?.toString().trim();
    const school = formData.get('school')?.toString();
    const status = formData.get('status')?.toString();
    const parent = formData.get('parent')?.toString();
    const classId = formData.get('class')?.toString();
    if (!name || !email || !password || !phone || !address || !school || !status || !parent || !classId) {
      toast.error('Tous les champs sont obligatoires.');
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
    const payload = { name, email, password, phone, address, school, status, parent, class: classId };
    try {
      const res = await fetch('http://localhost:5000/api/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Étudiant créé avec succès !');
        if (onSuccess) onSuccess();
      } else {
        const error = await res.json();
        toast.error(`Erreur: ${error.message || 'Impossible de créer l\'étudiant.'}`);
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
        <Input name="student-name" required />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="student-email" type="email" required />
      </div>
      <div>
        <Label>Mot de passe</Label>
        <Input name="password" type="password" required minLength={6} />
      </div>
      <div>
        <Label>Téléphone</Label>
        <Input name="student-phone" type="tel" required />
      </div>
      <div>
        <Label>Adresse</Label>
        <Input name="student-address" type="text" required />
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
        <Label>Parent</Label>
        <select name="parent" required className="w-full p-2 border rounded">
          <option value="">Sélectionnez un parent</option>
          {parents.map((p) => (
            <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Classe</Label>
        <select name="class" required className="w-full p-2 border rounded">
          <option value="">Sélectionnez une classe</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button type="submit" disabled={loading}>Créer l&apos;Étudiant</Button>
      </div>
    </form>
  );
};
