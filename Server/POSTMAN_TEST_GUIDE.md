# Guide de Test Postman pour l'API Daara

## 📋 Prérequis
- Postman installé
- Serveur en cours d'exécution sur http://localhost:5000
- École créée avec ID: `68eeed46ce5a705dae0fbe31`

## 🔐 Étape 1: Authentification (Obtenir le Token JWT)

### Créer un utilisateur (si nécessaire)
**Méthode:** POST  
**URL:** `http://localhost:5000/api/auth/register`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "name": "Professeur Test",
  "email": "prof.test@daara.sn",
  "password": "motdepasse123",
  "role": "teacher",
  "schoolId": "68eeed46ce5a705dae0fbe31"
}
```

### Se connecter et obtenir le token
**Méthode:** POST  
**URL:** `http://localhost:5000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "email": "prof.test@daara.sn",
  "password": "motdepasse123"
}
```
**Réponse attendue:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Professeur Test",
    "email": "prof.test@daara.sn",
    "role": "teacher",
    "schoolId": "68eeed46ce5a705dae0fbe31"
  }
}
```

**⚠️ IMPORTANT:** Copiez le token JWT de la réponse !

---

## 📚 Étape 2: Vérifier les Matières Disponibles

**Méthode:** GET  
**URL:** `http://localhost:5000/api/teachers/subjects`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": [
    "Mathématiques",
    "Mathematique",
    "Français",
    "Histoire-Géographie",
    "Sciences",
    "Sciences Physiques",
    "Sciences de la Vie et de la Terre",
    "Anglais",
    "Arabe",
    "Philosophie",
    "Education Physique et Sportive",
    "Arts Plastiques",
    "Education Musicale",
    "Technologie",
    "Informatique"
  ]
}
```

---

## 🏫 Étape 3: Vérifier les Classes Disponibles

**Méthode:** GET  
**URL:** `http://localhost:5000/api/teachers/classes`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

---

## ✏️ Étape 4: Créer une Évaluation

**Méthode:** POST  
**URL:** `http://localhost:5000/api/evaluations`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```
**Body (JSON):**
```json
{
  "title": "Devoir Test Postman",
  "classId": "68ca2d1ce30d05721c34e14d",
  "subjectId": null,
  "type": "devoir",
  "plannedDate": "2025-10-15",
  "semester": 1,
  "academicYear": "2025-2026",
  "description": "Test depuis Postman",
  "maxScore": 20,
  "coefficient": 1,
  "duration": 60,
  "subject": "Mathematique"
}
```

**Alternative avec un autre nom de matière (si Mathematique ne fonctionne pas):**
```json
{
  "title": "Devoir Test Postman",
  "classId": "68ca2d1ce30d05721c34e14d",
  "subjectId": null,
  "type": "devoir",
  "plannedDate": "2025-10-15",
  "semester": 1,
  "academicYear": "2025-2026",
  "description": "Test depuis Postman",
  "maxScore": 20,
  "coefficient": 1,
  "duration": 60,
  "subject": "Mathématiques"
}
```

---

## 🔍 Tests de Diagnostic

### Lister toutes les matières dans l'école
**Méthode:** GET  
**URL:** `http://localhost:5000/api/schools/68eeed46ce5a705dae0fbe31/subjects`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

### Vérifier les informations de l'école
**Méthode:** GET  
**URL:** `http://localhost:5000/api/schools/68eeed46ce5a705dae0fbe31`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

---

## 📝 Instructions d'Exécution

1. **Démarrez par l'authentification** - Obtenez d'abord votre token JWT
2. **Remplacez `VOTRE_TOKEN_JWT_ICI`** dans tous les headers par votre token réel
3. **Testez les matières** - Vérifiez que "Mathematique" est bien dans la liste
4. **Testez la création d'évaluation** - Utilisez le même JSON que votre frontend
5. **Examinez les réponses d'erreur** - Notez le message d'erreur exact

## 🐛 Points à Vérifier

- [ ] Le token JWT contient-il bien le `schoolId` ?
- [ ] La matière "Mathematique" apparaît-elle dans la liste des matières ?
- [ ] L'ID de classe `68ca2d1ce30d05721c34e14d` existe-t-il ?
- [ ] Quelle est la réponse exacte du serveur ?

## 📋 Résultats à Noter

Notez pour chaque test :
- ✅ Succès / ❌ Échec
- Code de statut HTTP
- Message d'erreur exact
- Contenu de la réponse