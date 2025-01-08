const RefreshToken = require("../models/refreshTokenModel");

// Сохранение refresh-токена
const saveRefreshToken = async (token, email) => {
  try {
    await RefreshToken.create({ token, userEmail: email });
  } catch (error) {
    console.error("Ошибка при сохранении токена:", error);
  }
};

// Удаление refresh-токена
const deleteRefreshToken = async (token) => {
  try {
    await RefreshToken.destroy({ where: { token } });
  } catch (error) {
    console.error("Ошибка при удалении токена:", error);
  }
};

// Проверка валидности refresh-токена
const isRefreshTokenValid = async (token) => {
  try {
    const result = await RefreshToken.findOne({ where: { token } });
    return !!result;
  } catch (error) {
    console.error("Ошибка при проверке токена:", error);
    return false;
  }
};

module.exports = { saveRefreshToken, deleteRefreshToken, isRefreshTokenValid };
