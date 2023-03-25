"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("source-map-support/register");
const jsonwebtoken_1 = require("jsonwebtoken");
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../../auth/utils");
const logger_1 = require("../../utils/logger");
const logger = (0, logger_1.createLogger)('auth');
// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const handler = async (event) => {
    logger.info('Authorizing a user', event.authorizationToken);
    try {
        const jwtToken = await verifyToken(event.authorizationToken);
        logger.info('User was authorized', jwtToken);
        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        };
    }
    catch (e) {
        logger.error('User not authorized', { error: e.message });
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        };
    }
};
exports.handler = handler;
async function verifyToken(authHeader) {
    const token = getToken(authHeader);
    const jwt = (0, jsonwebtoken_1.decode)(token, { complete: true });
    const signingKey = await getSigningKey(jwt);
    const jwtToken = (0, jsonwebtoken_1.verify)(token, signingKey, {
        algorithms: ['RS256']
    });
    return jwtToken;
    // TODO: Implement token verification
    // You should implement it similarly to how it was implemented for the exercise for the lesson 5
    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
}
function getToken(authHeader) {
    if (!authHeader)
        throw new Error('No authentication header');
    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');
    const split = authHeader.split(' ');
    const token = split[1];
    return token;
}
async function getSigningKeys() {
    const jwksUrl = 'https://dev-uk4yzfdvjxawdhw6.us.auth0.com/.well-known/jwks.json';
    const { data: jwks } = await axios_1.default.get(jwksUrl);
    if (!jwks.keys || !jwks.keys.length) {
        throw new Error('The JWKS endpoint did not contain any keys');
    }
    const signingKeys = jwks.keys
        .filter((key) => key.use === 'sig' && // Determines the JWK is for signature verification
        key.kty === 'RSA' && // We are only supporting RSA (RS256)
        key.kid && // The `kid` must be present
        key.x5c &&
        key.x5c.length /*|| (key.n && key.e)*/ // Has useful public keys
    )
        .map((key) => {
        return { kid: key.kid, publicKey: (0, utils_1.certToPEM)(key.x5c[0]) };
    });
    if (!signingKeys.length) {
        throw new Error('The JWKS endpoint did not contain any signature verification keys');
    }
    return signingKeys;
}
async function getSigningKey(jwt) {
    const signingKeys = await getSigningKeys();
    const signingKey = signingKeys.find((key) => key.kid === jwt.header.kid);
    if (!signingKey) {
        throw new Error(`Signing key with kid: ${jwt.header.kid} was not found`);
    }
    return signingKey.publicKey;
}
//# sourceMappingURL=auth0Authorizer.js.map