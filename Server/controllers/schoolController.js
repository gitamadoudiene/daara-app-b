const School = require('../models/School');

exports.createSchool = async (req, res) => {
  try {
    const { name, address, phone, email, director, createdYear, type, status } = req.body;
    if (!name || !address || !phone || !email || !director || !createdYear || !type || !status) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide.' });
    }
    const school = new School({
      name,
      address,
      phone,
      email,
      director,
      createdYear,
      type,
      status,
      adminCount: req.body.adminCount || 0,
      teacherCount: req.body.teacherCount || 0,
      studentCount: req.body.studentCount || 0,
      addedDate: req.body.addedDate || new Date().toISOString()
    });
    await school.save();
    res.status(201).json(school);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json(school);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json(school);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json({ message: 'School deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
