"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("source-map-support/register");
const middlewares_1 = require("middy/middlewares");
const todos_1 = require("../../helpers/todos");
const utils_1 = require("../utils");
const middy_1 = __importDefault(require("middy"));
exports.handler = (0, middy_1.default)(async (event) => {
    try {
        const newTodo = JSON.parse(event.body);
        const userId = (0, utils_1.getUserId)(event);
        const newItem = await (0, todos_1.createTodo)(newTodo, userId);
        return {
            statusCode: 201,
            body: JSON.stringify({ newItem })
        };
    }
    catch (e) {
        return e;
    }
});
exports.handler.use((0, middlewares_1.cors)({
    credentials: true
}));
//# sourceMappingURL=createTodo.js.map