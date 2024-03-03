const fs = require("fs");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const ProductVariation = require("../../models/productVariation.model");
const mongoose = require("mongoose");

const { checkDuplicate } = require("../../../config/errors");

// API to create Product
exports.create = async (req, res, next) => {
  try {
    let payload = req.body;

    let title = payload.title;
    let category = payload.category;
    let type = payload.type;

    let products = await Product.findOne({
      title: new RegExp(`^${title}$`, "i"),
      category: category,
      type: type,
    });
    if (products) {
      return res.status(200).send({
        success: false,
        message: "Product name already exist",
        data: payload,
      });
    }

    const product = await Product.create(payload);
    if (payload.type == 3) {
      let variations = await createVariationsFromAttributes(product);
    }
    return res.send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Product");
    else return next(error);
  }
};
// API to edit Product
exports.edit = async (req, res, next) => {
  try {
    let payload = req.body;

    let title = payload.title;
    let category = payload.category;
    let type = payload.type;

    let products = await Product.findOne({
      title: new RegExp(`^${title}$`, "i"),
      category: category,
      type: type,
    });

    if (products && products._id != payload._id) {
      return res.status(200).send({
        success: false,
        message: "Product name already exist",
        data: payload,
      });
    }

    const product = await Product.findByIdAndUpdate(
      {
        _id: payload._id,
      },
      {
        $set: payload,
      },
      {
        new: true,
      }
    );
    return res.send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Product");
    else return next(error);
  }
};
// API to delete Product
exports.delete = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (productId) {
      // const product = await Product.deleteOne({
      //     _id: productId
      // })
      let product = await Product.findOne({ _id: productId });
      product.isDeleted = true;
      product.title = product.title + " " + new Date();
      product.save();
      if (product)
        return res.send({
          success: true,
          message: "Product deleted successfully",
          productId,
        });
      else
        return res.status(400).send({
          success: false,
          message: "Product not found for given Id",
        });
    } else
      return res.status(400).send({
        success: false,
        message: "Product Id is required",
      });
  } catch (error) {
    return next(error);
  }
};
// API to get a Product
exports.get = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (productId) {
      const product = await Product.findOne({
        _id: productId,
      }).lean(true);
      if (product) {
        return res.json({
          success: true,
          product,
        });
      } else
        return res.status(400).send({
          success: false,
          message: "Product not found for given Id",
        });
    } else
      return res.status(400).send({
        success: false,
        message: "Product Id is required",
      });
  } catch (error) {
    return next(error);
  }
};
// API to get Product list
exports.list = async (req, res, next) => {
  try {
    let { all, page, limit, order, withInactive } = req.query;

    let { title, category, type, status } = req.body;

    let filter = { isDeleted: { $ne: true } };

    page = page !== undefined && page !== "" ? parseInt(page) : 1;
    if (!all)
      limit = limit !== undefined && limit !== "" ? parseInt(limit) : 10;

    if (title) {
      title = title.trim();
      filter.title = {
        $regex: title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
        $options: "i",
      };
    }

    if (category) {
      filter.category = mongoose.Types.ObjectId(category);
    }

    if (status === "true") {
      filter.status = true;
    }
    if (status === "false") {
      filter.status = false;
    }
    if (withInactive == true || withInactive == "true") {
      delete filter.status;
      delete filter.isDeleted;
    }

    if (type) {
      filter.type = parseInt(type);
    }
    const total = await Product.countDocuments(filter);

    if (page > Math.ceil(total / limit) && total > 0)
      page = Math.ceil(total / limit);

    // Filter for Create Sale
    let pipeline = [{ $match: filter }, { $sort: { createdAt: -1 } }];
    // End Filter

    if (!all) {
      pipeline.push({ $skip: limit * (page - 1) });
      pipeline.push({ $limit: limit });
    }

    if (order) {
      pipeline.push({
        $lookup: {
          from: "productvariations",
          localField: "_id",
          foreignField: "productId",
          as: "variations",
        },
      });

      pipeline.push({
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          image: 1,
          variations: 1,
          price: 1,
          type: 1,
        },
      });
    } else {
      pipeline.push({
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      });

      pipeline.push({
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          image: 1,
          price: 1,
          type: 1,
          category: { $arrayElemAt: ["$category.name", 0] },
        },
      });
    }

    const products = await Product.aggregate(pipeline);

    return res.send({
      success: true,
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
// Function to create variations
const createVariationsFromAttributes = async (product) => {
  let attributeArray = product.attributes;
  let attributes = [];
  let variations = [];

  attributeArray.map(async (attribute, index) => {
    let attr = [];
    attribute.values.map(async (value, vIndex) => {
      let temp = [];
      temp["titleDetails"] = {
        title: attribute.title,
        isColor: attribute.isColor,
        isMeasurement: attribute.isMeasurement,
        isImage: attribute.isImage,
      };
      temp["valueDetails"] = {
        title: value.title,
        image: value.image,
        colorCode: value.colorCode,
        measurementScale: value.measurementScale,
      };
      attr.push(temp);
    });
    attributes.push(attr);
  });

  let cartesian = cartesianProduct(attributes);
  let variationRecord = [];
  for (let i = 0; i < cartesian.length; i++) {
    variationRecord = [];
    cartesian[i].map((varia, index) => {
      variationRecord.push({
        title: varia["titleDetails"].title,
        isColor: varia["titleDetails"].isColor,
        isMeasurement: varia["titleDetails"].isMeasurement,
        isImage: varia["titleDetails"].isImage,

        value: varia["valueDetails"].title,
        image: varia["valueDetails"].image,
        colorCode: varia["valueDetails"].colorCode,
        measurementScale: varia["valueDetails"].measurementScale,
      });
    });
    let productVariation = await ProductVariation.create({
      productId: product._id,
      details: variationRecord,
      price: product.price,
    });
    variations.push(productVariation);
  }
  return variations;
};
const cartesianProduct = (elements) => {
  if (!Array.isArray(elements)) {
    throw new TypeError();
  }

  var end = elements.length - 1,
    result = [];

  function addTo(curr, start) {
    var first = elements[start],
      last = start === end;

    for (var i = 0; i < first.length; ++i) {
      var copy = curr.slice();
      copy.push(first[i]);

      if (last) {
        result.push(copy);
      } else {
        addTo(copy, start + 1);
      }
    }
  }

  if (elements.length) {
    addTo([], 0);
  } else {
    result.push([]);
  }
  return result;
};
// API to get the Product Variations of specific product
exports.listVariations = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (productId) {
      let productVariations = await ProductVariation.find({
        productId: productId,
      }).lean(true);
      if (productVariations) {
        const product = await Product.findOne({
          _id: productId,
        }).lean(true);
        return res.json({
          success: true,
          productVariations,
          product,
        });
      } else
        return res.status(400).send({
          success: false,
          message: "Product Variation not found for given Id",
        });
    } else {
      let productVariations = await ProductVariation.find().lean(true);
      return res.json({
        success: true,
        productVariations,
        product: null,
      });
    }
  } catch (error) {
    return next(error);
  }
};
exports.updateVariation = async (req, res, next) => {
  try {
    let payload = req.body;
    const productVariation = await ProductVariation.findByIdAndUpdate(
      {
        _id: payload._id,
      },
      {
        $set: {
          price: payload.price,
          "details.0.image": payload.image,
          status: payload.status,
        },
      },
      {
        new: true,
      }
    );
    return res.send({
      success: true,
      message: "Product Variation updated successfully",
      productVariation,
    });
  } catch (error) {
    return next(error);
  }
};
exports.addVariation = async (req, res, next) => {
  try {
    const params = req.body;

    let colorIndex2 = params.details.findIndex((object) => {
      return object.title === "Color";
    });
    let sizeIndex2 = params.details.findIndex((object) => {
      return object.title === "Size";
    });

    const product = await Product.findOne({
      _id: params.productId,
    }).lean(true);

    let productAttributes = product.attributes;

    let colorAttributeIndex = productAttributes.findIndex((object) => {
      return object.title === "Color";
    });
    let sizeAttributeIndex = productAttributes.findIndex((object) => {
      return object.title === "Size";
    });

    // check if the attribute is present in the product or not
    let colorAttributeValues = productAttributes[colorAttributeIndex].values;
    let sizeAttributeValues = productAttributes[sizeAttributeIndex].values;

    let c = colorAttributeValues.findIndex((object) => {
      return object.value === params.details[colorIndex2].title;
    });
    let s = sizeAttributeValues.findIndex((object) => {
      return object.value === params.details[sizeIndex2].title;
    });

    let productVariations = await ProductVariation.find({
      productId: params.productId,
    });
    let isPresent = false;

    for (let i = 0; i < productVariations.length; i++) {
      let colorIndex = productVariations[i].details.findIndex((object) => {
        return object.title === "Color";
      });
      let sizeIndex = productVariations[i].details.findIndex((object) => {
        return object.title === "Size";
      });

      if (
        productVariations[i].details[colorIndex].value ==
          params.details[colorIndex2].value &&
        productVariations[i].details[sizeIndex].value ==
          params.details[sizeIndex2].value
      ) {
        isPresent = true;
      }
    }
    if (isPresent) {
      return res.send({
        success: true,
        message: "Product variation already exists",
      });
    } else {
      await ProductVariation.create(params);
    }
    return res.send({
      success: true,
      message: "Product variation created successfully",
    });
  } catch (error) {
    return next(error);
  }
};
exports.deleteVariation = async (req, res, next) => {
  try {
    const { variationId } = req.params;
    if (variationId) {
      const variation = await ProductVariation.deleteOne({
        _id: variationId,
      });
      if (variation && variation.deletedCount)
        return res.send({
          success: true,
          message: "Product variation deleted successfully",
          variationId,
        });
      else
        return res.status(400).send({
          success: false,
          message: "Product variation not found for given Id",
        });
    } else
      return res.status(400).send({
        success: false,
        message: "Product Variation Id is required",
      });
  } catch (error) {
    return next(error);
  }
};
