"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// import { createLogger } from '../../utils/logger'
const attachmentUtils_1 = require("../../helpers/attachmentUtils");
// const logger = createLogger('todo-attachments')
const region = process.env.TODOS_ATTACHMENT_S3_BUCKET_REGION;
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const handler = async (event) => {
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const objectUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    await (0, attachmentUtils_1.updateAttachmentUrl)(key, objectUrl);
};
exports.handler = handler;
//# sourceMappingURL=todos.js.map