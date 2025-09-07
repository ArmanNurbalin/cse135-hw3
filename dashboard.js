window.addEventListener('load', () => {
    const API_BASE_URL = 'https://armannur.site/api';
    const activityGrid = document.getElementById('activityGrid');
    fetch(`${API_BASE_URL}/activity`)
        .then(res => res.json())
        .then(events => {
        const getWhen = (e) =>
            e.collected_at || e.timestamp || e.time || e.date || e._created || 0;

        const sorted = events
            .map(e => ({ ...e, __ts: new Date(getWhen(e)).getTime() || 0 }))
            .sort((a, b) => b.__ts - a.__ts);

        const last10 = sorted.slice(0, 10).map(({ __ts, ...rest }) => rest);
        activityGrid.setData(last10);
        })
        .catch(err => console.error('Failed to load activity:', err));
    fetch(`${API_BASE_URL}/static`)
        .then(res => res.json())
        .then(data => {
        const browserCounts = data.reduce((acc, entry) => {
            const ua = entry.user_agent || '';
            let browser = 'Other';
            if (ua.includes('Firefox')) browser = 'Firefox';
            else if (ua.includes('Chrome')) browser = 'Chrome';
            else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
            else if (ua.includes('Edg')) browser = 'Edge';
            acc[browser] = (acc[browser] || 0) + 1;
            return acc;
        }, {});
        const topBrowsers = Object.entries(browserCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        zingchart.render({
            id: 'browserChart',
            data: {
            type: 'bar',
            series: [{ values: topBrowsers.map(b => b[1]) }],
            scaleX: { labels: topBrowsers.map(b => b[0]) }
            }
        });
        });
    fetch(`${API_BASE_URL}/performance`)
        .then(res => res.json())
        .then(data => {
        zingchart.render({
            id: 'performanceChart',
            data: {
            type: 'line',
            title: { text: 'Session Load Times (ms)' },
            series: [{ values: data.map(p => p.total_load_time_ms) }],
            scaleX: { labels: data.map(p => new Date(p.collected_at).toLocaleTimeString()) }
            }
        });
        });
    });