const { PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const { v4: uuidv4 } = require('uuid');
const { eventBridgeClient: eventBridge } = require('../utils/aws-clients');


exports.handler = async (event) => {
    try {
        const { type, message, location, createdBy } = JSON.parse(event.body);

        // Basic validation
        if (!type || !message || !createdBy) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Missing required fields: type, message, createdBy' })
            };
        }

        const alertId = uuidv4();
        const now = new Date().toISOString();

        const eventDetail = {
            alertId,
            type,          // EMERGENCY, WEATHER, FACILITY
            message,
            location: location || 'Campus Wide',
            createdBy,
            createdAt: now
        };

        const params = {
            Entries: [
                {
                    EventBusName: process.env.EVENT_BUS_NAME,
                    Source: 'campus.alert',
                    DetailType: 'AlertCreated',
                    Detail: JSON.stringify(eventDetail),
                    Time: new Date()
                }
            ]
        };

        await eventBridge.send(new PutEventsCommand(params));

        return {
            statusCode: 202,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: 'Alert event published',
                alertId,
                status: 'processing'
            })
        };
    } catch (error) {
        console.error('Error publishing event:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};