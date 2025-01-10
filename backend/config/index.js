const PROD_MODE = (exports.PROD_MODE =
  (process.env.RAILWAY_ENVIRONMENT_NAME &&
    process.env.RAILWAY_ENVIRONMENT_NAME === "production") ||
  process.env.NODE_ENV === "production");

exports.cookieOptions = {
  httpOnly: true,
  secure: PROD_MODE,
  sameSite: PROD_MODE ? "none" : "lax",
  path: "/"
};
