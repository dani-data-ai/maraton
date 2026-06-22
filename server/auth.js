const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET env var is not set");

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "30d" });
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Neautentificat" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalid" });
  }
}

function requireMentor(req, res, next) {
  if (req.user?.role !== "MENTOR") return res.status(403).json({ error: "Doar mentorii" });
  next();
}

module.exports = { sign, authMiddleware, requireMentor };
