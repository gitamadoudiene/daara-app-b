const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleAccess');

// Modèle pour les paramètres de l'école
const SchoolSettings = mongoose.model('SchoolSettings', {
  schoolId: String,
  defaultSemester: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  defaultAcademicYear: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Récupérer les paramètres
router.get('/:schoolId', auth, async (req, res) => {
  try {
    const settings = await SchoolSettings.findOne({ schoolId: req.params.schoolId });
    if (!settings) {
      // Valeurs par défaut si aucun paramètre n'existe
      const currentYear = new Date().getFullYear();
      return res.json({
        success: true,
        data: {
          defaultSemester: 1,
          defaultAcademicYear: `${currentYear}-${currentYear + 1}`
        }
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mettre à jour les paramètres
router.post('/:schoolId', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { defaultSemester, defaultAcademicYear } = req.body;
    
    const settings = await SchoolSettings.findOneAndUpdate(
      { schoolId: req.params.schoolId },
      { 
        defaultSemester, 
        defaultAcademicYear,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;