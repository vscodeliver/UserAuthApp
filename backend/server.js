const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const getControllerPath = name => {
  return require(`./controllers/${name}`);
};

const controllers = {
  captcha: getControllerPath("captcha")
};

const app = express();

const PORT = process.env.PORT || 5000;

const { SESSION_SECRET_KEY } = process.env;

const { PROD_MODE, cookieOptions } = require("./config");

console.log("Production mode:", PROD_MODE);

// Доверять первому прокси (например, Railway)
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://userauthapp-production.up.railway.app",
      'app.netlify.com',
      '*.netlify.app'
    ], // Укажите точный адрес фронтенда
    credentials: true // Разрешить отправку cookies
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MySQLStore = require("express-mysql-session")(session);

const sessionStore = new MySQLStore({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: {
    require: true,
    ca: fs.readFileSync(path.resolve("certificates", "ca.pem")),
    rejectUnauthorized: true
  }
});

// const { RedisStore } = require("connect-redis");
// const { createClient } = require("redis");

// const redisClient = createClient({
//   url: "redis://default:tRPXxIVKLOZLMDowCTUXZynakRqASsIq@autorack.proxy.rlwy.net:51535"
// });

// redisClient.connect().catch(console.error);

app.use(
  session({
    store: sessionStore,
    // store: PROD_MODE ? sessionStore : undefined,
    // store: PROD_MODE ? new RedisStore({ client: redisClient }) : undefined,
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: cookieOptions
  })
);

app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log("Cookies:", req.cookies); // Логирование cookies
//   console.log("Session:", req.session); // Логирование сессии
//   next();
// });

// Routes
app.use("/user", userRoutes);

// Middleware для обслуживания статических файлов
// app.use(express.static(path.join(__dirname, "public")));

// // Перенаправление всех запросов на фронтенд
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

app.listen(PORT, () => {
  console.log(`Сервер доступен по адресу http://localhost:${PORT}`);
});
