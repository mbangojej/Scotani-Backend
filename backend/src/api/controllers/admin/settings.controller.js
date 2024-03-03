const Settings = require('../../models/settings.model')
const { checkDuplicate } = require('../../../config/errors')

// API to edit Settings
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body;
        console.log("🚀 ~ file: settings.controller.js:8 ~ exports.edit= ~ payload:", payload)
        let settings = await Settings.updateOne({}, { $set: payload }, { new: true })
        settings = await Settings.findOne({}, { __v: 0, createdAt: 0, updatedAt: 0 }).lean(true)
        return res.send({ success: true, message: 'Settings updated successfully', settings })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Settings')
        else
            return next(error)
    }
}

// // API to get Settings
exports.get = async (req, res, next) => {
    try {
        const settings = await Settings.findOne({}, { __v: 0, createdAt: 0, updatedAt: 0 }).lean(true)
        if (settings)
            return res.json({ success: true, settings })
        else
            return res.json({ success: false, message: settings })
    } catch (error) {
        return next(error)
    }
}

exports.imageUpload = async (req, res, next) => {
    try {
        const image = req.file ? `${req.file.filename}` : "";
        return res.json({ success: true, message: 'Logo uploaded successfully', data: image })
    } catch (error) {
        return res.status(400).send({ success: false, message: error });
    }
};
