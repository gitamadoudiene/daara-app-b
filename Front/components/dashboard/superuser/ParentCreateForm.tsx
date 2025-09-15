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

export const ParentCreateForm: React.FC<Props> = ({ schools, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('parent-name')?.toString().trim();
    const email = formData.get('parent-email')?.toString().trim();
    const password = formData.get('password')?.toString() || 'password123';
    const phone = formData.get('parent-phone')?.toString().trim();
    const address = formData.get('parent-address')?.toString().trim();
    const school = formData.get('school')?.toString();
    const status = formData.get('status')?.toString();
    if (!name || !email || !password || !phone || !address || !school || !status) {
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
    const payload = { name, email, password, phone, address, school, status };
    try {
      const res = await fetch('http://localhost:5000/api/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Parent créé avec succès !');
        if (onSuccess) onSuccess();
      } else {
        const error = await res.json();
        toast.error(`Erreur: ${error.message || 'Impossible de créer le parent.'}`);
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
        <Input name="parent-name" required />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="parent-email" type="email" required />
      </div>
      <div>
        <Label>Mot de passe</Label>
        <Input name="password" type="password" required minLength={6} />
      </div>
      <div>
        <Label>Téléphone</Label>
        <Input name="parent-phone" type="tel" required />
      </div>
      <div>
        <Label>Adresse</Label>
        <Input name="parent-address" type="text" required />
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
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button type="submit" disabled={loading}>Créer le Parent</Button>
      </div>
    </form>
  );
};
