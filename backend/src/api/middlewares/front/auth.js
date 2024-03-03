const byPassedRoutes = [ 
    '/v1/api/auth/signup', 
    '/v1/api/auth/signin', 
    '/v1/api/auth/forgot-password', 
    '/v1/api/auth/change-password', 
    '/v1/api/auth/logout', 
    '/v1/api/auth/resend-otp', 
    '/v1/api/auth/verify-otp', 
    '/v1/api/faqs/list', 
    '/v1/api/auth/onboarding-screen', 
    '/v1/api/auth/upload-image', 
    '/v1/api/auth/get-settings', 
    '/v1/api/auth/upload-multiple-images',
    '/v1/api/notifications/test-notification',
    '/v1/api/notifications/test-notification?email=mussadaq900@gmail.com',
    '/v1/api/notifications/test-notification?email=mussadaq900@gmail.com&logout=1',
];
const mongoose = require('mongoose');
const Customer = require('../../models/customers.model');
const CryptoJS = require("crypto-js");
const env = require('../../../config/vars')

exports.authenticate = async (req, res, next) => {
    if (req.originalUrl.indexOf("/v1/admin") > -1) {
        if (byPassedRoutes.indexOf(req.originalUrl) > -1 || req.originalUrl.indexOf("/v1/xyz") > -1) {
            next();
        }
        else {
            if (req.headers['x-auth-token']) {
                if (req.headers['x-auth-token'] == env.xAuthToken) {
                    next();
                }
                else if (req.method.toLocaleLowerCase() !== 'options') {
                    const message = 'auth_request_required_front_error2'
                    return res.status(405).json({ success: false, message });
                }
                else {
                    next();
                }
            }
            else if (req.method.toLocaleLowerCase() !== 'options' &&
                (req.url.indexOf('/v1/admin/staff/private-admin') > -1)) {
                next()
            }
            else if (req.method.toLocaleLowerCase() !== 'options') {
                const message = 'auth_request_required_front_error3'
                return res.status(405).json({ success: false, message });
            }
            else {
                next();
            }
        }
    }
    else if (req.originalUrl.indexOf("/v1/api") > -1) {
        if (byPassedRoutes.indexOf(req.originalUrl) > -1) {
            next();
        }else{
            if (req.headers['access-token'] && req.headers['user-identity']) {
                let customer = await Customer.findOne({
                    _id: mongoose.Types.ObjectId(req.headers['user-identity']),
                    accessToken: req.headers['access-token']
                })
                if (customer) {
                    req.body['userId'] = customer._id
                    next();
                }
                else {
                    const message = 'Authentication Failed1'
                    return res.status(405).json({ success: false, message });
                }
            }else{
                const message = 'Authentication Failed2'
                return res.status(405).json({ success: false, message });
            }
        }
    }
    else {
        next();
    }
}

exports.userValidation = async (req, res, next) => {
    next();
}

exports.apiValidation = async (req, res, next) => {
   
}
