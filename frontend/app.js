const API_URL = ''; // Set after deployment

document.getElementById('alertForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('type').value;
    const message = document.getElementById('message').value;
    const location = document.getElementById('location').value;
    const createdBy = document.getElementById('createdBy').value;

    const res = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, location, createdBy })
    });
    const data = await res.json();
    alert(`Alert sent: ${data.alertId}`);
    loadAlerts();
});

async function loadAlerts() {
    const res = await fetch(`${API_URL}/alerts`);
    const alerts = await res.json();
    const list = document.getElementById('alertList');
    list.innerHTML = alerts.map(a => `<li><strong>${a.type}</strong> - ${a.message} (${a.createdAt})</li>`).join('');
}
loadAlerts();