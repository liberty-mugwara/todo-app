"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.certToPEM = exports.parseUserId = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
function parseUserId(jwtToken) {
    const decodedJwt = (0, jsonwebtoken_1.decode)(jwtToken);
    return decodedJwt.sub;
}
exports.parseUserId = parseUserId;
function certToPEM(cert) {
    const formattedCert = cert.match(/.{1,64}/g).join('\n');
    return `-----BEGIN CERTIFICATE-----\n${formattedCert}\n-----END CERTIFICATE-----\n`;
}
exports.certToPEM = certToPEM;
//# sourceMappingURL=utils.js.map