# Guide de Test - Synchronisation localStorage ↔ Interface

## 🎯 Test de Synchronisation

### 1. Test Changement en Temps Réel
1. **Ouvrir 2 onglets:**
   - Onglet A: Admin CoefficientManagement
   - Onglet B: Teacher GradesAssessment (formulaire ouvert)

2. **Dans l'onglet Teacher (B):**
   - Ouvrir F12 (Console)
   - Aller dans l'onglet "Configuration" 
   - Noter les valeurs actuelles

3. **Dans l'onglet Admin (A):**
   - Cliquer "🧪 Créer Données Test" (Semestre 2, 2025-2026)
   - OU changer manuellement les paramètres et "Sauvegarder"

4. **Retourner dans l'onglet Teacher (B):**
   - **OBSERVER**: Les valeurs doivent changer automatiquement dans les 1-2 secondes
   - Vérifier les logs de synchronisation dans la console

### 2. Test Bouton Debug + Sync
1. Dans Teacher, utiliser le bouton "🔄 Debug + Sync"
2. **Observer les logs suivants:**
```
🔄 Forcer rechargement des paramètres...
👂 useSchoolDefaults - Écoute des changements localStorage
🔄 Application forcée des nouvelles valeurs: {defaultSemester: 2, ...}
```
3. Vérifier que les valeurs se mettent à jour immédiatement

## � Étapes de Debugging

### 1. Configuration Admin (CoefficientManagement)
1. Se connecter en tant qu'admin
2. Aller dans CoefficientManagement
3. **Utiliser le bouton "🧪 Créer Données Test"** pour créer rapidement:
   - Semestre par défaut: 2
   - Année académique: 2025-2026
4. Créer un coefficient pour n'importe quelle matière/classe = 6
5. Cliquer "🔍 Debug Paramètres" et vérifier la console

### 2. Test Teacher (GradesAssessment) 
1. Se connecter en tant que teacher
2. **Ouvrir F12 (Console) AVANT d'ouvrir le formulaire**
3. Ouvrir le formulaire de création d'évaluation
4. **Observer les logs dans l'ordre suivant:**

#### Logs Attendus (dans l'ordre):
```
🚀 useSchoolDefaults - Initialisation du hook
� useSchoolDefaults - Chargement des paramètres école
📊 useSchoolDefaults - Chargement des coefficients
🏁 useSchoolDefaults - Fin du chargement, isLoading = false
� Effect schoolSettings déclenché: {isLoadingDefaults: false, schoolSettings: {...}}
🎯 CONDITIONS REMPLIES - Mise à jour des paramètres par défaut
📋 MISE À JOUR APPLIQUÉE - Nouvelles valeurs newAssessment
```

### 3. Vérifications dans l'Interface
1. Aller dans l'onglet "Configuration"
2. **Utiliser le bouton "🔄 Debug"** pour voir les valeurs actuelles
3. Vérifier que:
   - `Semestre par défaut (schoolSettings): 2`
   - `Semestre actuel (newAssessment): 2`
   - `localStorage: {"defaultSemester":2,"defaultAcademicYear":"2025-2026"}`

## 🚨 Points Critiques à Vérifier

### Si les logs useSchoolDefaults n'apparaissent PAS:
- Le hook ne se charge pas → Problème d'import ou d'initialisation

### Si les logs schoolSettings n'apparaissent PAS:
- L'effect ne se déclenche pas → Problème de dépendances

### Si les valeurs ne changent PAS dans l'interface:
- Les setState ne fonctionnent pas → Problème de React state

## 🛠️ Solutions de Secours

1. **Bouton "🧪 Créer Données Test"** dans CoefficientManagement
2. **Bouton "🔄 Debug"** dans GradesAssessment 
3. **Effect de sécurité** qui force la mise à jour après 1 seconde

## 📊 Diagnostic Rapide

**Console Commands à tester:**
```javascript
// Vérifier localStorage
localStorage.getItem('school-settings')

// Forcer un rechargement
window.location.reload()
```

## ✅ Critères de Succès

Le test est réussi si:
1. Les logs apparaissent dans l'ordre correct
2. Les valeurs dans l'interface correspondent aux paramètres configurés
3. Le semestre/année se mettent à jour automatiquement
4. Le coefficient change quand on sélectionne classe/matière