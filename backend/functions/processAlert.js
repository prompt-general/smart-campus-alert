// DUMMY PROCESSING – could add analytics, enrichment, or logging later
exports.handler = async (event) => {
    console.log('Processing alert:', JSON.stringify(event.detail, null, 2));
    // Here you could add custom logic like severity re-evaluation, ML, etc.
    return { statusCode: 200, body: 'Processed' };
};