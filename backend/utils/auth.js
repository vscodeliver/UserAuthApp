const jwt = require("jsonwebtoken");

require("dotenv").config();

// Secret key for signing the access token
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

// Генерация токенов
const generateAccessToken = (user) =>
  jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
const generateRefreshToken = (user) =>
  jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

module.exports = { generateAccessToken, generateRefreshToken };
