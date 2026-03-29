const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendTokenResponse = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? 'admin' : (role === 'admin' ? 'user' : role || 'user');

    const user = await User.create({ name, email, password, role: assignedRole });
    sendTokenResponse(res, user, 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(res, user);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.refreshToken = async (req, res) => {
  const token = signToken(req.user._id);
  res.json({ success: true, token });
};
