const { CREATED, OK } = require("../core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
  createProduct = async (req, res, next) => {
    new CREATED({
      message: "Create new product success",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   *
   * @desc Get all drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    new OK({
      message: "Get list of drafts success",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
        ...req.body,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new OK({
      message: "Get list of publish success",
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
        ...req.body,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    console.log("sdasdas");
    new OK({
      message: "Publish product success",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new OK({
      message: "Publish product success",
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new OK({
      message: "Get searched product success",
      metadata: await ProductService.searchProducts(req.params),
    }).send(res);
  };

  getAllProducts = async (req, res, next) => {
    new OK({
      message: "Get all products by filter success",
      metadata: await ProductService.findaAllProducts(req.query),
    }).send(res);
  };

  getProduct = async (req, res, next) => {
    new OK({
      message: "Get a product success",
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new OK({
      message: "Update a product success",
      metadata: await ProductService.updateProduct({
        product_id: req.params.product_id,
        payload: req.body
      }),
    }).send(res);
  };

}
module.exports = new ProductController();
