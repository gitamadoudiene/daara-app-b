'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Shield, 
  Plus,
  School,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  Settings,
  Edit,
  Trash2,
  UserCheck,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';


interface School {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminCount: number;
  studentCount: number;
  teacherCount: number;
  status: string;
  director: string;
  type: string;
  establishedYear: string;
  createdAt: string;
}

export function SchoolManagement() {
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isManageDetailsOpen, setIsManageDetailsOpen] = useState(false);

  const [schools, setSchools] = useState<School[]>([]);
  const [adminCounts, setAdminCounts] = useState<{ [schoolId: string]: number }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/school')
      .then(res => res.json())
      .then(async (data) => {
        setSchools(data);
        // Fetch admin counts for each school
        const counts: { [schoolId: string]: number } = {};
        await Promise.all(data.map(async (school: any) => {
          const res = await fetch(`http://localhost:5000/api/admin/count/${school._id}`);
          if (res.ok) {
            const result = await res.json();
            counts[school._id] = result.count;
          } else {
            counts[school._id] = 0;
          }
        }));
        setAdminCounts(counts);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = new Date();
    const newSchool = {
      name: formData.get('name') || '',
      address: formData.get('address') || '',
      phone: formData.get('phone') || '',
      email: formData.get('email') || '',
      director: formData.get('director') || '',
      adminCount: 0,
      teacherCount: 0,
      studentCount: 0,
      createdYear: formData.get('createdYear') || '',
      addedDate: now.toISOString(),
      status: formData.get('status') || 'Actif',
      type: formData.get('type') || 'Privé',
    };
    const res = await fetch('http://localhost:5000/api/school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSchool)
    });
    if (res.ok) {
      const created = await res.json();
      setSchools(prev => [...prev, created]);
      toast.success('École créée avec succès !');
      setIsCreateSchoolOpen(false);
    } else {
      toast.error('Erreur lors de la création de l’école');
    }
  };

  const handleViewDetails = (school: School) => {
    setSelectedSchool(school);
    setIsViewDetailsOpen(true);
  };

  const handleManageDetails = (school: School) => {
    setSelectedSchool(school);
    setIsManageDetailsOpen(true);
  };

  const handleUpdateSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSchool) return;
    const formData = new FormData(e.currentTarget);
    const updatedSchool = {
      name: formData.get('edit-name'),
      address: formData.get('edit-address'),
      phone: formData.get('edit-phone'),
      email: formData.get('edit-email'),
      director: formData.get('edit-director'),
      type: formData.get('edit-type'),
      status: formData.get('edit-status'),
    };
    const res = await fetch(`http://localhost:5000/api/school/${selectedSchool._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSchool)
    });
    if (res.ok) {
      const updated = await res.json();
      setSchools(prev => prev.map(s => s._id === updated._id ? updated : s));
      toast.success('École mise à jour avec succès');
      setIsManageDetailsOpen(false);
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteSchool = async () => {
    if (!selectedSchool) return;
    if (!window.confirm(`Voulez-vous vraiment supprimer l'école "${selectedSchool.name}" ? Cette action est irréversible.`)) return;
    const res = await fetch(`http://localhost:5000/api/school/${selectedSchool._id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setSchools(prev => prev.filter(s => s._id !== selectedSchool._id));
      toast.success('École supprimée avec succès');
      setIsManageDetailsOpen(false);
    } else {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'text-green-600 border-green-600';
      case 'Inactif': return 'text-red-600 border-red-600';
      case 'Suspendu': return 'text-orange-600 border-orange-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Public': return 'bg-blue-100 text-blue-800';
      case 'Privé': return 'bg-purple-100 text-purple-800';
      case 'Semi-public': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Écoles</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous les établissements scolaires du système DAARA
          </p>
        </div>
        <Dialog open={isCreateSchoolOpen} onOpenChange={setIsCreateSchoolOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Créer une École</span>
              <span className="sm:hidden">Créer</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Créer une Nouvelle École</DialogTitle>
              <DialogDescription className="text-sm">
                Ajouter un nouvel établissement au système DAARA.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">Nom de l&apos;École</Label>
                  <Input id="school-name" name="name" placeholder="Entrez le nom de l'école" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-director">Directeur</Label>
                  <Input id="school-director" name="director" placeholder="Nom du directeur" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-address">Adresse</Label>
                <Input id="school-address" name="address" placeholder="Adresse complète de l'école" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-phone">Téléphone</Label>
                  <Input id="school-phone" name="phone" placeholder="+221-33-XXX-XXXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-email">Email</Label>
                  <Input id="school-email" name="email" type="email" placeholder="email@ecole.sn" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-type">Type d&apos;École</Label>
                  <select id="school-type" name="type" className="w-full p-2 border rounded-md" required>
                    <option value="">Sélectionnez le type</option>
                    <option value="Public">Public</option>
                    <option value="Privé">Privé</option>
                    <option value="Semi-public">Semi-public</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createdYear">Année de Création</Label>
                  <select id="createdYear" name="createdYear" required className="w-full p-2 border rounded-md">
                    <option value="">Sélectionner une année</option>
                    {Array.from({length: 50}, (_, i) => 1980 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateSchoolOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer l&apos;École</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total des Écoles</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-muted-foreground">
              Établissements enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {schools.reduce((acc, school) => acc + school.studentCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Étudiants inscrits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Enseignants</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {schools.reduce((acc, school) => acc + school.teacherCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Enseignants actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Administrateurs</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {schools.reduce((acc, school) => acc + school.adminCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrateurs assignés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Écoles</CardTitle>
          <CardDescription>Gérez tous les établissements scolaires du système</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools.map((school) => (
              <div key={school._id} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <School className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        <h3 className="text-lg sm:text-xl font-semibold">{school.name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getStatusColor(school.status)}>
                          {school.status}
                        </Badge>
                        <Badge className={getTypeColor(school.type)}>
                          {school.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm text-muted-foreground">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">{school.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{school.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{school.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 flex-shrink-0" />
                          <span>Directeur: {school.director}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          <span>{adminCounts[school._id] ?? 0} Administrateur(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 flex-shrink-0" />
                          <span>{school.teacherCount} Enseignant(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 flex-shrink-0" />
                          <span>{school.studentCount.toLocaleString()} Étudiant(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Créée en {school.createdYear}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>Ajoutée le: {school.addedDate && !isNaN(Date.parse(school.addedDate)) ? new Date(school.addedDate).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(school)}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Voir Détails</span>
                      <span className="sm:hidden">Détails</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageDetails(school)}
                      className="w-full sm:w-auto"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Gérer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-4xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Détails de l&apos;École: {selectedSchool?.name}</DialogTitle>
            <DialogDescription className="text-sm">
              Informations détaillées sur l&apos;établissement scolaire
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="general" className="text-xs sm:text-sm">Général</TabsTrigger>
                <TabsTrigger value="stats" className="text-xs sm:text-sm">Statistiques</TabsTrigger>
                <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">Historique</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom de l&apos;École</Label>
                    <p className="font-medium">{selectedSchool.name}</p>
                  </div>
                  <div>
                    <Label>Directeur</Label>
                    <p className="font-medium">{selectedSchool.director}</p>
                  </div>
                  <div>
                    <Label>Type d&apos;École</Label>
                    <Badge className={getTypeColor(selectedSchool.type || '')}>{selectedSchool.type}</Badge>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Badge variant="outline" className={getStatusColor(selectedSchool.status)}>
                      {selectedSchool.status}
                    </Badge>
                  </div>
                  <div className="lg:col-span-2">
                    <Label>Adresse</Label>
                    <p className="font-medium break-words">{selectedSchool.address}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Étudiants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedSchool.studentCount.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Enseignants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedSchool.teacherCount}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Administrateurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedSchool.adminCount}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Téléphone</Label>
                    <p className="font-medium">{selectedSchool.phone}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedSchool.email}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Adresse Complète</Label>
                    <p className="font-medium">{selectedSchool.address}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <Label>Année de Création</Label>
                    <p className="font-medium">{selectedSchool.createdYear || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <Label>Ajoutée au Système</Label>
                    <p className="font-medium">{selectedSchool.addedDate && !isNaN(Date.parse(selectedSchool.addedDate)) ? new Date(selectedSchool.addedDate).toLocaleDateString('fr-FR') : 'Non renseignée'}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Details Dialog */}
      <Dialog open={isManageDetailsOpen} onOpenChange={setIsManageDetailsOpen}>
        <DialogContent className="mx-4 w-[95vw] max-w-2xl sm:mx-auto sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Gérer l&apos;École: {selectedSchool?.name}</DialogTitle>
            <DialogDescription className="text-sm">
              Modifier les informations de l&apos;établissement scolaire
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <form className="space-y-4" onSubmit={handleUpdateSchool}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom de l&apos;École</Label>
                  <Input id="edit-name" name="edit-name" value={selectedSchool.name || ''} onChange={e => setSelectedSchool(s => s ? { ...s, name: e.target.value } : s)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-director">Directeur</Label>
                  <Input id="edit-director" name="edit-director" value={selectedSchool.director || ''} onChange={e => setSelectedSchool(s => s ? { ...s, director: e.target.value } : s)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input id="edit-address" name="edit-address" value={selectedSchool.address || ''} onChange={e => setSelectedSchool(s => s ? { ...s, address: e.target.value } : s)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input id="edit-phone" name="edit-phone" value={selectedSchool.phone || ''} onChange={e => setSelectedSchool(s => s ? { ...s, phone: e.target.value } : s)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" name="edit-email" type="email" value={selectedSchool.email || ''} onChange={e => setSelectedSchool(s => s ? { ...s, email: e.target.value } : s)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type d&apos;École</Label>
                  <select id="edit-type" name="edit-type" className="w-full p-2 border rounded-md" value={selectedSchool.type || ''} onChange={e => setSelectedSchool(s => s ? { ...s, type: e.target.value } : s)}>
                    <option value="Public">Public</option>
                    <option value="Privé">Privé</option>
                    <option value="Semi-public">Semi-public</option>
                  </select>
                  {/* Pour une meilleure expérience utilisateur, remplacez ce <select> par un composant de liste déroulante avec recherche, par exemple react-select */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <select id="edit-status" name="edit-status" className="w-full p-2 border rounded-md" value={selectedSchool.status || ''} onChange={e => setSelectedSchool(s => s ? { ...s, status: e.target.value } : s)}>
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                  {/* Pour une meilleure expérience utilisateur, remplacez ce <select> par un composant de liste déroulante avec recherche, par exemple react-select */}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsManageDetailsOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleDeleteSchool}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
                <Button 
                  type="submit"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
