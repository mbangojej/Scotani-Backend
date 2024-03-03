const Product = require("../../models/product.model");
const ProductVariation = require("../../models/productVariation.model");
const Category = require("../../models/category.model");
const Cart = require("../../models/cart.model");
const WishList = require("../../models/wishList.model");
const mongoose = require("mongoose");
const { uploadedImgPath } = require("../../../config/vars");

exports.listCategories = async (req, res, next) => {
  try {
    const customerId = req.headers["user-identity"];
    let { type } = req.body;

    const productFilter = {
      status: true,
      isDeleted: { $ne: true },
      type: type,
    };

    const categoryFilter = {
      status: true,
    };
    let categoryPipeline = [];
    if (type == 3) {
      categoryPipeline = [
        {
          $match: categoryFilter,
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "category",
            pipeline: [
              {
                $match: categoryFilter,
              },
              {
                $lookup: {
                  from: "products",
                  localField: "_id",
                  foreignField: "category",
                  pipeline: [
                    {
                      $match: productFilter,
                    },
                  ],
                  as: "product",
                },
              },
              {
                $unwind: {
                  path: "$product",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $group: {
                  _id: "$_id",
                  name: { $first: "$name" },
                  image: { $first: "$image" },
                  subCategories: { $first: "$subCategories" },
                },
              },
              {
                $project: {
                  name: 1,
                  image: { $concat: [uploadedImgPath, "$image"] },
                },
              },
            ],
            as: "subCategories",
          },
        },
        {
          $unwind: {
            path: "$subCategories",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            image: { $first: "$image" },
            subCategories: { $push: "$subCategories" },
          },
        },
        {
          $project: {
            name: 1,
            image: { $concat: [uploadedImgPath, "$image"] },
            subCategories: 1,
          },
        },
      ];
    } else {
      categoryPipeline = [
        {
          $match: categoryFilter,
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            pipeline: [
              {
                $match: productFilter,
              },
            ],
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "category",
            pipeline: [
              {
                $match: categoryFilter,
              },
            ],
            as: "subCategories",
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            image: { $first: "$image" },
            subCategories: { $first: "$subCategories" },
          },
        },
        {
          $project: {
            name: 1,
            image: { $concat: [uploadedImgPath, "$image"] },
            subCategories: 1,
          },
        },
      ];
    }

    let categories = await Category.aggregate(categoryPipeline);
    let t = [];
    let s = [];
    for (let i = 0; i < categories.length; i++) {
      if (t.includes(categories[i].name)) {
        delete categories[i];
      } else {
        t.push(categories[i].name);
      }
      s = [];
    }
    return res.status(200).send({
      status: 1,
      message: "Products fetched",
      data: {
        categories,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const customerId = req.headers["user-identity"];

    let { title, categoryId, type, page, limit } = req.body;

    if (!page) page = req.params.page;
    //update 01-11-2023
    // add is Deleted filter not show deleted products
    let productFilter = {
      status: true,
      isDeleted: { $ne: true },
      category: mongoose.Types.ObjectId(categoryId),
    };
    if (type) {
      productFilter.type = type;
    }
    // if (title) {
    //     title = title.trim()
    //     productFilter.title = {
    //         $regex: title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
    //         $options: 'i'
    //     };
    // }
    // Update: 02-10-2023
    // Functionality: change ragular expression to avoid substring search.

    if (title) {
      title = title.trim();
      const regex = new RegExp(`(?:^|\\s)${title}(?:$|\\s)`, "i");
      productFilter.title = { $regex: regex };
    }
    page = page !== undefined && page !== "" ? parseInt(page) : 1;
    limit = limit !== undefined && limit !== "" ? parseInt(limit) : 10;
    let productPipeline = [{ $match: productFilter }];
    if (!title) {
      productPipeline.push({ $skip: limit * (page - 1) }, { $limit: limit });
    }
    productPipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "productId",
          pipeline: [
            {
              $match: {
                customer: mongoose.Types.ObjectId(customerId),
              },
            },
          ],
          as: "wishlist",
        },
      },
      {
        $project: {
          title: 1,
          image: 1,
          shortDescription: 1,
          price: 1,
          wishlist: 1,
          attributes: 1,
        },
      }
    );

    let products = await Product.aggregate(productPipeline);
    const total = await Product.countDocuments(productFilter);
    let customerCart = await Cart.findOne({
      customer: mongoose.Types.ObjectId(customerId),
    });

    for (let i = 0; i < products.length; i++) {
      products[i].isFeatured = false;
      if (products[i].wishlist.length > 0) {
        products[i].isFeatured = true;
      }
      products[i].isProductIntoCart = false;
      if (customerCart) {
        let checkInCart = customerCart?.systemProducts.filter((p) => {
          return p.productId.equals(products[i]._id);
        });
        products[i].isProductIntoCart = checkInCart.length > 0;
      }

      const attributes = products[i].attributes;

      products[i].price = parseFloat(products[i].price.toFixed(2));
      delete products[i].wishlist;
      delete products[i].attributes;

      /** Append Product Attributes only in case of type 3 **/
      if (attributes.length > 0) {
        let colors = [];
        let sizes = [];

        attributes.forEach((attribute) => {
          if (attribute.isColor == true) {
            attribute.values.forEach((product) => {
              const colorInfo = {
                _id: product._id,
                value: product.colorCode,
                image: product.image,
              };
              colors.push(colorInfo);
            });
          }
          if (attribute.isColor == false) {
            attribute.values.forEach((product) => {
              const sizeInfo = {
                _id: product._id,
                value: product.title,
              };
              sizes.push(sizeInfo);
            });
          }
        });

        if (colors.length > 0) {
          products[i].attributes = products[i].attributes || [];
          products[i].attributes.push({ color: colors });
        }
        if (sizes.length > 0) {
          products[i].attributes = products[i].attributes || [];
          products[i].attributes.push({ size: sizes });
        }
      }
    }

    return res.status(200).send({
      status: 1,
      message: "Products fetched",
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/* API to get product Price by variant
@Param 
ProductId
size 
color 
note: size and color are for variant
*/

exports.getVariationPrice = async (req, res, next) => {
  try {
    let { productId, size, color } = req.body;
    if (productId && size && color) {
      let variations = await ProductVariation.findOne({
        productId: mongoose.Types.ObjectId(productId),
        "details.colorCode": color,
        "details.value": size,
      });
      if (variations) {
        return res.status(200).send({
          status: 1,
          message: "variant Price fetch successfully",
          data: {
            variationId: variations._id,
            price: parseFloat(variations.price.toFixed(2)),
          },
        });
      } else
        return res.status(200).send({
          success: false,
          message: "Product Variation not found for given Id",
        });
    } else
      return res.status(200).send({
        success: false,
        message: `productId: ${productId} color: ${productId} size: ${productId} Product Id, size and color is required`,
      });
  } catch (error) {
    return next(error);
  }
};

/* API to get Product Detail
@Param : ProductId
*/

exports.productDetail = async (req, res, next) => {
  try {
    const customerId = req.headers["user-identity"];
    let { productId } = req.body;

    if (productId) {
      let data = await Product.findOne(
        {
          _id: mongoose.Types.ObjectId(productId),
        },
        {
          _id: 0,
          productID: "$_id",
          productName: "$title",
          productDescription: "$shortDescription",
          productPrice: "$price",
          productImage: "$image",
          attributes: "$attributes",
        }
      ).lean(true);

      let customerCart = await Cart.findOne({
        customer: mongoose.Types.ObjectId(customerId),
      });
      data.isProductIntoCart = false;
      if (customerCart) {
        let checkInCart = customerCart?.systemProducts.filter((p) => {
          return p.productId.equals(data.productID);
        });
        data.isProductIntoCart = checkInCart.length > 0;
      }

      let wishList = await WishList.find({
        customer: mongoose.Types.ObjectId(customerId),
        productId: { $ne: null },
      });

      data.isFeatured = false;
      if (wishList.length > 0) {
        let checkInWishList = wishList.filter((w) => {
          return w.productId.equals(data.productID);
        });
        data.isFeatured = checkInWishList.length > 0;
      }
      if (data) {
        data.productPrice = data.productPrice.toFixed(2);
        return res.status(200).send({
          status: 1,
          message: "product detail fetch successfully",
          data,
        });
      } else
        return res
          .status(200)
          .send({ success: false, message: "Product  not found for given Id" });
    } else
      return res
        .status(200)
        .send({ success: false, message: "Product Id is required" });
  } catch (error) {
    return next(error);
  }
};

/* API to get Product Detail
@Param : ProductId
size
*/

exports.getColors = async (req, res, next) => {
  try {
    let { productId, size } = req.body;
    if (productId && size) {
      let productVariations = await ProductVariation.find(
        {
          productId: mongoose.Types.ObjectId(productId),
          "details.value": size,
          status: { $ne: false },
        },
        { details: 1 }
      ).lean(true);

      let colors = [];

      for (let i = 0; i < productVariations.length; i++) {
        if (
          productVariations[i].details[0].colorCode &&
          productVariations[i].details[0].image
        ) {
          colors.push({
            color: productVariations[i].details[0].colorCode,
            image: productVariations[i].details[0].image,
          });
        }
      }

      if (colors) {
        return res.status(200).send({
          status: 1,
          message: "colors fetch successfully",
          data: colors,
        });
      } else
        return res
          .status(200)
          .send({ success: false, message: "Colors not found for given Id" });
    } else
      return res.status(200).send({
        success: false,
        message: `productId: ${productId} size: ${size} Product Id and size is required`,
      });
  } catch (error) {
    return next(error);
  }
};
