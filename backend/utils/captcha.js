const svgCaptcha = require("svg-captcha");

module.exports.generateCaptcha = () => {
  return svgCaptcha.create({
    noise: 3,
    color: true,
    background: "#f4f4f4",
  });
};

module.exports.validateCaptcha = (sessionCaptcha, userInput) => {
  return sessionCaptcha === userInput;
};
