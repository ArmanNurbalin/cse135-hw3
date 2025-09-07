window.addEventListener('load', () => {
    fetch('/api/activity')
        .then(res => res.json())
        .then(allActivity => {
            const errorData = allActivity.filter(event => {
                const details = JSON.parse(event.event_details);
                return details.type === 'error';
            });
            const grid = document.getElementById('errorGrid');
            const gridData = errorData.map(event => {
                const details = JSON.parse(event.event_details);
                return {
                    page_url: details.source,
                    error_message: details.message,
                    line_number: details.lineno,
                    timestamp: new Date(event.collected_at).toLocaleString()
                };
            });
            grid.setData(gridData);

            const errorsByPage = errorData.reduce((acc, event) => {
                const details = JSON.parse(event.event_details);
                const page = details.source || 'unknown';
                acc[page] = (acc[page] || 0) + 1;
                return acc;
            }, {});

            zingchart.render({
                id: 'errorChart',
                data: {
                    type: 'bar',
                    title: { text: 'Total JavaScript Errors by Page' },
                    scaleX: {
                        labels: Object.keys(errorsByPage)
                    },
                    series: [{
                        values: Object.values(errorsByPage),
                        backgroundColor: '#E53935' 
                    }]
                }
            });

            const analysisContainer = document.getElementById('analysisText');
            const highestErrorPage = Object.keys(errorsByPage).reduce((a, b) => errorsByPage[a] > errorsByPage[b] ? a : b, '');

            if (highestErrorPage) {
                analysisContainer.innerHTML = `
                    The data clearly shows that some pages are more prone to errors than others. 
                    The bar chart above provides a high-level summary, indicating that the page <strong>${highestErrorPage}</strong> 
                    has the highest number of recorded errors (${errorsByPage[highestErrorPage]}). 
                    By examining the detailed log in the grid below, a developer can pinpoint the exact error messages, line numbers, and timestamps 
                    to debug the issues on that specific page effectively. Answering our guiding question, this analysis confirms which pages 
                    need immediate attention to improve user experience.
                `;
            } else {
                analysisContainer.innerHTML = 'No JavaScript error data has been collected yet.';
            }

        })
        .catch(err => console.error('Failed to load error data:', err));
});
