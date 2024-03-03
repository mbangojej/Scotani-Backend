const User = require('../../models/customers.model')

exports.editProfile = async (req, res, next) => {
    try {
        const customerId = req.headers['user-identity'];
        let payload = req.body

        payload.customername = payload.fullName
        if (customerId) {
            const customer = await User.findByIdAndUpdate({ _id: customerId }, { $set: payload }, { new: true })

            const data = {
                fullName: customer.customername,
                mobile: customer.mobile,
                address: customer.address
            };
            return res.status(200).send({
                status: 1,
                message: 'Customer updated successfully',
                data
            });
        }
        else {
            return res.status(400).send({ success: false, message: 'Customer Id is required' })
        }
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Customer')
        else
            return next(error)
    }
}
exports.getProfile = async (req, res, next) => {
    try {
        const customerId = req.headers['user-identity'];
        if (customerId) {
            let customer = await User.findOne({ _id: customerId })
            customer = customer.transform()
            
            const data = {
                userId: customer._id,
                fullName: customer.customername,
                email: customer.email,
                phone: customer.mobile,
                address: customer.address,
                userImage: customer.profileImage,
                emailVerified: customer.emailVerified ? 1 : 0,
                sendNotification: customer.sendNotification ? 1 : 0
            }
            return res.status(200).send({
                status: 1,
                message: 'Customer fetched',
                data
            });
        }
        else {
            return res.status(400).send({ success: false, message: 'Customer Id is required' })
        }
    } catch (error) {
        return res.status(400).send({ success: false, message: 'Something went wrong' })
    }
}