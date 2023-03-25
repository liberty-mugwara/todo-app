"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = void 0;
const utils_1 = require("../auth/utils");
/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
function getUserId(event) {
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    return (0, utils_1.parseUserId)(jwtToken);
}
exports.getUserId = getUserId;
//# sourceMappingURL=utils.js.map