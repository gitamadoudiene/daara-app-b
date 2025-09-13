const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, name, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Échec de la connexion. Veuillez vérifier vos identifiants.' });
    // Vérifier le statut si admin
    if (user.role === 'admin') {
      const Admin = require('../models/Admin');
      const admin = await Admin.findOne({ email: user.email });
      if (admin) {
        if (admin.status === 'Suspendu') {
          return res.status(403).json({ message: 'Votre compte administrateur est suspendu. Connexion refusée.' });
        }
        if (admin.status === 'Inactif') {
          return res.status(403).json({ message: 'Votre compte administrateur est inactif. Connexion refusée.' });
        }
      }
    }
    const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Échec de la connexion. Veuillez vérifier vos identifiants.' });
    // Mettre à jour la dernière connexion si admin
    if (user.role === 'admin') {
      const Admin = require('../models/Admin');
      await Admin.findOneAndUpdate({ email: user.email }, { lastLogin: new Date() });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
