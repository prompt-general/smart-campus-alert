const axios = require('axios');
const { PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const { eventBridgeClient: eventBridge } = require('../utils/aws-clients');

exports.handler = async (event) => {
    console.log('Scheduled weather check started');
    const location = process.env.LOCATION || 'Campus';
    
    try {
        // Fetch weather
        const weatherUrl = `${process.env.WEATHER_API_URL}/${encodeURIComponent(location)}?format=3`;
        const response = await axios.get(weatherUrl);
        const weatherData = response.data;
        
        console.log(`Weather at ${location}: ${weatherData}`);

        // If weather contains "storm" or "snow", or just as a daily update
        // We'll publish a WEATHER alert
        const eventDetail = {
            alertId: `sched-${Date.now()}`,
            type: 'WEATHER',
            message: `Daily Weather Update: ${weatherData}`,
            location: location,
            createdBy: 'SystemScheduler',
            createdAt: new Date().toISOString()
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
        console.log('Published scheduled weather alert');

        return { statusCode: 200, body: 'Scheduled check complete' };
    } catch (err) {
        console.error('Scheduled weather check failed:', err);
        throw err;
    }
};
