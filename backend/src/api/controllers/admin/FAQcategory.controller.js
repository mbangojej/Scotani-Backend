const fs = require('fs')
const FAQCategory = require('../../models/faqCategory.model')
const FAQ = require('../../models/faq.model')
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

// API to create Category
exports.create = async (req, res, next) => {
    try {
        let payload = req.body

        const categories = await FAQCategory.findOne({ name:  new RegExp(`^${payload.name}$`, 'i') }).lean(true);
        if (categories){
            return res.json({ success: false, exist: true, message: 'Category name already exist', categories })
        }

        if ((payload.display_order !== null)) {
            const displayOrderExists = await FAQCategory.exists({ display_order: payload.display_order });
            if (displayOrderExists) {
                //return res.json({ success: true, message: 'Display order already exist', faqs })
                return res.status(400).send({ success: false, message: 'Display order already exist' })
            }
        }



        const category = await FAQCategory.create(payload)
        return res.send({
            success: true,
            message: 'FAQ category created successfully',
        })
    } catch (error) {
        return next(error)
    }
}
// API to edit Category
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body

        const categories = await FAQCategory.findOne({ name:  new RegExp(`^${payload.name}$`, 'i') }).lean(true);
        if (categories && categories._id != payload._id){
            return res.json({ success: false, exist: true, message: 'Category name already exist', categories })
        }
        if ((payload.display_order !== null)) {
            const displayOrderExists = await FAQCategory.exists({ display_order: payload.display_order , _id: { $not: { $eq: payload._id } }});
            if (displayOrderExists) {
                //return res.json({ success: true, message: 'Display order already exist', faqs })
                return res.status(400).send({ success: false, message: 'Display order already exist' })
            }
        }


        const category = await FAQCategory.findByIdAndUpdate({
            _id: payload._id
        }, {
            $set: payload
        }, {
            new: true
        })
        return res.send({
            success: true,
            message: 'FAQ category updated successfully',
        })
    } catch (error) {
        return next(error)
    }
}
// API to delete category
exports.delete = async (req, res, next) => {
    try {
        const { categoryId } = req.params

        if (categoryId) {
            const category = await FAQCategory.deleteOne({
                _id: categoryId
            })
            if (category && category.deletedCount) {
                await FAQ.updateMany({
                    category: categoryId
                }, { $set: {  category: null,status: false } }, {
                    new: true
                }
                )
                return res.send({
                    success: true,
                    message: 'FAQ category deleted successfully',
                    categoryId
                })
            }
            else return res.status(400).send({
                success: false,
                message: 'FAQ category not found for given Id'
            })
        } else
            return res.status(400).send({
                success: false,
                message: 'FAQ Category Id is required'
            })
    } catch (error) {
        return next(error)
    }
}

// API to get a category
exports.get = async (req, res, next) => {
    try {
        const {
            categoryId
        } = req.params
        if (categoryId) {
            const category = await FAQCategory.findOne({
                _id: categoryId
            }).lean(true)
            if (category) {
                return res.json({
                    success: true,
                    category
                })

            }
            else return res.status(400).send({
                success: false,
                message: 'FAQ category not found for given Id'
            })
        } else
            return res.status(400).send({
                success: false,
                message: 'FAQ category Id is required'
            })
    } catch (error) {
        return next(error)
    }
}

// API to get category list
exports.list = async (req, res, next) => {
    try {
        let { all,
            page,
            limit
        } = req.query

        let {
            title,
        } = req.body

        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (title) {
            title = title.trim()
         
            filter.name = new RegExp(title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
        }
     

        const total = await FAQCategory.countDocuments(filter)

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
                    _id: 1,
                    name: 1,
                    display_order: 1
                }
            }
        )


        const categories = await FAQCategory.aggregate(pipeline)


        return res.send({
            success: true,
            data: {
                categories,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        return next(error)
    }
}
