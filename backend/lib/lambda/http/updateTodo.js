"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("source-map-support/register");
const middlewares_1 = require("middy/middlewares");
const middy_1 = __importDefault(require("middy"));
// import { getUserId } from '../utils'
const todos_1 = require("../../helpers/todos");
exports.handler = (0, middy_1.default)(async (event) => {
    const todoId = event.pathParameters.todoId;
    const updatedTodo = JSON.parse(event.body);
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const item = await (0, todos_1.updateTodo)(todoId, updatedTodo);
    return {
        statusCode: 200,
        body: JSON.stringify({ item })
    };
});
exports.handler.use((0, middlewares_1.httpErrorHandler)()).use((0, middlewares_1.cors)({
    credentials: true
}));
//# sourceMappingURL=updateTodo.js.map