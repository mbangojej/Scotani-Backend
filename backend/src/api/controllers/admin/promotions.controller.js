const Promotion = require('../../models/promotions.model')
const ProductVariation = require('../../models/productVariation.model')
const Product = require('../../models/product.model')
const { checkDuplicate } = require('../../../config/errors')
const xl = require('excel4node');
const fs = require('fs');

// API to create promotion
exports.create = async (req, res, next) => {
    try {
        let payload = req.body

        const promotions = await Promotion.findOne({ promotionCode: payload.promotionCode.toLowerCase() }).lean(true);
       
        if (promotions){
            return res.json({ success: false, exist: true, message: 'Promotion code already exist', promotions })
        }
        payload.customers = payload.customers ? JSON.parse(payload.customers) : [];

        const promotion = await Promotion.create(payload)
        return res.send({ success: true, message: 'Promotion created successfully', promotion })
    } catch (error) {

        // if (error.code === 11000 || error.code === 11001)
        //     checkDuplicate(error, res, 'Promotion')
        // else
            return next(error)
    }
}

exports.edit = async (req, res, next) => {
    try {
        let payload = req.body

        const promotions = await Promotion.findOne({ promotionCode: payload.promotionCode.toLowerCase() }).lean(true);
        if (promotions && promotions._id != payload._id){
            return res.json({ success: false, exist: true, message: 'Promotion code already exist', promotions })
        }


        payload.customers = payload.customers ? JSON.parse(payload.customers) : [];

        const promotion = await Promotion.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Promotion updated successfully', promotion })
    } catch (error) {
        // if (error.code === 11000 || error.code === 11001)
        //     checkDuplicate(error, res, 'Promotion')
        // else
            return next(error)
    }
}

// API to delete promotion
exports.delete = async (req, res, next) => {
    try {
        const { promotionId } = req.params
        if (promotionId) {
            // const promotion = await Promotion.findByIdAndUpdate({ _id: promotionId },{$set: {isDeleted: true}}, {new: true})
            let promotion = await Promotion.findOne({ _id: promotionId })
            promotion.isDeleted = true
            promotion.promotionCode = promotion.promotionCode +' '+ new Date()
            promotion.name = promotion.name +' '+ new Date()
            promotion.save()
            if (promotion)
                return res.send({ success: true, message: 'Promotion deleted successfully', promotionId })
            else return res.status(400).send({ success: false, message: 'Promotion not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Promotion Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a Promotion
exports.get = async (req, res, next) => {
    try {
        const { promotionId } = req.params
        if (promotionId) {
            const promotion = await Promotion.findOne({ _id: promotionId }).lean(true)
            if (promotion)
                return res.json({ success: true, promotion })
            else return res.status(400).send({ success: false, message: 'Promotion not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Promotion Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get Promotion list
exports.list = async (req, res, next) => {
    try {
        let { all, page, limit, withDeleted } = req.query
        let { name, isActive, promotionCode } = req.body
        const filter = {}
        if(!withDeleted){
            filter.isDeleted = { $ne: true }
        }
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (name) {
            name = name.trim()
            filter.name = { $regex: name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
        }
        if (isActive !== undefined) {
            filter.isActive = isActive
        }
        if (promotionCode !== undefined) {
            filter.promotionCode = promotionCode
        }
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10
        const total = await Promotion.countDocuments(filter)

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

        pipeline.push(
            {
                $project: {
                    _id: 1, name: 1, promotionCode: 1, isActive: 1
                }
            }
        )

        const promotions = await Promotion.aggregate(pipeline)

        return res.send({
            success: true,
            data: {
                promotions,
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
