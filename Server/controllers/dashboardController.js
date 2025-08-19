const User = require('../models/User');

exports.getDashboardData = async (req, res) => {
  try {
    // Example: return user count by role
    const roles = ['super_user', 'admin', 'teacher', 'parent', 'student'];
    const data = {};
    for (const role of roles) {
      data[role] = await User.countDocuments({ role });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
