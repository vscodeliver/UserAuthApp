require("dotenv").config();

const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN_SECRET } = process.env;

// Middleware для проверки access токена
exports.protectedRoute = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};
