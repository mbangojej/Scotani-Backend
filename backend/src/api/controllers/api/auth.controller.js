const Customer = require('../../models/customers.model');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { sendEmail } = require('../../utils/emails/emails')
const randomstring = require("randomstring");
const mongoose = require("mongoose")
const { uploadedImgPath } = require('../../../config/vars')
const Settings = require('../../models/settings.model');
const BugReport = require('../../models/bugReport.model');
const { removeBackground } = require('../../utils/util')
const uploadsDir = './src/uploads/'
const imagesDir = `${uploadsDir}images`
const { sendPushNotification } = require('../../../config/firebase')
const moment = require("moment")
const axios = require('axios')
const fs = require('fs');
const path = require('path');
/**
 * Returns jwt token if valid email and password is provided
 * @public
 */
exports.sigin = async (req, res, next) => {
    try {
        let { email, password, fcmToken } = req.body;

        req.body.email = email
        req.body.password = password
        if (email)
            email = email.toLowerCase();

        if (email && password) {
            passport.use(new localStrategy({ usernameField: 'email' },
                (username, password, done) => {
                    Customer.findOne({ email: username, isDeleted: { $ne: true } }, (err, customer) => {
                        if (err)
                            return done(err);
                        if (customer && customer.password === undefined) // unregistered email
                            return done(null, false, { status: 0, message: 'Customer does not exist!' });
                        else if (!customer) // unregistered email
                            return done(null, false, { status: 0, message: 'Customer does not exist!' });
                        else if (!customer.verifyPassword(password)) // wrong password
                            return done(null, false, { status: 0, message: 'Incorrect password' });
                        else return done(null, customer);
                    }).populate({ path: "roleId", select: 'title' });
                })
            );
            // call for passport authentication
            passport.authenticate('local', async (err, customer, info) => {
                if (err) return res.status(400).send({ err, status: 0, message: 'Oops! Something went wrong while authenticating' });
                else if (customer) {
                    if (customer.status != true) // inactive user
                        return res.status(200).send({ status: 0, message: 'Your account is not active. Contact Admin' });
                    if(customer.fcmToken){
                        sendPushNotification(customer.fcmToken, 'Session Logout', 'Your account has been logged in to another device', true)
                    }
                    var accessToken = await customer.token();
                    customer = customer.transform()
                    let data = {
                        userId: customer._id,
                        accessToken: accessToken,
                        fullName: customer.customername,
                        email: customer.email,
                        phone: customer.mobile,
                        address: customer.address,
                        userImage: customer.profileImage,
                        emailVerified: customer.emailVerified ? 1 : 0,
                        sendNotification: customer.sendNotification ? 1 : 0
                    }    
                    await Customer.updateOne({ _id: customer._id }, { $set: { accessToken, deviceId: fcmToken, fcmToken: fcmToken, accountDeactivationRequestDate: null } }, { upsert: true });
                    return res.status(200).send({ status: 1, message: 'You have logged in successfully', data });
                }
                // unknown user or wrong password
                else return res.status(200).send({ status: 0, message: info.message });
            })(req, res);
        } else
            return res.status(200).send({ status: 0, message: 'Email & password required' });
    } catch (error) {
        return next(error);
    }
}

exports.accountDeactivationRequest = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];
        let customer = await Customer.findOne({ _id: mongoose.Types.ObjectId(userAgent) })
        if (!customer) {
            return res.status(200).send({ status: 0, message: 'Invalid Request', data: {} })
        }
        const settings = await Settings.findOne({},{userAccountDeletionDays:1}) 
        const currentDate = new Date();
        await Customer.updateOne({ _id: customer._id }, { $set: {accountDeactivationRequestDate: new Date } }, { new: true });
        return res.status(200).send({ status: 1, message: `Account deactivation request received. Your account data will be deleted in ${settings.userAccountDeletionDays} days` });
    } catch (error) {
        return next(error);
    }
}

