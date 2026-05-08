const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validationResult } = require('express-validator');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { nama, email, password, no_telepon, alamat, role } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });

    const assignedRole = role === 'admin' && req.user?.role === 'admin' ? 'admin' : 'orang_tua';

    const user = await User.create({
      nama, email, password, no_telepon, alamat, role: assignedRole
    });

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { id: user.id, nama: user.nama, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active)
      return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const valid = user.validatePassword(password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Login berhasil',
      data: { id: user.id, nama: user.nama, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => res.json({ success: true, data: req.user });

const updateProfile = async (req, res) => {
  const { nama, no_telepon, alamat } = req.body;
  try {
    await User.update({ nama, no_telepon, alamat }, { where: { id: req.user.id } });
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    return res.json({ success: true, message: 'Profil berhasil diupdate', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    const valid = user.validatePassword(old_password);
    if (!valid)
      return res.status(400).json({ success: false, message: 'Password lama salah' });
    user.password = new_password;
    await user.save();
    return res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };