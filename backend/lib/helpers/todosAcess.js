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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosAccess = void 0;
const AWS = __importStar(require("aws-sdk"));
const AWSXRay = __importStar(require("aws-xray-sdk"));
// import { createLogger } from '../utils/logger'
const XAWS = AWSXRay.captureAWS(AWS);
// const logger = createLogger('TodosAccess')
// TODO: Implement the dataLayer logic
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
});
class TodosAccess {
    constructor(docClient = createDynamoDBClient(), todosTable = process.env.TODOS_TABLE, todosTableIndexName = process.env.TODOS_CREATED_AT_INDEX, attachmentBucket = process.env.ATTACHMENT_S3_BUCKET) {
        this.docClient = docClient;
        this.todosTable = todosTable;
        this.todosTableIndexName = todosTableIndexName;
        this.attachmentBucket = attachmentBucket;
        // this.docClient = docClient
        // this.todosTable = todosTable
        // this.todosTableIndexName = todosTableIndexName
    }
    async getTodos(userId) {
        const result = await this.docClient
            .query({
            TableName: this.todosTable,
            IndexName: this.todosTableIndexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
            .promise();
        const items = result.Items;
        return items;
    }
    async createTodo(todoItem) {
        await this.docClient
            .put({
            TableName: this.todosTable,
            Item: todoItem
        })
            .promise();
        return todoItem;
    }
    async updateTodo(todoId, todoUpdate) {
        const params = {
            TableName: this.todosTable,
            Key: { todoId },
            UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ReturnValues: 'UPDATED_NEW'
        };
        const res = await this.docClient.update(params).promise();
        return res;
    }
    async updateTodoAttachment(todoId, attachmentUrl) {
        const params = {
            TableName: this.todosTable,
            Key: { todoId },
            UpdateExpression: 'set attachmentUrl = :url',
            ExpressionAttributeValues: {
                ':url': attachmentUrl
            },
            ReturnValues: 'UPDATED_NEW'
        };
        const res = await this.docClient.update(params).promise();
        return res;
    }
    async deleteTodo(todoId) {
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId: {
                    S: todoId
                }
            }
        };
        const item = (await this.docClient
            .delete(params)
            .promise());
        const attachmentUrl = item.attachmentUrl;
        if (attachmentUrl) {
            await s3
                .deleteObject({ Bucket: this.attachmentBucket, Key: todoId })
                .promise();
        }
        return item;
    }
}
exports.TodosAccess = TodosAccess;
function createDynamoDBClient() {
    //   if (process.env.IS_OFFLINE) {
    //     console.log('Creating a local DynamoDB instance')
    //     return new XAWS.DynamoDB.DocumentClient({
    //       region: 'localhost',
    //       endpoint: 'http://localhost:8000'
    //     })
    //   }
    return new AWS.DynamoDB.DocumentClient({
        service: new XAWS.DynamoDB()
    });
}
//# sourceMappingURL=todosAcess.js.map