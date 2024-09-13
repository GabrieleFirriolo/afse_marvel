const User = require("../models/User");
const jwt = require("jsonwebtoken");

const adminOnly = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");
        console.log(req.user.role);
        if (req.user.role !== "admin") {
          return res.status(403).json({ error: "Access denied" });
        }
      } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Not authorized, token failed" });
      }
    }
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ error: "Not authorized, no token" });
  }
};
module.exports = { adminOnly, protect };
