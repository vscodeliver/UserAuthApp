const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();

const getControllerPath = (name) => {
  return require(`./controllers/${name}`);
};

const controllers = {
  captcha: getControllerPath("captcha"),
};

const app = express();

const PORT = process.env.PORT || 5000;

const { SESSION_SECRET_KEY } = process.env;

const PROD_MODE =
  (process.env.RAILWAY_ENVIRONMENT_NAME &&
    process.env.RAILWAY_ENVIRONMENT_NAME === "production") ||
  process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://userauthapp-production.up.railway.app",
      "https://userauthtestapp.netlify.app",
    ], // Укажите точный адрес фронтенда
    credentials: true, // Разрешить отправку cookies
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: PROD_MODE,
      httpOnly: true,
      sameSite: "none",
    }, // Для разработки secure: false (HTTPS не требуется)
  })
);
app.use(cookieParser());

app.use((req, res, next) => {
  // console.log("Session:", req.session.captcha);
  next();
});

// Routes
app.use("/user", userRoutes);

// Middleware для обслуживания статических файлов
// app.use(express.static(path.join(__dirname, "public")));

// Перенаправление всех запросов на фронтенд
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Сервер доступен по адресу http://localhost:${PORT}`);
});