exports.register = async (req, res, next) => {
    try {
        let { fullName, email, phone, password, address, fcmToken, profileImage } = req.body;
        if (!fullName || !email || !phone || !password) {
            return res.status(200).send({ status: 0, message: `Parameters missing ${!fullName ? "FullName" : ""}  ${!email ? "email" : ""}  ${!phone ? "phone" : ""}  ${!password ? "password" : ""}` });
        }
        email = email.toLowerCase().trim();
        let customer = await Customer.findOne({ email });
        if (customer) {
            return res.status(200).send({ status: 0, message: 'Customer already exists' });
        }
        customer = await Customer.create({
            customername: fullName,
            mobile: phone,
            profileImage: profileImage,
            email: email,
            address: address,
            password: password,
            status: true,
            fcmToken: fcmToken
        });

        const otp = randomstring.generate({ length: 6, charset: 'numeric' })
        const settings = await Settings.findOne({}, { 'registrationEmailRecipients': 1 }).lean(true);    
        let adminEmails = settings.registrationEmailRecipients
        adminEmails = adminEmails.split(",")
        let emailData = {
            email: customer.email,
            name: customer.customername,
            otp: otp,
            bcc: adminEmails
        }
        await sendEmail('verify-user-otp', emailData)
        var accessToken = await customer.token();
        customer.accessToken = accessToken
        customer.otp = otp
        customer.otpCreatedAt = new Date()
        customer.save()
        customer = customer.transform();

        let data = {
            userId: customer._id,
            accessToken: accessToken,
            fullName: customer.customername,
            email: customer.email,
            phone: customer.mobile,
            address: customer.address,
            userImage: customer.profileImage,
            emailVerified: customer.emailVerified ? 1 : 0,
            sendNotification: customer.sendNotification ? 1 : 0,
        }
        return res.status(200).send({ status: 1, message: 'Email registered successfully! Kindly check you email for OTP Code', data: data })

    } catch (error) {
        next(error)
    }
}

exports.verifyOtp = async (req, res, next) => {
    try {
        let { userId, otp, type } = req.body;               // type 1: Email Verification , 2 : Password Reset
        if (!userId || !otp || !type) {
            return res.status(200).send({ status: 0, message: 'Parameters missing' });
        }
        let customer = await Customer.findOne({ _id: mongoose.Types.ObjectId(userId) });
        if (!customer) {
            return res.status(200).send({ status: 0, message: 'Customer does not exist' });
        }
        if (customer.otp == otp) {
            if(moment().diff(moment(customer.otpCreatedAt)) < (1000 * 5 * 60)){
                // customer.otp = ''
                if (type == 1) {                  // Email Verification
                    customer.emailVerified = true
                } else if (type == 2) {            // Password Reset
                    customer.isPasswordReset = true
                }
                customer.save()
                return res.status(200).send({ status: 1, message: 'Otp validated' })
            }
            return res.status(200).send({ status: 0, message: 'Otp Expired' })
        } else {
            return res.status(200).send({ status: 0, message: 'In-valid OTP' })
        }
    } catch (error) {
        next(error)
    }
}

exports.resendOtp = async (req, res, next) => {
    const { userId } = req.body
    let customer = await Customer.findOne({ _id: mongoose.Types.ObjectId(userId) })
    if (!customer) {
        return res.status(200).send({ status: 0, message: 'Invalid Request', data: {} })
    }
    const otp = randomstring.generate({ length: 6, charset: 'numeric' })

    let emailData = {
        email: customer.email,
        name: customer.customername,
        otp: otp
    }
    await sendEmail('verify-user-otp', emailData)
    customer.otp = otp
    customer.otpCreatedAt = new Date()
    customer.save()
    customer = customer.transform();

    return res.status(200).send({ status: 1, message: 'Otp sent. Kindly check you email for the code', data: { otp: otp } })
}

exports.forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body;
        if (email) {
            email = email.toLowerCase();
            await Customer.findOne({ email: email }, async (err, customer) => {
                if (err) return res.status(400).send({ err, status: 0, message: 'Oops! Something went wrong while finding' });
                if (customer) {
                    const otp = randomstring.generate({ length: 6, charset: 'numeric' })
                    customer.otp = otp;
                    customer.otpCreatedAt = new Date()
                    customer.save();

                    let content = { "${otp}": otp }
                    let emailData = {
                        email: customer.email,
                        name: customer.customername,
                        otp: otp
                    }
                    await sendEmail('verify-user-otp', emailData)
                    customer = customer.transform();

                    let data = {
                        userId: customer._id,
                        otp: otp,
                    }
                    res.status(200).send({ status: 1, message: 'Email sent successfully', data });
                } else return res.status(200).send({ status: 0, message: 'Invalid Customer' });
            });
        } else return res.status(200).send({ status: 0, message: 'Please enter email' });
    } catch (error) {
        next(error)
    }
}
/**
 * Removes jwt token if valid email and password is provided
 * @public
 */
