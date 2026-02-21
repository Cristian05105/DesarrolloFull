const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/auth/register
async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email y password son requeridos" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "password debe tener al menos 6 caracteres" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "ese email ya está registrado" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  return res.status(201).json({ id: user._id, email: user.email });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email y password son requeridos" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "credenciales inválidas" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "credenciales inválidas" });
  }

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  return res.json({ token });
}

module.exports = { register, login };
