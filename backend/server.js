const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const getControllerPath = (name) => {
  return require(`./controllers/${name}`);
};

const controllers = {
  captcha: getControllerPath("captcha")
};

const app = express();

const PORT = process.env.PORT || 5000;

const { SESSION_SECRET_KEY } = process.env;

const PROD_MODE =
  (process.env.RAILWAY_ENVIRONMENT_NAME &&
    process.env.RAILWAY_ENVIRONMENT_NAME === "production") ||
  process.env.NODE_ENV === "production";

console.log("Production mode:", PROD_MODE);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://userauthapp-production.up.railway.app",
      "https://userauthtestapp.netlify.app"
    ], // Укажите точный адрес фронтенда
    credentials: true // Разрешить отправку cookies
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const MySQLStore = require("express-mysql-session")(session);

// const sessionStore = new MySQLStore({
//   host: "mysql-auth-app-test-task-user-auth-it-task-test-app.c.aivencloud.com",
//   port: 14311,
//   user: "railway",
//   password: "AVNS_y2i4Rf_MwgLo3hCtHq0",
//   database: "defaultdb",
//   ssl: {
//     require: true,
//     ca: fs.readFileSync(path.resolve("certificates", "ca.pem")),
//     rejectUnauthorized: true
//   }
// });

const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://default:tRPXxIVKLOZLMDowCTUXZynakRqASsIq@autorack.proxy.rlwy.net:51535"
});
redisClient.connect().catch(console.error);

app.use(
  session({
    // store: sessionStore,
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: PROD_MODE, // Для разработки secure: false (HTTPS не требуется)
      httpOnly: true,
      sameSite: "none"
    }
  })
);

app.use(cookieParser());

app.use((req, res, next) => {
  console.log("Cookies:", req.cookies); // Логирование cookies
  console.log("Session:", req.session); // Логирование сессии
  next();
});

// Пример маршрута для тестирования cookies
app.get("/test", (req, res) => {
  if (!req.session.viewCount) {
    req.session.viewCount = 1;
  } else {
    req.session.viewCount++;
  }

  console.log("Session data:", req.session);

  res.json({
    success: true,
    viewCount: req.session.viewCount
  });
});

// Routes
app.use("/user", userRoutes);

// Middleware для обслуживания статических файлов
// app.use(express.static(path.join(__dirname, "public")));

// Перенаправление всех запросов на фронтенд
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

app.listen(PORT, () => {
  console.log(`Сервер доступен по адресу http://localhost:${PORT}`);
});
