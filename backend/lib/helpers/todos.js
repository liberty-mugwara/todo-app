"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttachmentPresignedUrl = exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodos = void 0;
const uuid = __importStar(require("uuid"));
const todosAcess_1 = require("./todosAcess");
const http_errors_1 = __importDefault(require("http-errors"));
// import { createLogger } from '../utils/logger'
const attachmentUtils_1 = require("./attachmentUtils");
// import { parseUserId } from '../auth/utils'
// TODO: Implement businessLogic
const todosAccess = new todosAcess_1.TodosAccess();
async function getTodos(userId) {
    return todosAccess.getTodos(userId);
}
exports.getTodos = getTodos;
async function createTodo(createTodoRequest, userId) {
    try {
        const itemId = uuid.v4();
        return todosAccess.createTodo({
            todoId: itemId,
            userId,
            name: createTodoRequest.name,
            dueDate: createTodoRequest.dueDate,
            createdAt: new Date().toISOString(),
            done: false
        });
    }
    catch (e) {
        throw (0, http_errors_1.default)(500);
    }
}
exports.createTodo = createTodo;
async function updateTodo(todoId, updateTodoRequest) {
    try {
        return todosAccess.updateTodo(todoId, updateTodoRequest);
    }
    catch (e) {
        throw (0, http_errors_1.default)(500);
    }
}
exports.updateTodo = updateTodo;
async function deleteTodo(todoId) {
    try {
        return todosAccess.deleteTodo(todoId);
    }
    catch (e) {
        throw (0, http_errors_1.default)(500);
    }
}
exports.deleteTodo = deleteTodo;
async function createAttachmentPresignedUrl(todoId) {
    return (0, attachmentUtils_1.getUploadUrl)(todoId);
}
exports.createAttachmentPresignedUrl = createAttachmentPresignedUrl;
//# sourceMappingURL=todos.js.map