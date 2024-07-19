const { Types } = require("mongoose");
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
    const sortBy = sort == "ctime" ? {_id : -1} : {_id : 1}
    return await productModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(select);
  };

  
  static findProduct = async ({ product_id,unSelect}) => {
    //when using findById dont need to use Types.ObjectId(product_id)
    return await productModel.findById(product_id).select(unSelect).populate('product_attributes')
  };

  static publishProductByShop = async ({ product_shop, product_id }) => {
    const product = await productModel.findOne({
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    });

    if (!product) throw NotFoundError("Not found this product");

    product.isDraft = false;
    product.isPublished = true;
    await product.save();
  };

  static unPublishProductByShop = async ({ product_shop, product_id }) => {
    const product = await productModel.findOne({
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    });

    if (!product) throw NotFoundError("Not found this product");

    product.isDraft = true;
    product.isPublished = false;
    await product.save();
  };
}

module.exports = ProductDBInteractionLayer;
