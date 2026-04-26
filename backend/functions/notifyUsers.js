const { PublishCommand } = require('@aws-sdk/client-sns');
const { snsClient: sns } = require('../utils/aws-clients');


// Mock user database (in real implementation, query DynamoDB Users table)
// For Phase 1, we use static mocked users based on role.
const MOCK_USERS = [
    { userId: 'student1', role: 'student', email: 'student1@campus.edu' },
    { userId: 'student2', role: 'student', email: 'student2@campus.edu' },
    { userId: 'admin1', role: 'admin', email: 'admin@campus.edu' },
    { userId: 'maintenance1', role: 'maintenance', email: 'maintenance@campus.edu' }
];

exports.handler = async (event) => {
    const alert = event.detail;
    const { type } = alert;

    let targetEmails = [];

    // Routing logic per spec
    if (type === 'EMERGENCY' || type === 'WEATHER') {
        // All users
        targetEmails = MOCK_USERS.map(u => u.email);
    } else if (type === 'FACILITY') {
        // Only maintenance
        targetEmails = MOCK_USERS.filter(u => u.role === 'maintenance').map(u => u.email);
    } else {
        console.log(`Unknown alert type: ${type}, no notifications sent`);
        return { statusCode: 200, body: 'No action' };
    }

    if (targetEmails.length === 0) {
        console.log('No users to notify');
        return { statusCode: 200, body: 'No users found' };
    }

    // Choose SNS Topic based on alert type
    const topicArn = (type === 'FACILITY')
        ? process.env.FACILITY_TOPIC_ARN
        : process.env.EMERGENCY_TOPIC_ARN;

    // For demo, we publish a single message to the topic.
    // In a real system, you might subscribe emails to the topic.
    const message = `🚨 ALERT (${type}): ${alert.message}\nLocation: ${alert.location}\nTime: ${alert.createdAt}`;

    const params = {
        TopicArn: topicArn,
        Subject: `Campus Alert: ${type}`,
        Message: message
    };

    try {
        await sns.send(new PublishCommand(params));
        console.log(`Notification sent to topic ${topicArn} for ${targetEmails.length} users`);
        return { statusCode: 200, body: 'Notifications sent' };
    } catch (err) {
        console.error('SNS Publish error:', err);
        throw err;
    }
};