const DesignImprint = require('../../models/designImprint.model')

// API to get DEsignImprints
exports.list = async (req, res, next) => {
    try {
             
        const imprints = await DesignImprint.aggregate([
            {
                $match: { status: true, isDeleted: {$ne: true} }
            },
            {
                $project: {
                    title: 1,
                    price:1
                }
            }
        ])

          
        return res.status(200).send({
            status: 1,
            message: 'Design Imprints fetched',
            data: imprints
        });


    } catch (error) {
        return next(error)
    }
};

