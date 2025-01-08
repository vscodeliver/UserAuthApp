const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");

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

app.use(
  cors({
    origin: "http://localhost:5173", // Укажите точный адрес фронтенда
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
    cookie: { secure: false, httpOnly: false }, // Для разработки secure: false (HTTPS не требуется)
  })
);
app.use(cookieParser());

app.use((req, res, next) => {
  // console.log("Session:", req.session.captcha);
  next();
});

// Routes
app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Сервер доступен по адресу http://localhost:${PORT}`);
});
