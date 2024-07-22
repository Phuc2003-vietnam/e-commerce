//use factory pattern
const {
  productModel,
  electronicsModel,
  clothingModel,
  furnitureModel,
} = require("../models/product.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const ProductDBInteractionLayer = require("../models/repositories/product.repo");
const InventoryDBInteractionLayer = require("../models/repositories/inventory.repo");

const { removeUndefinedObject } = require("../utils");
//define factory
class Factory {
  static productRegistry = {};

  static registerProduct(type, className) {
    this.productRegistry[type] = className;
  }

  static async createProduct(type, payload) {
    const productClass = this.productRegistry[type];
    console.log(productClass);
    if (!productClass) {
      throw new BadRequestError(`Invalid product type: ${type}`);
    }
    return await new productClass(payload).createProduct();
  }

  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await ProductDBInteractionLayer.findProductsByQuery({
      query,
      limit,
      skip,
    });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await ProductDBInteractionLayer.findProductsByQuery({
      query,
      limit,
      skip,
    });
  }

  static async publishProductByShop({ product_shop, product_id }) {
    return await ProductDBInteractionLayer.publishProductByShop({
      product_shop,
      product_id,
    });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await ProductDBInteractionLayer.unPublishProductByShop({
      product_shop,
      product_id,
    });
  }

  static async searchProducts({ keySearch }) {
    return await ProductDBInteractionLayer.searchProductByNameDescription({
      keySearch,
    });
  }

  static async findaAllProducts({
    limit = 50,
    page = 1,
    sort = "ctime",
    filter = { isPublished: true },
  }) {
    //Thong thuong select là fill cố định chỉ có filter là thay đổi
    return await ProductDBInteractionLayer.findAllProducts({
      page,
      limit,
      sort,
      filter,
      select: { product_name: 1, product_price: 1, product_thumb: 1 },
    });
  }

  static async findProduct({ product_id }) {
    return await ProductDBInteractionLayer.findProduct({
      product_id,
      unSelect: { __v: 0 },
    });
  }

  static async updateProduct({ product_id, payload }) {
    const product = await this.findProduct({ product_id });
    if (product) {
      const productClass = this.productRegistry[product.product_type];
      return await new productClass({}).updateProduct({
        product_id,
        payload: removeUndefinedObject(payload),
        attributes_id: product.product_attributes,
      });
    }
    throw new NotFoundError("The product you want to update is not existed");
  }
}
//define classes
class Product {
  constructor(payload) {
    this.product_name = payload.product_name;
    this.product_thumb = payload.product_thumb;
    this.product_description = payload.product_description;
    this.product_price = payload.product_price;
    this.product_quantity = payload.product_quantity;
    this.product_type = payload.product_type;
    this.product_shop = payload.product_shop;
  }

  async createProductWithSession(session = null) {
    const newProduct = session
      ? (await productModel.create([this], { session }))[0]
      : await productModel.create(this);
    console.log(newProduct);
    await InventoryDBInteractionLayer.insertInventory({
      productId: newProduct._id,
      shopId: newProduct.product_shop,
      stock: newProduct.product_quantity
    });
    return newProduct
    // return await productModel.create(this);
  }

  async updateProductWithSession({ product_id, payload, session }) {
    return session
      ? await productModel.findByIdAndUpdate(product_id, payload, {
          session,
          new: true,
        })
      : await productModel.findByIdAndUpdate(product_id, payload);
  }
}

class Clothing extends Product {
  constructor(payload) {
    super(payload);
    this.product_attributes_for_child_class = payload.product_attributes;
  }
  async createProduct() {
    return await ProductDBInteractionLayer.createProductInTransistion(
      this,
      clothingModel
    );
  }
  async updateProduct({ productId, payload, attributes_id }) {
    return await ProductDBInteractionLayer.updateProductInTransistion({
      instance: this,
      model: clothingModel,
      productId,
      attributes_id,
      payload,
    });
  }
}

class Electronics extends Product {
  constructor(payload) {
    super(payload);
    this.product_attributes_for_child_class = payload.product_attributes;
  }

  async createProduct() {
    return await ProductDBInteractionLayer.createProductInTransistion(
      this,
      electronicsModel
    );
  }

  async updateProduct({ productId, payload, attributes_id }) {
    return await ProductDBInteractionLayer.updateProductInTransistion({
      instance: this,
      model: electronicsModel,
      productId,
      attributes_id,
      payload,
    });
  }
}

class Furniture extends Product {
  constructor(payload) {
    super(payload);
    this.product_attributes_for_child_class = payload.product_attributes;
  }

  async createProduct() {
    return await ProductDBInteractionLayer.createProductInTransistion(
      this,
      furnitureModel
    );
  }

  async updateProduct({ product_id, payload, attributes_id }) {
    return await ProductDBInteractionLayer.updateProductInTransistion({
      instance: this,
      model: furnitureModel,
      product_id,
      attributes_id,
      payload,
    });
  }
}
//register class
Factory.registerProduct("Clothing", Clothing);
Factory.registerProduct("Electronics", Electronics);
Factory.registerProduct("Furniture", Furniture);

module.exports = Factory;
