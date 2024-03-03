const SizeGroup = require('../../models/sizeGroups.model')

// API to create SizeGroup
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        payload.bodyParts = payload.bodyParts ? payload.bodyParts : [];
        let checkDuplicate = await checkDuplicateSizeGroup(payload, 0)
        if (checkDuplicate)
            return res.send({ success: false, message: 'Size Group already exists In this Range' })
        const sizeGroup = await SizeGroup.create(payload)
        return res.send({ success: true, message: 'Size Group created successfully', sizeGroup })
    } catch (error) {
        return next(error)
    }


}

// API to edit SizeGroup
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        payload.bodyParts = payload.bodyParts ? payload.bodyParts : [];
        let checkDuplicate = await checkDuplicateSizeGroup(payload, 1)
        if (checkDuplicate)
            return res.send({ success: false, message: 'Size Group already exists In this Range' })
        const sizeGroup = await SizeGroup.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Size Group updated successfully', sizeGroup })
    } catch (error) {
        return next(error)
    }
}


/**
 * 
 * @param { height, width, bodyParts: []} data 
 */
const checkDuplicateSizeGroup = async (data, isEdit) => {

    const newStartingWidth = data.startingWidth;
    const newEndingWidth = data.endingWidth;
    let sg
    if (data.typeOfSizeGroup == 0) {

        let query = {
            $and: [
                { typeOfSizeGroup: parseInt(data.typeOfSizeGroup) },
                { bodyParts: { $in: data.bodyParts } },
                { isDeleted: { $ne:true } },
                {
                    $or: [
                        {
                            $and: [
                                { startingWidth: { $lte: newStartingWidth } },
                                { endingWidth: { $gte: newStartingWidth } }
                            ]
                        },
                        {
                            $and: [
                                { startingWidth: { $lte: newEndingWidth } },
                                { endingWidth: { $gte: newEndingWidth } }
                            ]
                        },
                        {
                            $and: [
                                { startingWidth: { $gt: newStartingWidth } },
                                { endingWidth: { $lt: newEndingWidth } }
                            ]
                        }
                    ],
                },
            ]

        }
        if (isEdit === 1) {
            query._id = { $ne: data._id };
        }
        sg = await SizeGroup.exists(query);

    }
    else {

        let query = {
            $and: [
                { typeOfSizeGroup: parseInt(data.typeOfSizeGroup) },
                { isDeleted: { $ne:true } },
                {
                    $or: [
                        {
                            $and: [
                                { startingWidth: { $lte: newStartingWidth } },
                                { endingWidth: { $gte: newStartingWidth } }
                            ]
                        },
                        {
                            $and: [
                                { startingWidth: { $lte: newEndingWidth } },
                                { endingWidth: { $gte: newEndingWidth } }
                            ]
                        },
                        {
                            $and: [
                                { startingWidth: { $gt: newStartingWidth } },
                                { endingWidth: { $lt: newEndingWidth } }
                            ]
                        }
                    ],

                },
            ]
        }

        if (isEdit === 1) {
            query._id = { $ne: data._id };
        }
        sg = await SizeGroup.exists(query);
     
    }
    return sg ? true : false
}


// API to delete sizeGroups
exports.delete = async (req, res, next) => {
    try {
        const { sizeGroupId } = req.params
        if (sizeGroupId) {
            // const sizeGroup = await SizeGroup.deleteOne({ _id: sizeGroupId })
            const sizeGroup = await SizeGroup.findByIdAndUpdate({ _id: sizeGroupId }, { $set: {isDeleted: true} }, { new: true })
            if (sizeGroup)
                return res.send({ success: true, message: 'Size Group deleted successfully', sizeGroupId })
            else return res.status(400).send({ success: false, message: 'Size Group not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Size Group Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a sizeGroup
exports.get = async (req, res, next) => {
    try {
        const { sizeGroupId } = req.params
        if (sizeGroupId) {
            const sizeGroup = await SizeGroup.findOne({ _id: sizeGroupId }).lean(true)
            if (sizeGroup)
                return res.json({ success: true, sizeGroup })
            else return res.status(400).send({ success: false, message: 'Size Group not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Size Group Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get SizeGroup list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, all, withDeleted } = req.query
        let { title, status } = req.body
        const filter = {}
        if(!withDeleted){
            filter.isDeleted = {$ne: true}
        }

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await SizeGroup.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)


        let pipeline = [
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]

        if (!all) {
            pipeline.push({ $skip: limit * (page - 1) })
            pipeline.push({ $limit: limit })
        }

        const sizeGroups = await SizeGroup.aggregate(pipeline)


        return res.send({
            success: true,
            data: {
                sizeGroups,
                pagination: {
                    page, limit, total,
                    pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        return next(error)
    }
}