const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_COOKIE = "qaikbank_token";
const DEFAULT_EXPIRES = "7d";

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const isValidEmail = (email) => {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
};

const signToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

const setAuthCookie = (res, token) => {
  res.cookie(JWT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(JWT_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    customerId: user.customerId,
    avatarUrl: user.avatarUrl || null,
    emailVerified: user.emailVerified || false,
  };
};

module.exports = {
  JWT_COOKIE,
  normalizeEmail,
  isValidEmail,
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  sanitizeUser,
};
