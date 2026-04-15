import jwt from "jsonwebtoken";
import { readDB } from "../db.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fail fast: a missing secret makes tokens forgeable.
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    req.auth = decoded; // { id, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function attachUser(req, res, next) {
  try {
    if (!req.auth?.id) return next();
    const db = readDB();
    const user = db.users.find((u) => u._id === req.auth.id);
    req.user = user || null;
    return next();
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export function requireRole(allowedStatuses) {
  const allowed = Array.isArray(allowedStatuses) ? allowedStatuses : [allowedStatuses];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const status = req.user.status || "user";
    if (!allowed.includes(status)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return next();
  };
}

