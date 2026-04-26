const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async () => {
    try {
        const params = {
            TableName: process.env.ALERTS_TABLE
        };
        const result = await docClient.send(new ScanCommand(params));
        // Sort newest first (by createdAt descending)
        const alerts = result.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(alerts)
        };
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Could not retrieve alerts' })
        };
    }
};