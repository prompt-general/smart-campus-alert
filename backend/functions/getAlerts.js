const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../utils/aws-clients');

exports.handler = async (event) => {
    // API Key validation
    const providedKey = event.headers['x-api-key'] || event.headers['X-Api-Key'];
    const expectedKey = process.env.API_KEY;

    if (!providedKey || providedKey !== expectedKey) {
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Unauthorized: Invalid or missing API Key' })
        };
    }

    try {
        // Get location query param
        const queryParams = event.queryStringParameters || {};
        const locationFilter = queryParams.location;

        const scanParams = {
            TableName: process.env.ALERTS_TABLE
        };
        const result = await docClient.send(new ScanCommand(scanParams));
        let alerts = result.Items;

        // Filter by location if provided (case-insensitive partial match)
        if (locationFilter) {
            const locLower = locationFilter.toLowerCase();
            alerts = alerts.filter(alert => 
                alert.location && alert.location.toLowerCase().includes(locLower)
            );
        }

        // Sort newest first (by createdAt descending)
        alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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