import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Eye, Users, TrendingUp, Award, Calculator, Settings } from 'lucide-react';

interface Class {
  _id: string;
  name: string;
  level: string;
  studentCount: number;
}

interface Bulletin {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  semester: number;
  academicYear: string;
  generalAverage: number;
  rankInClass: number;
  totalStudentsInClass: number;
  status: 'brouillon' | 'provisoire' | 'definitif' | 'publie';
  subjects: Array<{
    subjectName: string;
    finalAverage: number;
    coefficient: number;
    appreciation: string;
  }>;
  isPublished: boolean;
}

interface SubjectCoefficient {
  _id: string;
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  classLevel: string;
  coefficient: number;
  academicYear: string;
  isActive: boolean;
}

const BulletinManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025');
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [coefficients, setCoefficients] = useState<SubjectCoefficient[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('bulletins');

  const token = localStorage.getItem('daara_token');

  useEffect(() => {
    loadClasses();
    loadCoefficients();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassBulletins();
    }
  }, [selectedClass, selectedSemester, selectedYear]);

  const loadClasses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/classes/school/68c7700cd9f7c4207d3c9ea6', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des classes');
      }

      const data = await response.json();
      setClasses(data.data);
      
      if (data.data.length > 0) {
        setSelectedClass(data.data[0]._id);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClassBulletins = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/bulletins/class/${selectedClass}?semester=${selectedSemester}&academicYear=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des bulletins');
      }

      const data = await response.json();
      setBulletins(data.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCoefficients = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/coefficients?academicYear=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des coefficients');
      }

      const data = await response.json();
      setCoefficients(data.data.coefficients);
    } catch (error: any) {
      console.error('Erreur chargement coefficients:', error);
    }
  };

  const generateClassBulletins = async () => {
    if (!selectedClass) return;

    try {
      setProcessing(true);
      setError(null);

      // Récupérer la classe sélectionnée
      const selectedClassData = classes.find(c => c._id === selectedClass);
      if (!selectedClassData) return;

      // Récupérer tous les élèves de la classe
      const classResponse = await fetch(`http://localhost:5000/api/classes/${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!classResponse.ok) {
        throw new Error('Erreur lors du chargement de la classe');
      }

      const classData = await classResponse.json();
      const students = classData.data.students;

      // Générer le bulletin pour chaque élève
      const generatedCount = students.length;
      for (const student of students) {
        try {
          await fetch('http://localhost:5000/api/bulletins/generate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              studentId: student._id,
              classId: selectedClass,
              semester: selectedSemester,
              academicYear: selectedYear
            })
          });
        } catch (error) {
          console.error(`Erreur génération bulletin pour ${student.name}:`, error);
        }
      }

      setSuccess(`${generatedCount} bulletins générés avec succès`);
      await loadClassBulletins();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const calculateClassRankings = async () => {
    if (!selectedClass) return;

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/bulletins/class/rankings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: selectedClass,
          semester: selectedSemester,
          academicYear: selectedYear
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du calcul des classements');
      }

      const data = await response.json();
      setSuccess(`Classements calculés pour ${data.data.bulletinsCount} élèves`);
      await loadClassBulletins();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const publishClassBulletins = async () => {
    if (!selectedClass) return;

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/bulletins/class/publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: selectedClass,
          semester: selectedSemester,
          academicYear: selectedYear
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la publication des bulletins');
      }

      const data = await response.json();
      setSuccess(`${data.data.publishedCount} bulletins publiés avec succès`);
      await loadClassBulletins();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const initializeCoefficients = async () => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/coefficients/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          academicYear: selectedYear
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'initialisation des coefficients');
      }

      const data = await response.json();
      setSuccess(data.message);
      await loadCoefficients();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'brouillon': { color: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      'provisoire': { color: 'bg-yellow-100 text-yellow-800', label: 'Provisoire' },
      'definitif': { color: 'bg-blue-100 text-blue-800', label: 'Définitif' },
      'publie': { color: 'bg-green-100 text-green-800', label: 'Publié' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.brouillon;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const selectedClassData = classes.find(c => c._id === selectedClass);
  const publishedCount = bulletins.filter(b => b.isPublished).length;
  const averageClass = bulletins.length > 0 
    ? Math.round((bulletins.reduce((sum, b) => sum + b.generalAverage, 0) / bulletins.length) * 100) / 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Bulletins</h1>
        <div className="flex gap-4">
          <Select value={selectedSemester.toString()} onValueChange={(value) => setSelectedSemester(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Semestre 1</SelectItem>
              <SelectItem value="2">Semestre 2</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2025-2026">2025-2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
          <TabsTrigger value="coefficients">Coefficients</TabsTrigger>
        </TabsList>

        <TabsContent value="bulletins" className="space-y-6">
          {/* Sélection de classe */}
          <Card>
            <CardHeader>
              <CardTitle>Sélection de classe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="class">Classe</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(classe => (
                        <SelectItem key={classe._id} value={classe._id}>
                          {classe.name} ({classe.level}) - {classe.studentCount} élèves
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={generateClassBulletins} disabled={!selectedClass || processing}>
                  <FileText className="h-4 w-4 mr-2" />
                  {processing ? 'Génération...' : 'Générer bulletins'}
                </Button>
                
                <Button onClick={calculateClassRankings} disabled={!selectedClass || processing} variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calculer classements
                </Button>
                
                <Button onClick={publishClassBulletins} disabled={!selectedClass || processing} variant="default">
                  <Eye className="h-4 w-4 mr-2" />
                  Publier bulletins
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques de classe */}
          {selectedClassData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Élèves total</p>
                      <p className="text-2xl font-bold">{selectedClassData.studentCount}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bulletins générés</p>
                      <p className="text-2xl font-bold">{bulletins.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bulletins publiés</p>
                      <p className="text-2xl font-bold">{publishedCount}</p>
                    </div>
                    <Eye className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Moyenne classe</p>
                      <p className="text-2xl font-bold">{averageClass}</p>
                    </div>
                    <Calculator className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Liste des bulletins */}
          {selectedClass && (
            <Card>
              <CardHeader>
                <CardTitle>Bulletins - {selectedClassData?.name}</CardTitle>
                <CardDescription>
                  Semestre {selectedSemester} - {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Chargement...</div>
                ) : bulletins.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun bulletin généré pour cette classe.</p>
                    <Button className="mt-4" onClick={generateClassBulletins}>
                      Générer les bulletins
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rang</TableHead>
                        <TableHead>Élève</TableHead>
                        <TableHead>Moyenne générale</TableHead>
                        <TableHead>Matières</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulletins
                        .sort((a, b) => a.rankInClass - b.rankInClass)
                        .map((bulletin) => (
                          <TableRow key={bulletin._id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {bulletin.rankInClass <= 3 && (
                                  <Award className="h-4 w-4 text-yellow-500" />
                                )}
                                <span className="font-medium">
                                  {bulletin.rankInClass}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{bulletin.studentId.name}</div>
                                <div className="text-sm text-gray-500">{bulletin.studentId.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-lg font-semibold">
                                {bulletin.generalAverage.toFixed(2)}/20
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {bulletin.subjects.length} matières
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(bulletin.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="coefficients" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Gestion des Coefficients
                  </CardTitle>
                  <CardDescription>
                    Configuration des coefficients par matière et niveau
                  </CardDescription>
                </div>
                <Button onClick={initializeCoefficients} disabled={processing}>
                  Initialiser coefficients par défaut
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {coefficients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun coefficient configuré.</p>
                  <Button className="mt-4" onClick={initializeCoefficients}>
                    Initialiser les coefficients par défaut
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matière</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Coefficient</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coefficients.map((coeff) => (
                      <TableRow key={coeff._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{coeff.subjectId.name}</div>
                            <div className="text-sm text-gray-500">{coeff.subjectId.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{coeff.classLevel}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{coeff.coefficient}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={coeff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {coeff.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulletinManagement;