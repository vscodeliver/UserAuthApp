const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const sequelize = new Sequelize(process.env.MYSQL_SERVICE_URI, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      require: true,
      ca: fs.readFileSync(path.resolve("certificates", "ca.pem")),
      rejectUnauthorized: true,
    },
  },
});

(async () => {
  try {
    await sequelize.sync(); // Синхронизация моделей
    console.log("База данных синхронизирована");
  } catch (error) {
    console.error("Ошибка синхронизации базы данных:", error);
  }
})();

module.exports = sequelize;
