const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m';

/**
 * Generate a JWT token for a user
 * @param {Object} payload - Data to encode (userId, role)
 * @param {String} expiresIn - Override default expiry
 * @returns {String} Signed JWT token
 */
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify and decode a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
