'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.handler = void 0
require('source-map-support/register')
const middlewares_1 = require('middy/middlewares')
const todos_1 = require('../../helpers/todos')
const utils_1 = require('../utils')
const middy_1 = __importDefault(require('middy'))
// TODO: Get all TODO items for a current user
exports.handler = (0, middy_1.default)(async (event) => {
  // Write your code here
  try {
    const userId = (0, utils_1.getUserId)(event)
    const todos = await (0, todos_1.getTodos)(userId)
    return {
      statusCode: 200,
      body: JSON.stringify({ todos })
    }
  } catch (e) {
    console.error(e)
  }
})
exports.handler.use(
  (0, middlewares_1.cors)({
    credentials: true
  })
)
//# sourceMappingURL=getTodos.js.map

exports.handler({
  headers: {
    Authorization:
      'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFxM0hRVG1WSDNRYWx4OS1RN2EwWCJ9.eyJpc3MiOiJodHRwczovL2Rldi11azR5emZkdmp4YXdkaHc2LnVzLmF1dGgwLmNvbS8iLCJhdWQiOiJsSGVQREdNZVIwSXlZd1V1SDR1aXZBWjc2eU1oNU9teSIsImlhdCI6MTY3OTU3NTExMCwiZXhwIjoxNjc5NjExMTEwLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExMDQxMDE2MzQ3Njc5NjYwNzY4NiIsImF0X2hhc2giOiJMQThpc0VEMUNKcHRZU214WnFPVFF3Iiwic2lkIjoiZWxxVEx3ZUVDSTBGek5lRzRQSC1RNldYR2I4MGcyV2ciLCJub25jZSI6ImpEcn5xLmJmUVFPdE5ya1g1YXRrTUdRLUhLNDE2WlZfIn0.mnmfq0K9ixhMm7vVmUP2Xi3FY2m3_REr2sGMow6S4t4kP3uUGHRQatymRgaU4t_w4-mAvbsRfNeQGXgX5fhcJPhp0hYHOG6fi1rDkNevVsiRxdguHpb3UKX6kCF519g1fQm4UKuj6N1ptghgNeojOAumNt24PZ_t1z7rsjKu3n0kMUfzUGzjG0iyn1Po3Czue9J0ryrW6-wctLzoQ9FhJPs03pdzM9zYL3cmdgRZqowUpCyYqS0nCpizKAUF8oXmdqxILht-lsi7A31AfQ9CVdi0s1ItAP4rsYF6wPyAT4GMje2DFHe5Zdg9CkQg_a7znwWRJJwrOSAkvMnhg3atwA'
  }
})
// console.log(exports.handler())
