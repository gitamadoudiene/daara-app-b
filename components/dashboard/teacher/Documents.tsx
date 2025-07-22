'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image, Video, Folder, Download, Eye, Share, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'document' | 'presentation';
  size: string;
  uploadDate: string;
  category: 'lesson' | 'exercise' | 'evaluation' | 'resource';
  class: string;
  subject: string;
  downloads: number;
  isShared: boolean;
}

export function Documents() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data for documents
  const documents: Document[] = [
    {
      id: '1',
      name: 'Cours_Fractions_6eme.pdf',
      type: 'pdf',
      size: '2.5 MB',
      uploadDate: '2024-07-20',
      category: 'lesson',
      class: '6ème A',
      subject: 'Mathématiques',
      downloads: 28,
      isShared: true
    },
    {
      id: '2',
      name: 'Exercices_Geometrie.pdf',
      type: 'pdf',
      size: '1.8 MB',
      uploadDate: '2024-07-19',
      category: 'exercise',
      class: '5ème B',
      subject: 'Mathématiques',
      downloads: 32,
      isShared: true
    },
    {
      id: '3',
      name: 'Video_Pythagore.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadDate: '2024-07-18',
      category: 'resource',
      class: '4ème A',
      subject: 'Mathématiques',
      downloads: 25,
      isShared: false
    },
    {
      id: '4',
      name: 'Evaluation_Algebre.pdf',
      type: 'pdf',
      size: '1.2 MB',
      uploadDate: '2024-07-17',
      category: 'evaluation',
      class: '3ème C',
      subject: 'Mathématiques',
      downloads: 30,
      isShared: false
    },
    {
      id: '5',
      name: 'Presentation_Triangles.pptx',
      type: 'presentation',
      size: '5.8 MB',
      uploadDate: '2024-07-16',
      category: 'lesson',
      class: '6ème A',
      subject: 'Mathématiques',
      downloads: 28,
      isShared: true
    },
    {
      id: '6',
      name: 'Schema_Theoremes.png',
      type: 'image',
      size: '0.8 MB',
      uploadDate: '2024-07-15',
      category: 'resource',
      class: '5ème B',
      subject: 'Mathématiques',
      downloads: 15,
      isShared: true
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'presentation':
        return FileText;
      default:
        return FileText;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'text-red-600';
      case 'image':
        return 'text-green-600';
      case 'video':
        return 'text-blue-600';
      case 'presentation':
        return 'text-orange-600';
      case 'document':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'lesson': return 'Cours';
      case 'exercise': return 'Exercices';
      case 'evaluation': return 'Évaluation';
      case 'resource': return 'Ressource';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      case 'evaluation': return 'bg-purple-100 text-purple-800';
      case 'resource': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Documents</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez vos documents pédagogiques et partagez-les avec vos étudiants
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Uploader Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Uploader un Nouveau Document</DialogTitle>
              <DialogDescription>
                Ajoutez un document à votre bibliothèque pédagogique
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Fichier</Label>
                <Input id="file" type="file" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">Cours</SelectItem>
                    <SelectItem value="exercise">Exercices</SelectItem>
                    <SelectItem value="evaluation">Évaluation</SelectItem>
                    <SelectItem value="resource">Ressource</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Classe</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6a">6ème A</SelectItem>
                    <SelectItem value="5b">5ème B</SelectItem>
                    <SelectItem value="4a">4ème A</SelectItem>
                    <SelectItem value="3c">3ème C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="share" className="rounded" />
                <Label htmlFor="share" className="text-sm">
                  Partager avec les étudiants
                </Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setShowUploadDialog(false)}>
                  Uploader
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input placeholder="Rechercher un document..." />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="lesson">Cours</SelectItem>
                <SelectItem value="exercise">Exercices</SelectItem>
                <SelectItem value="evaluation">Évaluation</SelectItem>
                <SelectItem value="resource">Ressource</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                <SelectItem value="6a">6ème A</SelectItem>
                <SelectItem value="5b">5ème B</SelectItem>
                <SelectItem value="4a">4ème A</SelectItem>
                <SelectItem value="3c">3ème C</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type de fichier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Vidéos</SelectItem>
                <SelectItem value="presentation">Présentations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Folder className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              Fichiers uploadés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partagés</CardTitle>
            <Share className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(doc => doc.isShared).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Avec les étudiants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {documents.reduce((sum, doc) => sum + doc.downloads, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des téléchargements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taille Totale</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">58.3</div>
            <p className="text-xs text-muted-foreground">
              MB utilisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredDocuments.map((document) => {
          const FileIcon = getFileIcon(document.type);
          return (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${getFileColor(document.type)}`}>
                    <FileIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">
                      {document.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getCategoryColor(document.category)} variant="secondary">
                        {getCategoryLabel(document.category)}
                      </Badge>
                      {document.isShared && (
                        <Badge variant="outline" className="text-xs">
                          Partagé
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* File Details */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Taille:</span>
                      <span>{document.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Classe:</span>
                      <span>{document.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploadé:</span>
                      <span>{new Date(document.uploadDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Téléchargements:</span>
                      <span>{document.downloads}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="mr-1 h-3 w-3" />
                      Voir
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="mr-1 h-3 w-3" />
                      DL
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Share className="mr-1 h-3 w-3" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create New Folder Button */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Plus className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-4">Créer un nouveau dossier ou organiser vos documents</p>
          <Button variant="outline">
            <Folder className="mr-2 h-4 w-4" />
            Nouveau Dossier
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
