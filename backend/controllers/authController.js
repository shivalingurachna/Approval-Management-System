const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role, status) => {
  return jwt.sign({ id, role, status }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Check whether an admin account already exists
// @route   GET /api/auth/has-admin
// @access  Public
const checkAdminStatus = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    res.json({ hasAdmin: adminCount > 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin registration (First and only admin account)
// @route   POST /api/auth/register-admin
// @access  Public
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Enforce "First and only admin" rule
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        message: 'An administrator account already exists. Only one administrator is allowed.',
      });
    }

    // Check if email is already taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create the sole admin account in MongoDB
    const adminUser = await User.create({
      name,
      email,
      password,
      role: 'admin',
      status: 'APPROVED',
      lastLogin: new Date(),
    });

    // Save initial login log in database
    await LoginLog.create({
      userId: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      status: adminUser.status,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(201).json({
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      status: adminUser.status,
      lastLogin: adminUser.lastLogin,
      token: generateToken(adminUser._id, adminUser.role, adminUser.status),
      message: 'Admin account created successfully and stored in database.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    User registration (Stored in database with status PENDING)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Store new user in MongoDB database
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      status: 'PENDING',
    });

    res.status(201).json({
      message: 'Registration successful! Your account has been saved in the database and is PENDING approval from the administrator.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login for Admin and Users (Stores login timestamp & log in database)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Role-based checks
    if (user.role === 'user') {
      if (user.status === 'PENDING') {
        return res.status(403).json({
          status: 'PENDING',
          message: 'Your account is PENDING admin approval. Please wait for an administrator to accept your registration.',
        });
      }

      if (user.status === 'REJECTED') {
        return res.status(403).json({
          status: 'REJECTED',
          message: 'Your registration request has been REJECTED by the administrator.',
        });
      }
    }

    // Save login timestamp in User document
    user.lastLogin = new Date();
    await user.save();

    // Store login log in database
    await LoginLog.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
    });

    // Return response with user details and JWT
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      token: generateToken(user._id, user.role, user.status),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private (Approved or Admin)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkAdminStatus,
  registerAdmin,
  registerUser,
  loginUser,
  getUserProfile,
};
