require('dotenv').config();

module.exports = {
  serverUrl: process.env.SERVER_URL,

  frontendUrl: process.env.FRONTEND_URL,
  cdnUrl: process.env.CDN_URL,
  
  uploadDir: process.env.UPLOAD_DIR,
  
  tokenSecret: process.env.TOKEN_SECRET,
  tokenLife: process.env.TOKEN_LIFE,
  tokenRefreshSecret: process.env.TOKEN_REFRESH_SECRET,
  tokenRefreshLife: process.env.TOKEN_REFRESH_LIFE,
  
  tokenVerifySecret: process.env.TOKEN_VERIFY_SECRET,
  tokenVerifyLife: process.env.TOKEN_VERIFY_LIFE,
  tokenPasswordSecret: process.env.TOKEN_PASSWORD_SECRET,
  tokenPasswordLife: process.env.TOKEN_PASSWORD_LIFE,
};