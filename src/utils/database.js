const mongoose = require("mongoose");

const createProductInTransistion = async (
  instance,
  model
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Use the instance to call the method and pass the session
    const product = await instance.createProductWithSession(session);
    const attrs = await model.create(
      [
        {
          ...instance.product_attributes,
          productId: product[0]._id,
        },
      ],
      { session }
    );
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
