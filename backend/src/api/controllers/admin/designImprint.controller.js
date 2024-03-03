const DesignImprint = require('../../models/designImprint.model')

// API to create Design Imprint
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        const design = await DesignImprint.findOne({ title:  new RegExp(`^${payload.title}$`, 'i') })

        if (design){
            return res.json({ success: false, exist: true, message: 'Design imprint already exist', payload })
        }

        if (!payload.title || !payload.price)
            return res.send({ success: false, message: 'Validation failed' })
        const designImprint = await DesignImprint.create(payload)
        return res.send({ success: true, message: 'Design Imprint created successfully', designImprint })
    } catch (error) {
        return next(error)
    }

}

// API to edit Design Imprint
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body

        const design = await DesignImprint.findOne({ title:   new RegExp(`^${payload.title}$`, 'i') })

        if (design && design._id != payload._id){
            return res.json({ success: false, exist: true, message: 'Design imprint already exist', payload })
        }

        if (!payload.title || !payload.price)
            return res.send({ success: false, message: 'Validation failed' })

        const designImprint = await DesignImprint.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Design Imprint updated successfully', designImprint })
    } catch (error) {
        return next(error)
    }
}

// API to delete designImprint
exports.delete = async (req, res, next) => {
    try {
        const { designImprintId } = req.params
        if (designImprintId) {
            // const designImprint = await DesignImprint.deleteOne({ _id: designImprintId })
            // const designImprint = await DesignImprint.findByIdAndUpdate({ _id: designImprintId }, {$set: { isDeleted: true}}, {new: true})
            let designImprint = await DesignImprint.findOne({ _id: designImprintId })
            designImprint.isDeleted = true
            designImprint.title = designImprint.title +' '+ new Date()
            designImprint.save()
            if (designImprint)
                return res.send({ success: true, message: 'Design Imprint deleted successfully', designImprintId })
            else return res.status(400).send({ success: false, message: 'Design Imprint not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Design Imprint Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a Design Imprint
exports.get = async (req, res, next) => {
    try {
        const { designImprintId } = req.params
        if (designImprintId) {
            const designImprint = await DesignImprint.findOne({ _id: designImprintId }, { _id: 1, title: 1, price: 1, status: 1 }).lean(true)
            if (designImprint)
                return res.json({ success: true, designImprint })
            else return res.status(400).send({ success: false, message: 'Design Imprint not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Design Imprint Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get design Imprint list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, withDeleted } = req.query
        let { title, status } = req.body
        const filter = {}
        if(!withDeleted){
            filter.isDeleted = { $ne: true }
        }
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (title) {
            title = title.trim()
            filter.title = { $regex: title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
        }
        if (status === "true" || status === true) {
            filter.status = true
        }
        if (status === "false" || status === false) {
            filter.status = false
        }
        const total = await DesignImprint.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const designImprints = await DesignImprint.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, title: 1, status: 1, price: 1
                }
            }
        ])

        return res.send({
            success: true,
            data: {
                designImprints,
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