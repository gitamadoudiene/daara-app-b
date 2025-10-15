'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight, Calendar, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import EvaluationManagement from './EvaluationManagement';

/**
 * Composant GradeManagement - Migration vers le nouveau système d'évaluation
 * 
 * Ce composant redirige maintenant vers le nouveau système d'évaluation en 2 étapes :
 * 1. Programmation des évaluations (EvaluationManagement)
 * 2. Saisie des notes via les évaluations programmées
 */

const GradeManagement: React.FC = () => {
  const [showNewSystem, setShowNewSystem] = useState(false);

  if (showNewSystem) {
    return <EvaluationManagement />;
  }

  return (
    <div className="space-y-6">
      {/* Alert de migration */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Nouveau Système d'Évaluation Disponible</AlertTitle>
        <AlertDescription className="text-blue-700">
          Nous avons mis à jour le système de gestion des notes avec un processus en 2 étapes 
          plus adapté au système éducatif sénégalais.
        </AlertDescription>
      </Alert>

      {/* Comparaison des systèmes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ancien système */}
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <BookOpen className="h-5 w-5" />
              Ancien Système (Déprécié)
            </CardTitle>
            <CardDescription>
              Création directe de notes individuelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>❌ Création manuelle note par note</div>
              <div>❌ Pas de programmation d'évaluations</div>
              <div>❌ Gestion des coefficients complexe</div>
              <div>❌ Pas de workflow structuré</div>
              <div>❌ Bulletins non automatisés</div>
            </div>
            
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-sm">
                Ce système est désormais incompatible avec les nouvelles fonctionnalités.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Nouveau système */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Nouveau Système (Recommandé)
            </CardTitle>
            <CardDescription>
              Processus en 2 étapes avec évaluations programmées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-green-700">
              <div>✅ <strong>Étape 1:</strong> Programmer l'évaluation</div>
              <div>✅ <strong>Étape 2:</strong> Saisir les notes</div>
              <div>✅ Coefficients du système sénégalais</div>
              <div>✅ Gestion automatique des conflits</div>
              <div>✅ Bulletins automatisés</div>
              <div>✅ Moyennes pondérées (50/50)</div>
              <div>✅ Classements automatiques</div>
            </div>

            <Button 
              onClick={() => setShowNewSystem(true)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Utiliser le Nouveau Système
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fonctionnalités du nouveau système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fonctionnalités du Nouveau Système
          </CardTitle>
          <CardDescription>
            Adapté spécifiquement au système éducatif sénégalais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Programmation
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Planification des évaluations</li>
                <li>• Détection de conflits</li>
                <li>• Calendrier intégré</li>
                <li>• Instructions détaillées</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                Évaluation
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Saisie rapide des notes</li>
                <li>• Validation automatique</li>
                <li>• Commentaires pédagogiques</li>
                <li>• Publication contrôlée</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Bulletins
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Génération automatique</li>
                <li>• Moyennes pondérées</li>
                <li>• Classements par classe</li>
                <li>• Mentions officielles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide de migration */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle>Guide de Migration</CardTitle>
          <CardDescription>
            Comment passer de l'ancien au nouveau système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h4 className="font-medium">Utilisez le nouveau système pour les nouvelles évaluations</h4>
                <p className="text-sm text-muted-foreground">
                  Toutes les nouvelles évaluations doivent être créées via le système de programmation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h4 className="font-medium">Les anciennes notes restent accessibles</h4>
                <p className="text-sm text-muted-foreground">
                  Vos notes existantes sont conservées et consultables dans les bulletins.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h4 className="font-medium">Bénéficiez des nouveaux outils</h4>
                <p className="text-sm text-muted-foreground">
                  Coefficients automatiques, bulletins standardisés, et outils d'analyse.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeManagement;