const path = require('path');
// import .env variables
require('dotenv').config();
module.exports = {
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  encryptionKey: process.env.ENCRYPTION_KEY,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  frontEncSecret: process.env.FRONT_ENC_SECRET,
  adminUrl: process.env.ADMIN_URL,
  emailAdd: process.env.EMAIL,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  mailgunApi: process.env.MAILGUN_API_KEY,
  appEmail: process.env.EMAIL,
  appPassword: process.env.APP_PASSWORD,
  pwEncryptionKey: process.env.PW_ENCRYPTION_KEY,
  pwdSaltRounds: process.env.PWD_SALT_ROUNDS,
  globalImgPlaceholder: '/img/placeholder.png',
  uploadedImgPath: process.env.UPLOADED_IMAGE_BASE_URL,
  baseUrl: process.env.BASE_URL,
  tokenNameToValue: {
    'ANN': 1,
    'WBNB': 2
  },
  adminPasswordKey: process.env.ADMIN_PASSWORD_KEY,
  xAuthToken: process.env.XAUTHTOKEN,
  authorization: process.env.AUTHORIZATION,
  removeBgApiKey: process.env.REMOVE_BG_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalSecretKey: process.env.PAYPAL_SECRET_KEY,
};
