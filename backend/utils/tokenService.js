// utils/tokenService.js
const RefreshToken = require("../models/refreshTokenModel"); // Убедитесь, что путь правильный

/**
 * Сохраняет refresh токен в базе данных.
 * @param {string} token - Refresh токен.
 * @param {string} email - Email пользователя.
 */
async function saveRefreshToken(token, email) {
  try {
    await RefreshToken.create({ token, userEmail: email });
    console.log("Refresh токен сохранён.");
  } catch (error) {
    console.error("Ошибка сохранения refresh токена:", error);
    throw error;
  }
}

/**
 * Удаляет refresh токен из базы данных.
 * @param {string} token - Refresh токен.
 */
async function deleteRefreshToken(token) {
  try {
    const result = await RefreshToken.destroy({ where: { token } });
    if (result === 0) {
      throw new Error("Refresh токен не найден.");
    }
    console.log("Refresh токен удалён.");
  } catch (error) {
    console.error("Ошибка удаления refresh токена:", error);
    throw error;
  }
}

/**
 * Проверяет валидность refresh токена.
 * @param {string} token - Refresh токен.
 * @returns {boolean} - true если валиден, иначе false.
 */
async function isRefreshTokenValid(token) {
  try {
    const foundToken = await RefreshToken.findOne({ where: { token } });
    return !!foundToken;
  } catch (error) {
    console.error("Ошибка проверки refresh токена:", error);
    return false;
  }
}

module.exports = {
  saveRefreshToken,
  deleteRefreshToken,
  isRefreshTokenValid,
};
