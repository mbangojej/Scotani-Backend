var admin = require("firebase-admin");
var serviceAccount = require("./firebase-sdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

// module.exports.admin = admin

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

exports.sendPushNotification = async (registrationToken, title, message, logout = null) => {
    try {
        const options = notification_options
        var message_notification = {
            notification: {
                title: title,
                body: message,
                logout: logout ? '1' : '0'
            },
        };
        message_notification.data = {}
        message_notification.data.title = title
        message_notification.data.body = message
        message_notification.data.logout = logout ? '1' : '0'

        admin.messaging().sendToDevice(registrationToken, message_notification, options)
            .then(async (response) => {
            })
            .catch(error => {
            });
    }
    catch (error) {
        console.log('firebaseerror', error)
    }
}