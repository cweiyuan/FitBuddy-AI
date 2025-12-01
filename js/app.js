document.addEventListener('DOMContentLoaded', () => {
    const weatherOutput = document.getElementById('weather-output');
    const stockOutput = document.getElementById('stock-output');
    const themeSwitcher = document.getElementById('theme-switcher');

    // Fetch weather data
    async function fetchWeather() {
        try {
            weatherOutput.textContent = 'Loading weather data...';
            const response = await fetch('https://api.weatherapi.com/v1/current.json?key=4955ef7ef85c45c7a8873851250112&q=London');
            if (!response.ok) throw new Error('Weather API error');
            const data = await response.json();
            weatherOutput.textContent = `Weather in ${data.location.name}: ${data.current.condition.text}, ${data.current.temp_c}°C`;
        } catch (error) {
            weatherOutput.textContent = 'Failed to load weather data.';
        }
    }

    // Fetch stock data
    async function fetchStocks() {
        try {
            stockOutput.textContent = 'Loading stock data...';
            const response = await fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=4955ef7ef85c45c7a8873851250112');
            if (!response.ok) throw new Error('Stock API error');
            const data = await response.json();
            const stockInfo = data["Global Quote"];
            stockOutput.textContent = `AAPL: $${stockInfo["05. price"]} (${stockInfo["10. change percent"]})`;
        } catch (error) {
            stockOutput.textContent = 'Failed to load stock data.';
        }
    }

    // Theme switcher
    themeSwitcher.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    // Initialize
    fetchWeather();
    fetchStocks();
});