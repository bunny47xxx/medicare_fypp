
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./../model/User.js');
require('dotenv').config();

const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      address,
      city,
      specialization,
      role,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !address || !city) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    if (role === 'doctor' && !specialization) {
      return res.status(400).json({ error: 'Specialization required for doctors' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with that email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      address,
      city,
      specialization: role === 'doctor' ? specialization : null,
      role,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // DEBUG: Log what we're comparing (remove in production)
    console.log('Attempting login for:', email);
    console.log('Stored hash:', user.passwordHash);
    console.log('Password provided:', password);

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    
    console.log('Password valid:', validPassword); // DEBUG

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { registerUser, loginUser };

