const SizeGroup = require("../../models/sizeGroups.model");
const Cart = require("../../models/cart.model");
const Promotions = require("../../models/promotions.model");
const {
  validateAndApplyCouponCode,
  removeCouponFromCart,
} = require("../../utils/util");
const mongoose = require("mongoose");

// API to get Cart
exports.list = async (req, res, next) => {
  try {
    const userAgent = req.headers["user-identity"];
    let cart = await Cart.findOne({
      customer: mongoose.Types.ObjectId(userAgent),
      isCheckout: false,
    }).lean(true);
    if (cart) {
      cart = await cartResponse(cart._id);
      return res.status(200).send({
        status: 1,
        message: "Cart fetched",
        cart,
      });
    } else {
      return res
        .status(200)
        .send({ success: 1, message: "Sorry your cart is empty", cart: [] });
    }
  } catch (error) {
    return next(error);
  }
};
const cartInitialState = async (customerId) => {
  let cart = await Cart.create({
    isCheckout: false,
    discountTotal: 0,
    vatPercentage: 0,
    systemProducts: [],
    nonSystemProducts: [],
    price: 0,
    quantity: 0,
    promotionId: null,
    subTotal: 0,
    taxTotal: 0,
    grandTotal: 0,
    customer: customerId,
  });
  return cart;
};
const cartResponse = async (cartId) => {
  const cart = await Cart.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(cartId) } },
    {
      $lookup: {
        from: "products",
        localField: "systemProducts.productId",
        foreignField: "_id",
        as: "systemMatchedProducts",
      },
    },
    {
      $addFields: {
        systemProducts: {
          $map: {
            input: "$systemProducts",
            as: "systemProduct",
            in: {
              $mergeObjects: [
                "$$systemProduct",
                {
                  productName: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$systemMatchedProducts",
                              as: "systemMatchedProduct",
                              cond: {
                                $eq: [
                                  "$$systemMatchedProduct._id",
                                  "$$systemProduct.productId",
                                ],
                              },
                            },
                          },
                          as: "systemMatchedProduct",
                          in: "$$systemMatchedProduct.title",
                        },
                      },
                      0,
                    ],
                  },
                },
                {
                  productImage: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$systemMatchedProducts",
                              as: "systemMatchedProduct",
                              cond: {
                                $eq: [
                                  "$$systemMatchedProduct._id",
                                  "$$systemProduct.productId",
                                ],
                              },
                            },
                          },
                          as: "systemMatchedProduct",
                          in: "$$systemMatchedProduct.image",
                        },
                      },
                      0,
                    ],
                  },
                },
                {
                  productDescription: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$systemMatchedProducts",
                              as: "systemMatchedProduct",
                              cond: {
                                $eq: [
                                  "$$systemMatchedProduct._id",
                                  "$$systemProduct.productId",
                                ],
                              },
                            },
                          },
                          as: "systemMatchedProduct",
                          in: "$$systemMatchedProduct.shortDescription",
                        },
                      },
                      0,
                    ],
                  },
                },
                {
                  productType: 0,
                },
              ],
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "nonSystemProducts.productId",
        foreignField: "_id",
        as: "nonSystemMatchedProducts",
      },
    },
    {
      $lookup: {
        from: "sizegroups",
        localField: "systemProducts.size",
        foreignField: "_id",
        as: "nonSystemMatchedSizeGroups",
      },
    },
    {
      $addFields: {
        nonSystemProducts: {
          $map: {
            input: "$nonSystemProducts",
            as: "nonSystemProduct",
            in: {
              $mergeObjects: [
                "$$nonSystemProduct",
                {
                  productName: {
                    $cond: {
                      if: { $eq: ["$$nonSystemProduct.productId", null] },
                      then: {
                        $arrayElemAt: ["$$nonSystemProduct.designs.prompt", 0],
                      },
                      else: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$nonSystemMatchedProducts",
                                  as: "nonSystemMatchedProduct",
                                  cond: {
                                    $eq: [
                                      "$$nonSystemMatchedProduct._id",
                                      "$$nonSystemProduct.productId",
                                    ],
                                  },
                                },
                              },
                              as: "nonSystemMatchedProduct",
                              in: "$$nonSystemMatchedProduct.title",
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
                {
                  productImage: {
                    $cond: {
                      if: { $eq: ["$$nonSystemProduct.productId", null] },
                      then: {
                        $arrayElemAt: ["$$nonSystemProduct.designs.image", 0],
                      },
                      else: "$$nonSystemProduct.productImage",
                      // else: {
                      //     $arrayElemAt: [
                      //         {
                      //             $map: {
                      //                 input: {
                      //                     $filter: {
                      //                         input: "$nonSystemMatchedProducts",
                      //                         as: "nonSystemMatchedProduct",
                      //                         cond: {
                      //                             $eq: ["$$nonSystemMatchedProduct._id", "$$nonSystemProduct.productId"],
                      //                         },
                      //                     },
                      //                 },
                      //                 as: "nonSystemMatchedProduct",
                      //                 in: "$$nonSystemMatchedProduct.image",
                      //             },
                      //         },
                      //         0,
                      //     ],
                      // },
                    },
                  },
                },
                {
                  productDescription: "",
                },
                {
                  productType: 1,
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        customer: 1,
        vatPercentage: 1,
        isCheckout: 1,
        systemProducts: 1,
        nonSystemProducts: 1,
        promotionId: 1,
        subTotal: 1,
        taxTotal: 1,
        discountTotal: 1, // Amount of discount
        grandTotal: 1,
      },
    },
  ]);
  let size = null;
  cart[0].subTotal = cart[0].subTotal.toFixed(2);
  cart[0].taxTotal = cart[0].taxTotal.toFixed(2);
  cart[0].grandTotal = cart[0].grandTotal.toFixed(2);

  for (let i = 0; i < cart[0].systemProducts.length; i++) {
    cart[0].systemProducts[i].price = cart[0].systemProducts[i].price
      ? cart[0].systemProducts[i].price.toFixed(2)
      : cart[0].systemProducts[i].price;
    cart[0].systemProducts[i].subTotal = cart[0].systemProducts[i].subTotal
      ? cart[0].systemProducts[i].subTotal.toFixed(2)
      : cart[0].systemProducts[i].subTotal;
  }
  for (let i = 0; i < cart[0].nonSystemProducts.length; i++) {
    cart[0].nonSystemProducts[i].price = cart[0].nonSystemProducts[i].price
      ? cart[0].nonSystemProducts[i].price.toFixed(2)
      : cart[0].nonSystemProducts[i].price;
    cart[0].nonSystemProducts[i].subTotal =
      cart[0].nonSystemProducts[i].subTotal.toFixed(2);
    cart[0].nonSystemProducts[i].discountAmount = cart[0].nonSystemProducts[i]
      .discountAmount
      ? cart[0].nonSystemProducts[i].discountAmount.toFixed(2)
      : cart[0].nonSystemProducts[i].discountAmount;

    for (let j = 0; j < cart[0].nonSystemProducts[i].designs.length; j++) {
      size = await SizeGroup.findOne({
        _id: mongoose.Types.ObjectId(
          cart[0].nonSystemProducts[i].designs[j].size
        ),
      });
      cart[0].nonSystemProducts[i].designs[
        j
      ].desireTextSizeDetail = `SW: ${size?.startingWidth} EW: ${size.endingWidth}`;
    }
  }
  return cart;
};
exports.addToCart = async (req, res, next) => {
  try {
    const customerId = req.headers["user-identity"];
    let { type, productData } = req.body;

    if (![0, 1].includes(type)) {
      return res
        .status(400)
        .send({ status: 0, message: "Invalid product type" });
    }
    let cart = await Cart.findOne({
      customer: mongoose.Types.ObjectId(customerId),
      isCheckout: false,
    });
    if (!cart) {
      cart = await cartInitialState(customerId);
    }

    if (type == 0) {
      //  System Product
      if (
        !productData?.productId ||
        !productData?.price ||
        !productData?.subTotal ||
        !productData.variationData
      ) {
        return res
          .status(400)
          .send({ status: 0, message: "Invalid productData" });
      }

      for (variInd = 0; 1 < productData.variationData; variInd++) {
        if (productData.variationData[variInd].variationQuantity > 0) {
          let checkInCart = cart.systemProducts.filter((prod) => {
            return (
              prod.productId.equals(productData.productId) &&
              productData.variationData[variInd].variationId ===
                prod.variationID
            );
          });
          if (checkInCart.length > 0) {
            for (let i = 0; i < cart.systemProducts.length; i++) {
              if (
                cart.systemProducts[i].productId.equals(
                  productData.productId
                ) &&
                productData.variationData[variInd].variationId ===
                  prod.variationID
              ) {
                cart.systemProducts[i].quantity +=
                  productData.variationData[variInd].variationQuantity;
              }
            }
          } else {
            let newProductData = { ...productData };

            newProductData.quantity =
              productData.variationData[variInd].variationQuantity;
            newProductData.variationID =
              productData.variationData[variInd].variationId;
            newProductData.price = productData.variationData[variInd].price;
            newProductData.subTotal =
              Number(productData.variationData[variInd].price) *
              Number(productData.variationData[variInd].variationQuantity);

            cart.systemProducts.push(newProductData);
          }
        }
      }
    } else {
      // Non System Products
      if (!productData?.productId) {
        if (productData?.designs?.length == 0) {
          return res
            .status(400)
            .send({ status: 0, message: "Invalid productData" });
        }
        cart.nonSystemProducts.push(productData);
      } else {
        let checkInCartNonSystem = cart.nonSystemProducts.filter((prod) => {
          return prod.productId && prod.productId.equals(productData.productId);
        });
        if (checkInCartNonSystem.length > 0) {
          for (let i = 0; i < cart.nonSystemProducts.length; i++) {
            if (
              cart.nonSystemProducts[i].productId &&
              cart.nonSystemProducts[i].productId.equals(productData.productId)
            ) {
              cart.nonSystemProducts[i].quantity += productData.quantity;
              cart.nonSystemProducts[i].price = productData.price;
            }
          }
        } else {
          cart.nonSystemProducts.push(productData);
        }
      }
    }
    // Verify the costing of the cart
    let payload = await verifyCartData(cart);
    if (payload.isValid) {
      // update the cart Data
      await Cart.findByIdAndUpdate(
        { _id: cart._id },
        { $set: payload.payload },
        { new: true }
      );
      cart = await cartResponse(cart._id);

      return res.status(200).send({
        status: 1,
        message: "Product added to cart",
        cart,
      });
    }
    return res.status(200).send({
      status: 1,
      message: "Product cannot be added to cart",
      cart: {},
    });
  } catch (error) {
    return next(error);
  }
};
exports.removeFromCart = async (req, res, next) => {
  try {
    const customerId = req.headers["user-identity"];
    let {
      systemProducts,
      nonSystemProductsTattoos,
      nonSystemProductsProducts,
    } = req.body;

    if (
      !systemProducts &&
      !nonSystemProductsTattoos &&
      !nonSystemProductsProducts
    ) {
      return res.status(400).send({ status: 0, message: "Invalid Params" });
    }

    let cart = await Cart.findOne({
      customer: mongoose.Types.ObjectId(customerId),
      isCheckout: false,
    });

    if (!cart) {
      return res.status(200).send({ status: 1, message: "Cart already empty" });
    }

    if (systemProducts && systemProducts.length > 0) {
      cart.systemProducts = cart.systemProducts.filter((item) => {
        return (
          item._id != null && !systemProducts.includes(item._id.toString())
        );
      });
    }

    if (nonSystemProductsProducts && nonSystemProductsProducts.length > 0) {
      cart.nonSystemProducts = cart.nonSystemProducts.filter((item) => {
        return (
          item._id != null &&
          !nonSystemProductsProducts.includes(item._id.toString())
        );
      });
    }
    if (nonSystemProductsTattoos && nonSystemProductsTattoos.length > 0) {
      cart.nonSystemProducts = cart.nonSystemProducts.filter((item) => {
        item.designs = item.designs.filter((d) => {
          return (
            d._id != null &&
            !nonSystemProductsTattoos.includes(d._id.toString())
          );
        });
        return item.designs.length > 0;
      });
    }
    // Verify the costing of the cart
    let payload = await verifyCartData(cart);
    // update the cart Data
    await Cart.findByIdAndUpdate(
      { _id: cart._id },
      { $set: payload.payload },
      { new: true }
    );
    cart = await cartResponse(cart._id);
    return res.status(200).send({
      status: 1,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const customerId = req.headers["user-identity"];
    let { type, id, quantity, designId } = req.body;

    if (![0, 1].includes(type)) {
      return res
        .status(200)
        .send({ status: 0, message: "Invalid product type" });
    }
    let cart = await Cart.findOne({
      customer: mongoose.Types.ObjectId(customerId),
      isCheckout: false,
    });
    if (!cart) {
      return res.status(200).send({ status: 1, message: "Cart already empty" });
    }
    if (type == 0) {
      //  System Product
      for (let i = 0; i < cart.systemProducts.length; i++) {
        if (cart.systemProducts[i]._id.toString() == id) {
          cart.systemProducts[i].quantity = quantity;
        }
      }
    } else {
      // Non System Products
      for (let i = 0; i < cart.nonSystemProducts.length; i++) {
        if (cart.nonSystemProducts[i]._id.equals(id)) {
          if (!cart.nonSystemProducts[i].productId) {
            for (
              let di = 0;
              di < cart.nonSystemProducts[i].designs.length;
              di++
            ) {
              if (
                cart.nonSystemProducts[i].designs[di]._id.toString() == designId
              ) {
                cart.nonSystemProducts[i].designs[di].quantity = quantity;
              }
            }
          } else {
            cart.nonSystemProducts[i].quantity = quantity;
          }
        }
      }
    }

    // Verify the costing of the cart
    let payload = await verifyCartData(cart);

    // update the cart Data
    await Cart.findByIdAndUpdate(
      { _id: cart._id },
      { $set: payload.payload },
      { new: true }
    );
    cart = await cartResponse(cart._id);

    return res.status(200).send({
      status: 1,
      message: "Cart product updated",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};
// API for Validate Coupon and apply discount
exports.validateCoupon = async (req, res, next) => {
  try {
    // Get customer ID from request headers
    const customerId = req.headers["user-identity"];
    let { couponCode } = req.body;
    let customer = mongoose.Types.ObjectId(customerId);
    let customerCart = await Cart.findOne({
      customer: customer,
      isCheckout: false,
    });
    if (couponCode == "") {
      customerCart = await removeCouponFromCart(customerCart);
      await Cart.findByIdAndUpdate(customerCart._id, customerCart);
      return res.status(200).send({
        success: 0,
        message: "Invalid promo code",
        cart: customerCart,
      });
    }
    const coupon = await Promotions.findOne({
      promotionCode: couponCode,
      isActive: true,
      isDeleted: { $ne: true },
    });
    if (coupon) {
      // Check if the coupon is valid for the customer
      if (customerCart != null) {
        let updatedCartObject = await validateAndApplyCouponCode(
          customerCart,
          coupon
        );
        if (updatedCartObject.isValid) {
          let updatedCart = await Cart.findByIdAndUpdate(
            customerCart._id,
            updatedCartObject.cart
          );
          let cart = await Cart.findOne(customerCart._id);
          return res.status(200).send({
            status: 1,
            message: "Coupon applied successfully",
            cart: cart,
          });
        } else {
          customerCart = await removeCouponFromCart(customerCart);
          await Cart.findByIdAndUpdate(customerCart._id, customerCart);
          return res.status(200).send({
            success: 0,
            message: "Invalid promo code",
            cart: customerCart,
          });
        }
      } else {
        return res
          .status(200)
          .send({ success: 1, message: "Sorry, your cart is empty" });
      }
    } else {
      customerCart = await removeCouponFromCart(customerCart);
      return res.status(200).send({
        success: 0,
        message: "Invalid promo code",
        cart: customerCart,
      });
    }
  } catch (error) {
    return next(error);
  }
};
// Function to create variations
const verifyCartData = async (payload) => {
  let total = {
    subTotal: 0,
    taxTotal: 0,
    grandTotal: 0,
  };
  let isValid = true;

  payload.systemProducts.map((product) => {
    product.subTotal = product.price * product.quantity;
    product.subTotal = product.subTotal.toFixed(2);

    let t = product.price * product.quantity;
    total.subTotal += t;
    total.taxTotal += (t * payload.vatPercentage) / 100;
    total.grandTotal += t + (t * payload.vatPercentage) / 100;
  });

  let sizeGroup = null;
  let product = null;

  for (let i = 0; i < payload.nonSystemProducts.length; i++) {
    product = payload.nonSystemProducts[i];

    // Verifying the size groups added in the order
    for (let j = 0; j < product.designs.length; j++) {
      sizeGroup = await SizeGroup.findOne({
        _id: mongoose.Types.ObjectId(product.designs[j].size),
      });
      if (!sizeGroup) {
        isValid = false;
      }
      if (product.desireTextSizeGroup) {
        sizeGroup = await SizeGroup.findOne({
          _id: mongoose.Types.ObjectId(product.designs[j].desireTextSizeGroup),
        });
        if (!sizeGroup) {
          isValid = false;
        }
      }
    }
    product.subTotal = 0;
    let subTotal = 0;
    if (!product.productId) {
      if (product.designs.length > 0) {
        for (const design of product.designs) {
          subTotal += design.quantity * design.price;
        }
      }
    } else {
      let dp = 0;
      if (product.designs.length > 0) {
        for (const design of product.designs) {
          dp += design.price;
        }
      }
      subTotal +=
        product.quantity * (dp + product.price + product.designImprintPrice);
    }

    product.subTotal += subTotal;

    let t = product.subTotal;
    total.subTotal += t;
    total.taxTotal += (t * payload.vatPercentage) / 100;
    total.grandTotal += t + (t * payload.vatPercentage) / 100;
  }

  payload.subTotal = total.subTotal.toFixed(2);
  payload.taxTotal = total.taxTotal.toFixed(2);

  if (payload.discountTotal > 0) {
    payload.grandTotal = total.grandTotal - payload.discountTotal;
    payload.grandTotal = payload.grandTotal.toFixed(2);
  } else {
    payload.grandTotal = total.grandTotal.toFixed(2);
  }

  if (
    payload.nonSystemProducts.length == 0 &&
    payload.systemProducts.length == 0
  ) {
    payload.subTotal = 0;
    payload.taxTotal = 0;
    payload.discountTotal = 0;
    payload.grandTotal = 0;
  }

  return { payload: payload, isValid: isValid };
};
