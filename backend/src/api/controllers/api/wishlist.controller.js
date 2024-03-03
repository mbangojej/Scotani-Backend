const SizeGroup = require('../../models/sizeGroups.model')
const Wishlist = require('../../models/wishList.model')
const Product = require('../../models/product.model')
const mongoose = require('mongoose');

// API for Add to wishlist
exports.addToWishlist = async (req, res, next) => {
    try {
        const customerId = req.headers['user-identity'];
        let payload = req.body
        payload.customer = mongoose.Types.ObjectId(customerId)

        const checkWishlist = await Wishlist.findOne({ customer: mongoose.Types.ObjectId(customerId), productId: mongoose.Types.ObjectId(payload.productId) }).lean(true)
        const checkProduct = await Product.findOne({ _id: mongoose.Types.ObjectId(payload.productId) })
        if (checkProduct) {
            if (checkWishlist) {
                const wishlist = await Wishlist.deleteOne({ _id: checkWishlist._id })
                return res.status(200).send({
                    status: 1,
                    message: 'Product removed from whishlist',
                    data: {
                        "isFavourite": false
                    }
                });
            } else {
                const wishlist = await Wishlist.create(payload)

                return res.status(200).send({
                    status: 1,
                    message: 'Product added to wishlist',
                    data: {
                        "isFavourite": true
                    }
                });
            }
        } else {
            return res.status(200).send({
                status: 1,
                message: 'Product is not valid',
                data: {
                    "isFavourite": false
                }
            });
        }


    } catch (error) {
        return next(error)
    }
}



// API to get wishlist
exports.list = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-identity'];

        // const wishlist = await Wishlist.find({  customer:  mongoose.Types.ObjectId(userAgent)})
        const wishlist = await Wishlist.aggregate([
            {
                $match: { customer: mongoose.Types.ObjectId(userAgent) }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product",
                    // pipeline: [
                    //     {
                    //         $project: {
                    //             title: 1,
                    //             price: 1,
                    //             shortDescription: 1,
                    //             image: 1,
                    //         }
                    //     }
                    // ]
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            // { $unwind: '$product' },
            {
                $match: {
                    "product.status": true
                }
            },
            {
                $project: {
                    _id: 1,
                    productId: 1,
                    customer: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    __v: 1,
                    product: {
                        _id: "$product._id",
                        title: "$product.title",
                        price: "$product.price",
                        shortDescription: "$product.shortDescription",
                        image: "$product.image"
                    }
                }
            }
        ])


        return res.status(200).send({
            status: 1,
            message: 'Wishlist fetched successfully',
            wishlist
        });
    } catch (error) {
        return next(error)
    }
};


// API to delete product from wishlist
exports.delete = async (req, res, next) => {
    try {
        const { wishlistId } = req.body
        if (wishlistId) {
            const wishlist = await Wishlist.deleteOne({ _id: wishlistId })
            if (wishlist && wishlist.deletedCount)
                return res.status(200).send({
                    status: 1,
                    message: 'Wishlist deleted successfully',
                    wishlist
                });
            else return res.status(400).send({ success: false, message: 'Wishlist not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Wishlist Id is required' })
    } catch (error) {
        return next(error)
    }
}
