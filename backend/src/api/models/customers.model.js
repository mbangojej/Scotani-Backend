const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const {
  pwdSaltRounds,
  jwtExpirationInterval,
  pwEncryptionKey,
  uploadedImgPath,
  userUrl
} = require('../../config/vars');

/**
 * Customer Schema
 * @private
 */
const CustomerSchema = new mongoose.Schema({
  customername: { type: String, required: true },
  mobile: { type: String },
  profileImage: { type: String, default: ""},
  email: { type: String, required: true, lowercase: true, unique: true },
  address: { type: String },
  password: { type: String },
  status: { type: Boolean, default: false },
  fcmToken: { type: String  },
  otp: { type: String  },
  otpCreatedAt: { type: Date, default:null  },
  emailVerified: {type: Boolean, default: false },
  isPasswordReset: {type: Boolean, default: false },
  resetPasswordToken: { type: String },
  expireToken: { type: Date },
  confirmationCode: { type: String },
  accessToken: { type: String },
  sendNotification: {type: Boolean, default: true},
  isDeleted: {type: Boolean, default: false},
  accountDeactivationRequestDate: {type: Date},
}, { timestamps: true }
);

/**
 * Methods
 */



CustomerSchema.method({
  verifyPassword(password) {
    return bcrypt.compareSync(password, this.password);
  },
  transform() {
    const transformed = {};
    const fields = [
      '_id', 
      'customername',
      'mobile',
      'profileImage',
      'email',
      'address',
      'password',
      'status',
      'fcmToken',
      'otp',
      'emailVerified',
      'isPasswordReset',
      'resetPasswordToken',
      'expireToken',
      'confirmationCode',
      'accessToken',
      'sendNotification'
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });
    if(transformed.profileImage){
      transformed.profileImage = `${transformed.profileImage}`
    }else{
      transformed.profileImage = `${uploadedImgPath}default-user-img.jpg`
    }
    return transformed;
  },

  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(playload, pwEncryptionKey);
  },
  generateAccessToken() {
    return Math.floor(Math.random() * Date.now()).toString(36)+Math.floor(Math.random() * Date.now()).toString(36);
  },
});

CustomerSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();
    const rounds = pwdSaltRounds ? parseInt(pwdSaltRounds) : 10;
    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;
    return next();
  }
  catch (error) {
    return next(error);
  }
});

/**
 * @typedef Customer
 */

module.exports = mongoose.model('Customer', CustomerSchema);