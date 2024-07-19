//use factory pattern
const {
  productModel,
  electronicsModel,
  clothingModel,
  furnitureModel,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const { createProductInTransistion } = require("../utils/database");
const ProductDBInteractionLayer = require("../models/repositories/product.repo");
//define factory
class Factory {
  static productRegistry = {};

  static registerProduct(type, className) {
    this.productRegistry[type] = className;
  }

  static async createProduct(type, payload) {
    const productClass = this.productRegistry[type];
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
  async createProduct() {
    return await productModel.create(this);
  }

  async createProductWithSession(session) {
    // console.log("in parents: ",this);
    return await productModel.create([this], { session });
  }
}

class Clothing extends Product {
  constructor(payload) {
    super(payload);
    this.product_attributes = payload.product_attributes;
  }
  async createProduct() {
    return await createProductInTransistion(this, clothingModel);
  }
}

class Electronics extends Product {
  constructor(payload) {
    super(payload);
    this.product_attributes = payload.product_attributes;
  }
  async createProduct() {
    return await createProductInTransistion(this, electronicsModel);
  }
}

class Furniture extends Product {
  constructor(payload) {
    super(payload);
    this.product_attributes = payload.product_attributes;
  }
  async createProduct() {
    return await createProductInTransistion(this, furnitureModel);
  }
}

//register class
Factory.registerProduct("Clothing", Clothing);
Factory.registerProduct("Electronics", Electronics);
Factory.registerProduct("Furniture", Furniture);

module.exports = Factory;
