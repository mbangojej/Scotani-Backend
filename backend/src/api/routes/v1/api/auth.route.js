const express = require('express');
const controller = require('../../../controllers/api/auth.controller');
const { uploadMultipleImages,uploadSingle } = require('../../../utils/upload')

const router = express.Router();

router.route('/signin').post(controller.sigin);
// router.route('/signup').post(profileUpload,controller.register);
router.route('/signup').post(controller.register);
router.route('/forgot-password').post(controller.forgotPassword);
router.route('/logout').post(controller.logout);
router.route('/account-deactivation-request').post(controller.accountDeactivationRequest);

router.route('/change-password').post(controller.changePassword)
router.route('/verify-otp').post(controller.verifyOtp);
router.route('/resend-otp').post(controller.resendOtp);
router.route('/upload-multiple-images').post(uploadMultipleImages, controller.multiImageUpload);
router.route('/upload-image').post(uploadSingle, controller.imageUpload);
router.route('/onboarding-screen').get(controller.onBoardingScreen);
router.route('/report-issue-bug').post(controller.reportIssueBug);
router.route('/bug-reports').get(controller.reportIssueBug);
router.route('/get-settings').get(controller.getSettings);
module.exports = router;