import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
}

interface Props {
  schools: School[];
  onSuccess?: () => void;
  onCancel: () => void;
}

export const AdminCreateForm: React.FC<Props> = ({ schools, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('admin-name')?.toString().trim();
    const email = formData.get('admin-email')?.toString().trim();
    const password = formData.get('password')?.toString() || 'password123';
    const phone = formData.get('admin-phone')?.toString().trim();
    const role = formData.get('admin-role')?.toString();
    const school = formData.get('school')?.toString();
    const permissions = Array.from(formData.getAll('permissions'));

    if (!name || !email || !password || !phone || !role || !school) {
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
    const payload = { name, email, password, phone, role, school, permissions };
    try {
      const res = await fetch('http://localhost:5000/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Administrateur créé avec succès ! Mot de passe : ${payload.password}`);
        if (onSuccess) onSuccess();
      } else {
        const error = await res.json();
        toast.error(`Erreur: ${error.message || 'Impossible de créer l\'administrateur.'}`);
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
        <Input name="admin-name" required />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="admin-email" type="email" required />
      </div>
      <div>
        <Label>Mot de passe</Label>
        <Input name="password" type="password" required minLength={6} />
      </div>
      <div>
        <Label>Téléphone</Label>
        <Input name="admin-phone" type="tel" required />
      </div>
      <div>
        <Label>Rôle</Label>
        <select name="admin-role" required className="w-full p-2 border rounded">
          <option value="">Sélectionnez un rôle</option>
          <option value="Principal">Principal</option>
          <option value="Adjoint">Adjoint</option>
          <option value="Superviseur">Superviseur</option>
        </select>
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
        <Label>Permissions</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Gestion complète', 'Rapports', 'Utilisateurs', 'Paramètres'].map((permission) => (
            <label key={permission} className="flex items-center space-x-2">
              <input type="checkbox" name="permissions" value={permission} className="rounded" />
              <span className="text-sm">{permission}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button type="submit" disabled={loading}>Créer l&apos;Administrateur</Button>
      </div>
    </form>
  );
};
