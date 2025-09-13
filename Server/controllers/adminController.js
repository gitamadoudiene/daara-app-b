exports.countAdminsBySchool = async (req, res) => {
  try {
    const schoolId = req.params.schoolId;
    const count = await Admin.countDocuments({ school: schoolId });
    const admins = await Admin.find({ school: schoolId }).populate('school');
    res.json({ count, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const Admin = require('../models/Admin');

exports.createAdmin = async (req, res) => {
  try {
    const admin = new Admin(req.body);
    await admin.save();
    // Création du User lié avec mot de passe hashé
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const userExists = await User.findOne({ email: req.body.email });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash(req.body.password || 'password123', 10);
      const user = new User({
        email: req.body.email,
        name: req.body.name,
        role: 'admin',
        schoolId: req.body.school,
        password: hashedPassword,
      });
      await user.save();
    }
    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const filter = {};
    if (req.query.school) {
      filter.school = req.query.school;
    }
    const admins = await Admin.find(filter).populate('school');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate('school');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
