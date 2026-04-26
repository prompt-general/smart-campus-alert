const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../utils/aws-clients');


// Helper to compute severity from alert type
function getSeverity(type) {
    switch (type) {
        case 'EMERGENCY': return 'HIGH';
        case 'WEATHER': return 'MEDIUM';
        case 'FACILITY': return 'LOW';
        default: return 'UNKNOWN';
    }
}

exports.handler = async (event) => {
    const alert = event.detail;

    const item = {
        alertId: alert.alertId,
        type: alert.type,
        severity: getSeverity(alert.type),
        message: alert.message,
        location: alert.location,
        createdAt: alert.createdAt,
        createdBy: alert.createdBy
    };

    const params = {
        TableName: process.env.ALERTS_TABLE,
        Item: item
    };

    try {
        await docClient.send(new PutCommand(params));
        console.log(`Alert ${alert.alertId} persisted to DynamoDB`);
        return { statusCode: 200, body: 'Persisted' };
    } catch (err) {
        console.error('DynamoDB put error:', err);
        throw err;
    }
};