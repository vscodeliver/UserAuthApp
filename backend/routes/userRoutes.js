const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { generateCaptcha } = require("../utils/captcha");
const { generateAccessToken, generateRefreshToken } = require("../utils/auth");
const {
  saveRefreshToken,
  deleteRefreshToken,
  isRefreshTokenValid
} = require("../utils/tokenService");
const validator = require("validator");
const { protectedRoute } = require("../middleware/protectedRoute");

require("dotenv").config();

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const router = express.Router();

router.get("/validate", protectedRoute, (req, res) => {
  res.json({ valid: true }); // Возвращаем, что токен действителен
});

// Регистрация
router.post("/register", async (req, res) => {
  const { email, password, captchaCode } = req.body;

  // Проверка капчи
  // if (req.session.captcha !== captchaCode) {
  //   return res.status(400).json({ error: "Неверная капча" });
  // }

  if (!email.trim().replace(/\s+/g)) {
    return res.status(400).json({ error: "Введите E-Mail для регистрации!" });
  }

  // Проверка валидности email
  if (!validator.isEmail(email.trim())) {
    return res.status(400).json({ error: "Неверный формат email" });
  }

  // Проверка сложности пароля
  if (
    !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
      password
    )
  ) {
    return res
      .status(400)
      .json({ error: "Пароль не соответствует требованиям" });
  }

  try {
    // Проверка существующего пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    // Хэширование пароля и создание пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: "Регистрация успешна" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Авторизация
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Проверка капчи
  // if (req.session.captcha !== captchaCode) {
  //   return res.status(400).json({ error: "Неверная капча" });
  // }

  if (!email.trim()) {
    return res.status(400).json({ error: "Укажите свой E-Mail" });
  }

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ error: "Укажите настоящий адрес электронной почты" });
  }

  try {
    // Поиск пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Пользователь не найден" });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Неверный пароль" });
    }

    const accessToken = generateAccessToken({ email: user.email });
    const refreshToken = generateRefreshToken({ email: user.email });

    await saveRefreshToken(refreshToken, user.email);

    const PROD_MODE = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken);

    res.json({ accessToken, message: "Авторизация успешна" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/captcha", (req, res) => {
  try {
    const captcha = generateCaptcha();

    req.session.captcha = captcha.text; // Save captcha text in the session

    console.log("Generated captcha:", req.session.captcha);

    res.setHeader("Content-Type", "image/svg+xml"); // Specify the correct content type
    res.send(captcha.data); // Send the SVG image
  } catch (error) {
    console.error("Error generating captcha:", error);
    res.status(500).json({ error: "Failed to generate captcha" });
  }
});

router.post("/verify-captcha", (req, res) => {
  const { captchaCode } = req.body;

  // console.log('Request session:', req.session);

  if (req.session.captcha) {
    if (req.session.captcha.toLowerCase() === captchaCode.toLowerCase()) {
      res.json({ success: true, message: "Капча подтверждена" });
    } else {
      res.json({ success: false, message: "Неверная капча" });
    }
  } else {
    // console.log("Req session captcha:", req.session.captcha);
    res.json({ success: false, message: "Сессия отсутствует или истекла" });
  }
});

// Получение нового access токена
router.post("/token", async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken || !(await isRefreshTokenValid(refreshToken))) {
    return res.status(403).json({ error: "Недействительный токен" });
  }

  try {
    const user = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken({ email: user.email });
    res.json({ accessToken });
  } catch (err) {
    console.error("Ошибка обновления токена:", err);
    res.status(403).json({ error: "Ошибка проверки токена" });
  }
});

// Пример защищённого маршрута
router.get("/", protectedRoute, (req, res) => {
  res.json({
    message: "Доступ к защищённому ресурсу получен",
    user: req.user
  });
});

// Выход из системы
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh токен отсутствует" });
  }

  try {
    await deleteRefreshToken(refreshToken);
    res.clearCookie("refreshToken");
    res.json({ message: "Вы успешно вышли из системы" });
  } catch (err) {
    console.error("Ошибка выхода из системы:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
