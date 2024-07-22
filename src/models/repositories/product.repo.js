const mongoose = require("mongoose");

const { productModel } = require("../product.model");
const { NotFoundError } = require("../../core/error.response");

class ProductDBInteractionLayer {
  static searchProductByNameDescription = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);
    const result = await productModel
      .find(
        { isPublished: true, $text: { $search: regexSearch } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .lean();
    return result;
  };

  static findProductsByQuery = async ({ query, limit, skip }) => {
    const products = await productModel
      .find(query)
      .populate("product_shop", "name email -_id")
      .skip(skip)
      .limit(limit)
      .lean();

    return products;
  };

  static findAllProducts = async ({ page, limit, sort, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort == "ctime" ? { _id: -1 } : { _id: 1 };
    return await productModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(select);
  };

  static findProduct = async ({ product_id, unSelect }) => {
    //when using findById dont need to use Types.ObjectId(product_id)
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return null;
    }
    return await productModel
      .findById(product_id)
      .select(unSelect)
      .populate("product_attributes");
  };

  static publishProductByShop = async ({ product_shop, product_id }) => {
    const product = await productModel.findOne({
      product_shop: new mongoose.Types.ObjectId(product_shop),
      _id: new mongoose.Types.ObjectId(product_id),
    });

    if (!product) throw NotFoundError("Not found this product");

    product.isDraft = false;
    product.isPublished = true;
    await product.save();
  };

  static unPublishProductByShop = async ({ product_shop, product_id }) => {
    const product = await productModel.findOne({
      product_shop: new mongoose.Types.ObjectId(product_shop),
      _id: new mongoose.Types.ObjectId(product_id),
    });

    if (!product) throw NotFoundError("Not found this product");

    product.isDraft = true;
    product.isPublished = false;
    await product.save();
  };

  static createProductInTransistion = async (instance, model) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Use the instance to call the method and pass the session
      const attrs = (
        await model.create([instance.product_attributes_for_child_class], {
          session,
        })
      )[0];
      instance.product_attributes = attrs._id;
      const product = await instance.createProductWithSession(session);
      await session.commitTransaction();
      session.endSession();
      return {
        product,
        attrs,
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  };

  static updateProductInTransistion = async ({
    instance,
    model,
    product_id,
    payload,
    attributes_id,
  }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const attrs = await model.findOneAndUpdate(
        { _id: attributes_id },
        payload.product_attributes,
        {
          session,
          new: true,
        }
      );
      const product = await instance.updateProductWithSession({
        product_id,
        payload: getUnpickedData({
          object: payload,
          fields: ["product_attributes"],
        }),
        session,
      });
      await session.commitTransaction();
      session.endSession();
      return {
        product,
        attrs,
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  };
}

module.exports = ProductDBInteractionLayer;
