
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// Compter le nombre d'admins pour une école
router.get('/count/:schoolId', adminController.countAdminsBySchool);

// CRUD Administrateur
router.post('/', adminController.createAdmin); // Créer un administrateur
router.get('/', adminController.getAdmins); // Liste des administrateurs
router.get('/:id', adminController.getAdminById); // Détail d'un administrateur
router.put('/:id', adminController.updateAdmin); // Modifier un administrateur
router.delete('/:id', adminController.deleteAdmin); // Supprimer un administrateur

module.exports = router;
