const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const {
  normalizeEmail,
  isValidEmail,
  hashPassword,
  comparePassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  sanitizeUser,
} = require("../services/authService");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }
  return new OAuth2Client(clientId);
};

const basicPasswordPolicy = (password) => {
  if (!password || typeof password !== "string") return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
};

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    const passwordError = basicPasswordPolicy(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : null,
      passwordHash,
      emailVerified: false,
    });

    const token = signToken({ sub: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    return res.status(201).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ success: false, message: "Use Google sign-in for this account" });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken({ sub: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Missing Google credential" });
    }

    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: "Invalid Google token" });
    }

    if (!payload.email_verified) {
      return res.status(400).json({ success: false, message: "Google email not verified" });
    }

    const normalizedEmail = normalizeEmail(payload.email);
    const googleId = payload.sub;

    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

    if (!user) {
      user = await User.create({
        name: payload.name || "Google User",
        email: normalizedEmail,
        googleId,
        emailVerified: true,
        avatarUrl: payload.picture || null,
      });
    } else {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        needsSave = true;
      }
      if (!user.avatarUrl && payload.picture) {
        user.avatarUrl = payload.picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    const token = signToken({ sub: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

module.exports = router;
