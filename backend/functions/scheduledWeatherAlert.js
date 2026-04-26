const { PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const { v4: uuidv4 } = require('uuid');
const { eventBridgeClient: eventBridge } = require('../utils/aws-clients');

exports.handler = async () => {
    const alertId = uuidv4();
    const now = new Date().toISOString();
    
    // Mock weather message
    const message = `Scheduled weather update: Clear skies, 22°C, light breeze. Check forecast for details.`;
    
    const eventDetail = {
        alertId,
        type: 'WEATHER',
        message: message,
        location: process.env.LOCATION || 'Campus Wide',
        createdBy: 'system-scheduler',
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

    try {
        await eventBridge.send(new PutEventsCommand(params));
        console.log(`Scheduled weather alert published: ${alertId}`);
        return { statusCode: 200, body: 'Scheduled weather alert sent' };
    } catch (err) {
        console.error('Error publishing scheduled alert:', err);
        throw err;
    }
};
