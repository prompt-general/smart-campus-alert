// Enrichment logic – fetch weather data if location is provided
const axios = require('axios');

exports.handler = async (event) => {
    console.log('Processing alert:', JSON.stringify(event.detail, null, 2));
    const alert = event.detail;

    // Only enrich if location is specific (not Campus Wide)
    if (alert.location && alert.location !== 'Campus Wide') {
        try {
            const weatherUrl = `${process.env.WEATHER_API_URL}/${encodeURIComponent(alert.location)}?format=3`;
            const response = await axios.get(weatherUrl);
            console.log(`Weather enrichment for ${alert.location}: ${response.data}`);
            
            // In a real system, you'd update the event or store this enrichment
            // For now, we just log it as proof of concept.
            alert.weatherEnrichment = response.data;
        } catch (err) {
            console.warn('Weather enrichment failed:', err.message);
        }
    }

    return { statusCode: 200, body: 'Processed', enriched: !!alert.weatherEnrichment };
};