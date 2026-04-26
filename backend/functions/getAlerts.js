const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../utils/aws-clients');


exports.handler = async (event) => {
    try {
        const providedKey = event.headers['x-api-key'] || event.headers['X-Api-Key'];
        const expectedKey = process.env.API_KEY;

        if (!providedKey || providedKey !== expectedKey) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Unauthorized: Invalid or missing API Key' })
            };
        }

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