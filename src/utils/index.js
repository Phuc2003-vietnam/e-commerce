const _ = require("lodash");
const crypto = require("crypto");
const { Types } = require("mongoose");
//return the object with picked fields
const getPickedData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};
const getUnpickedData = ({ fields = [], object = {} }) => {
  return _.omit(object, fields);
};
const convertToObjectIdMongodb = (id) => new Types.ObjectId(id);
const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      obj[k] = removeUndefinedObject(obj[k]);
    }
    if (obj[k] == null) {
      delete obj[k];
    }
  });
  return obj;
};

const createPublicPrivateKeys = () => {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });
};

module.exports = {
  getPickedData,
  getUnpickedData,
  createPublicPrivateKeys,
  removeUndefinedObject,
  convertToObjectIdMongodb
};