exports.logout = async (req, res, next) => {
    try {
        let { userId } = req.body;

        let customer = await Customer.findOne({ _id: mongoose.Types.ObjectId(userId) });
        if (customer) {
            await Customer.updateOne({ _id: userId }, { $set: { accessToken: '', fcmToken: '' } }, { upsert: true });
            return res.status(200).send({ status: 1, message: 'You have logged out successfully' });
        }
    } catch (error) {
        return next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    let { email, oldPassword, newPassword } = req.body;

    const user = await Customer.findOne({ email }).lean(true);

    if (!user)
        return res.status(400).send({ success: false, message: 'Oops! Something went wrong while finding' })

    // If password is beind updated from the profile
    if (oldPassword) {

        Customer.findOne({ email: email }, (err, customer) => {
            if (err) return res.status(400).send({ err, success: false, message: 'Oops! Something went wrong while finding' });

            if (customer && customer.verifyPassword(oldPassword)) {
                customer.password = newPassword;
                customer.isPasswordReset = false;
                customer.save();

                // password has been successfully change
                return res.status(200).send({ success: true, message: 'Your password has been updated successfully!' });
            } else {
                return res.status(200).send({ message: 'Incorrect old password', success: false });
            }
        });


    } else {

        Customer.findOne({ email: email }, (err, customer) => {
            if (err) return res.status(400).send({ err, success: false, message: 'Oops! Something went wrong while finding' });

            if (customer && customer.isPasswordReset) {
                customer.password = newPassword;
                customer.isPasswordReset = false;
                customer.save();

                // password has been successfully change
                return res.status(200).send({ success: true, message: 'Your password has been updated successfully!' });
            } else {
                return res.status(200).send({ message: 'Unsuccessful! Password Cannot be updated', success: false });
            }
        });
    }
}
// API to upload image 
exports.imageUpload = async (req, res, next) => {
    try {

        const image = req.file ? `${req.file.filename}` : "";
        if (image) {
            return res.status(200).send({ status: 1, message: 'Image upload successfully', imageURL: uploadedImgPath + image });
        }
        else return res.status(200).send({ status: 0, message: 'Please upload the image' });

    } catch (error) {
        next(error)
    }
}
// API to upload multiple images 
exports.multiImageUpload = async (req, res, next) => {
    try {
        const { removeBg, imageUrls } = req.body
        let reponseImages = []

        let fileName = null
        for(let i=0; i<imageUrls.length; i++){
            fileName =  Date.now() + '.png'
            if(removeBg && (removeBg === 1 || removeBg === '1') ){
                await removeBackground(imageUrls[i], imagesDir+'/'+fileName)
            }else{
                let response = await axios.get(imageUrls[i], { responseType: 'arraybuffer' });
                let localImagePath = imagesDir+'/'+fileName;
                await fs.writeFileSync(localImagePath, Buffer.from(response.data));
            }
            reponseImages.push(uploadedImgPath + fileName)
        }
        
        return res.status(200).send({ status: 1, message: 'Images uploaded successfully', images: reponseImages });
    } catch (error) {
        next(error)
    }
}
// Get onboarding Screen Data from Setting 
exports.onBoardingScreen = async (req, res, next) => {
    try {
        const settings = await Settings.findOne({}, { 'splashScreen.text': 1, 'splashScreen.image': 1 }).lean(true);
        if (settings && settings.splashScreen) {

            const updatedSplashScreenData = settings.splashScreen.map(item => {
                item.image = uploadedImgPath + item.image;
                return item;
            });

            return res.status(200).send({
                status: 1,
                message: 'Splash Screen fetched',
                splashData: updatedSplashScreenData
            });
        } else {
            return res.status(200).send({ status: 0, message: 'No Splash Screen data found' });
        }
    } catch (error) {
        return next(error);
    }
}
// API to save report  bug 
exports.reportIssueBug = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];
        const { name, email, phone, subject, message } = req.body
        if (!name || !email || !phone || !subject || !message) {
            return res.status(200).send({ status: 0, message: 'Parameters missing' });
        }


        const bugReportPayload = {
            ...req.body,
            customer: userAgent
        };

        const bugReport = await BugReport.create(bugReportPayload);
        return res.status(200).send({
            status: 1,
            message: 'Bug report submitted successfully',
            data: {
                bugReport
            }
        });
    } catch (error) {
        return next(error)
    }
};

exports.getSettings = async (req, res, next) => {
    let settings = await Settings.findOne({},{email: 1, phone: 1, address: 1, instagram: 1, facebook: 1, twitter: 1, linkedin: 1})
    return res.status(200).send({
        status: 1,
        message: 'Bug report submitted successfully',
        data: {
            settings
        }
    });
}