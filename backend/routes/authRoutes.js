const express = require('express');
const router = express.Router();
const {
  checkAdminStatus,
  registerAdmin,
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/has-admin', checkAdminStatus);
router.post('/register-admin', registerAdmin);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
