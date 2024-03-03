const fs = require('fs')
const Category = require('../../models/category.model')
const Product = require('../../models/product.model')
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

// API to create Category
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        if (payload.category) {

            payload.category = payload.category
        }
        else{
            payload.category = null
        }
        const category = await Category.findOne({ name: new RegExp(`^${payload.name}$`, 'i')})
        if (category) {
            return res.json({ success: false, exist: true, message: 'Category Title already exist', payload })
        }

        await Category.create(payload)
        return res.send({
            success: true,
            message: 'Category created successfully',
        })
    } catch (error) {
        return next(error)
    }
}
// API to edit Category
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body

        if (payload.category) {

            payload.category = payload.category
        }
        else {
            payload.category = null
        }
        const categoryies = await Category.findOne({ name: new RegExp(`^${payload.name}$`, 'i')})
        if (categoryies && categoryies._id != payload._id) {
            return res.json({ success: false, exist: true, message: 'Category Title already exist', categoryies })
        }
        const category = await Category.findByIdAndUpdate({
            _id: payload._id
        }, {
            $set: payload
        }, {
            new: true
        })

        if (payload.status === false) {

            /**
            * Update 13-09-2023 
            * when a parent category is marked as inactive, automatically marks all child categories 
            * and products within that parent category as inactive 
            **/
            const childCategories = await Category.find({ category: payload._id });
            const childCategoryIds = childCategories.map(child => child._id)
            const categoryIdsToUpdate = [...childCategoryIds, payload._id];
            await Category.updateMany({
                category: payload._id
            }, { $set: { status: false } }, {
                new: true
            }
            )

            await Product.updateMany({ category: { $in: categoryIdsToUpdate } }, { $set: { status: false } });

        }
        return res.send({
            success: true,
            message: 'Category updated successfully',
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
            /**
            * Update 13-09-2023 
            * When a parent category is deleted, all child categories and their associated 
            * products should also be automatically marked as inactive
            **/
            const childCategories = await Category.find({ category: categoryId });
            const childCategoryIds = childCategories.map(child => child._id)
            const categoryIdsToUpdate = [...childCategoryIds, categoryId];

            const category = await Category.deleteOne({
                _id: categoryId
            })

            if (category && category.deletedCount) {
                /**remaing part of above updated code **/
                await Category.updateMany({
                    category: categoryId
                }, { $set: { status: false } }, {
                    new: true
                }
                )
                await Product.updateMany({ category: { $in: categoryIdsToUpdate } }, { $set: { status: false } });

                return res.send({
                    success: true,
                    message: 'Category deleted successfully',
                    categoryId
                })
            }
            else return res.status(400).send({
                success: false,
                message: 'Category not found for given Id'
            })
        } else
            return res.status(400).send({
                success: false,
                message: 'Category Id is required'
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
            const category = await Category.findOne({
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
                message: 'Category not found for given Id'
            })
        } else
            return res.status(400).send({
                success: false,
                message: 'Category Id is required'
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
            limit,
            withProducts
        } = req.query

        let {
            title,
            status
        } = req.body

        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        if (!all)
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (title) {
            title = title.trim()
            filter.name = {
                $regex: title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                $options: 'i'
            };
        }
        if (status === "true" || status === true) {
            filter.status = true
        }
        if (status === "false" || status === false) {
            filter.status = false
        }

        const total = await Category.countDocuments(filter)

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

        if (withProducts) {
            pipeline.push({
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    pipeline: [
                        { $project: { title: 1 } }
                    ],
                    as: "products"
                }
            })


            pipeline.push(
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        status: 1,
                        image: 1,
                        products: 1
                    }
                }
            )
        } else {
            pipeline.push(
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'parentCategory',
                    },
                },
                {
                    $unwind: {
                        path: '$parentCategory',
                        preserveNullAndEmptyArrays: true,
                    }
                },
            )


            pipeline.push(
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        parentCategoryName: {
                            $ifNull: ['$parentCategory.name', null],
                        },

                        status: 1,
                        image: 1,
                        category: 1
                    }
                }
            )

        }

        const categories = await Category.aggregate(pipeline)


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


// API to get category list
exports.parentCategories = async (req, res, next) => {
    try {
    
    const filter = {}
        const total = await Category.countDocuments(filter)
       

        let pipeline = [
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]

        pipeline.push(
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'parentCategory',
                },
            },
            {
                $unwind: {
                    path: '$parentCategory',
                    preserveNullAndEmptyArrays: true,
                }
            },
        )


        pipeline.push(
            {
                $project: {
                    _id: 1,
                    name: 1,
                    parentCategoryName: {
                        $ifNull: ['$parentCategory.name', null],
                    },

                    status: 1,
                    image: 1,
                    category: 1
                }
            }
        )



        const categories = await Category.aggregate(pipeline)


        return res.send({
            success: true,
            data: {
                categories,
               
            }
        })
    } catch (error) {
        return next(error)
    }
}
