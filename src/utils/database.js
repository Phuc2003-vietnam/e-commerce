const mongoose = require("mongoose");

const createProductInTransistion = async (
  instance,
  model
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Use the instance to call the method and pass the session
    const attrs = await model.create(
      [
          instance.product_attributes_for_child_class,
      ],
      { session }
    );
    instance.product_attributes=attrs[0]._id
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

module.exports = { createProductInTransistion };
