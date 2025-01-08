const captcha = require("../utils/captcha");

function generateCaptcha(req, res) {
  const captchaCode = captcha.generateCaptcha();
  req.session.captcha = captchaCode.text; // Сохраняем капчу в сессии

  console.log(req.session.captcha);

  // Устанавливаем тип контента как image/svg+xml
  res.setHeader("Content-Type", "image/svg+xml");
  res.send(captchaCode.data); // Отправляем SVG-код клиенту
}

module.exports = {
  generate: generateCaptcha,
};
