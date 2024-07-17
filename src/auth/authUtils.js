const JWT = require("jsonwebtoken");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const KeyTokenService = require("../services/keyToken.service");
const asyncHandler = require("../helpers/asyncHandler");
const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  const accessToken = await JWT.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "2 days",
  });

  const refreshToken = await JWT.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "7 days",
  });

  return { accessToken, refreshToken };
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");

  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");

  //handle when accesstoken is expired and use RT to use API
  if (req.headers[HEADER.REFRESHTOKEN]) {
    const refreshToken = req.headers[HEADER.REFRESHTOKEN];
    // using RSA => if refreshToken is fake or not the latest , publickey wont't match
    // so dont need to check keystore.refreshToken and refreshToken
    const decodeUser = JWT.verify(refreshToken, keyStore.publicKey);
    req.keyStore = keyStore;
    req.user = decodeUser;
    req.refreshToken = refreshToken;
    return next();
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
  req.keyStore = keyStore;
  req.user=decodeUser
  return next();
});

const verifyJWT = ({ token, publicKey }) => {
  return JWT.verify(token, publicKey);
};
module.exports = { createTokenPair, authentication, verifyJWT };
