const https = require('https');

// Helper to call wttr.in (free weather service, no API key)
async function getWeather(location = 'Campus') {
    const url = `${process.env.WEATHER_API_URL}/${encodeURIComponent(location)}?format=%C+%t+%w&m`;
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.trim()) {
                    resolve(data.trim());
                } else {
                    reject(new Error('No weather data'));
                }
            });
        }).on('error', reject);
    });
}

exports.handler = async (event) => {
    const alert = event.detail;
    console.log('Processing alert (enrichment):', JSON.stringify(alert, null, 2));

    // Only enrich WEATHER type alerts – add real-time conditions
    if (alert.type === 'WEATHER') {
        try {
            const weatherInfo = await getWeather(alert.location || 'Campus');
            alert.enrichedWeather = weatherInfo; // add to detail
            console.log(`🌦️ Enriched alert ${alert.alertId} with weather: ${weatherInfo}`);
        } catch (err) {
            console.warn(`Weather enrichment failed: ${err.message}`);
            alert.enrichedWeather = 'Weather data unavailable';
        }
    }

    // You could also add enrichment for other types (e.g., map coordinates)
    return { statusCode: 200, body: 'Processed' };
};