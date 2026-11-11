const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');

// All routes here require protect + admin
router.use(protect);
router.use(admin);

// @desc    Get users list (with optional ?status= filter)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const filter = { role: 'user' };
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const pending = await User.countDocuments({ role: 'user', status: 'PENDING' });
    const approved = await User.countDocuments({ role: 'user', status: 'APPROVED' });
    const rejected = await User.countDocuments({ role: 'user', status: 'REJECTED' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    res.json({
      pending,
      approved,
      rejected,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get recent login logs stored in database
// @route   GET /api/admin/login-logs
// @access  Private/Admin
router.get('/login-logs', async (req, res) => {
  try {
    const logs = await LoginLog.find({}).sort({ loginAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve or Reject a user
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Allowed values: APPROVED, REJECTED',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin status' });
    }

    user.status = status;
    await user.save();

    res.json({
      message: `User ${status === 'APPROVED' ? 'accepted' : 'rejected'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
