const User = require("../models/User");
const { JWT_COOKIE, verifyToken } = require("../services/authService");

const getTokenFromRequest = (req) => {
  if (req.cookies && req.cookies[JWT_COOKIE]) {
    return req.cookies[JWT_COOKIE];
  }

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
};

const attachUser = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).lean();
    req.user = user || null;
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};

const requireAuth = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid session" });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid session" });
  }
};

module.exports = {
  attachUser,
  requireAuth,
};
