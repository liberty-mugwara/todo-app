"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("source-map-support/register");
const middlewares_1 = require("middy/middlewares");
const todos_1 = require("../../helpers/todos");
const middy_1 = __importDefault(require("middy"));
// import { getUserId } from '../utils'
exports.handler = (0, middy_1.default)(async (event) => {
    const todoId = event.pathParameters.todoId;
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const uploadUrl = await (0, todos_1.createAttachmentPresignedUrl)(todoId);
    return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl })
    };
});
exports.handler.use((0, middlewares_1.httpErrorHandler)()).use((0, middlewares_1.cors)({
    credentials: true
}));
//# sourceMappingURL=generateUploadUrl.js.map