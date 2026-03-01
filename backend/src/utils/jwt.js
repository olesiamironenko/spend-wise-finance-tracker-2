const jwt = require('jsonwebtoken');

const createToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d'; 
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  createToken,
  verifyToken
};