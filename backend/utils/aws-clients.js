const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { EventBridgeClient } = require('@aws-sdk/client-eventbridge');
const { SNSClient } = require('@aws-sdk/client-sns');

const isOffline = process.env.IS_OFFLINE === 'true';

const dynamoConfig = isOffline ? {
  region: 'localhost',
  endpoint: 'http://127.0.0.1:8000',
  credentials: {
    accessKeyId: 'MockAccessKeyId',
    secretAccessKey: 'MockSecretAccessKey'
  }
} : {};

const eventBridgeConfig = isOffline ? {
  region: 'us-east-1',
  endpoint: 'http://127.0.0.1:4010',
  credentials: {
    accessKeyId: 'MockAccessKeyId',
    secretAccessKey: 'MockSecretAccessKey'
  }
} : {};

const snsConfig = isOffline ? {
  region: 'us-east-1',
  endpoint: 'http://127.0.0.1:4002',
  credentials: {
    accessKeyId: 'MockAccessKeyId',
    secretAccessKey: 'MockSecretAccessKey'
  }
} : {};


const dynamoClient = new DynamoDBClient(dynamoConfig);
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const eventBridgeClient = new EventBridgeClient(eventBridgeConfig);
const snsClient = new SNSClient(snsConfig);

module.exports = {
  docClient,
  eventBridgeClient,
  snsClient
};
