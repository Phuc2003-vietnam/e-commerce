const mongoose = require("mongoose");
const { getPickedData, getUnpickedData } = require("./index");

const createProductInTransistion = async (instance, model) => {
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

const updateProductInTransistion = async ({
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

module.exports = { createProductInTransistion, updateProductInTransistion };
