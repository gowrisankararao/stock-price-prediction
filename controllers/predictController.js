const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.API_KEY || process.env.ALPHAVANTAGE_API_KEY || process.env.ALPHA_API_KEY || null;

const predictController = async (req, res) => {
    const stockSymbol = req.query.symbol;
    if (!stockSymbol) {
        return res.render('predict', { stockData: null, details: [], error: 'Please enter a stock symbol.' });
    }

    const symbol = stockSymbol.toUpperCase();

    if (!API_KEY) {
        return res.render('predict', {
            stockData: null,
            details: [],
            error: 'Live stock quotes require an AlphaVantage API key. Add API_KEY or ALPHAVANTAGE_API_KEY to .env and restart the server.',
        });
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

        const result = await response.json();
        console.log('Stock API Response:', JSON.stringify(result, null, 2));

        if (result.Information || result.Note || !result['Global Quote'] || Object.keys(result['Global Quote']).length === 0) {
            const message = result.Information || result.Note || 'No stock data available for that symbol.';
            return res.render('predict', { stockData: null, details: [], error: message });
        }

        const quote = result['Global Quote'];
        const stockData = {
            symbol: quote['01. symbol'] || symbol,
            name: quote['01. symbol'] || symbol,
            marketPrice: quote['05. price'] || 'N/A',
            openPrice: quote['02. open'] || 'N/A',
            highPrice: quote['03. high'] || 'N/A',
            lowPrice: quote['04. low'] || 'N/A',
            volume: quote['06. volume'] || 'N/A',
            latestTradingDay: quote['07. latest trading day'] || 'N/A',
            previousClose: quote['08. previous close'] || 'N/A',
            change: quote['09. change'] || 'N/A',
            changePercent: quote['10. change percent'] || 'N/A',
            financialCurrency: 'USD',
        };

        const details = [
            { label: 'Market Price', key: 'marketPrice', tooltip: 'The current price of the stock.' },
            { label: 'Open Price', key: 'openPrice', tooltip: 'The opening price for the trading day.' },
            { label: 'High Price', key: 'highPrice', tooltip: 'The highest price reached today.' },
            { label: 'Low Price', key: 'lowPrice', tooltip: 'The lowest price reached today.' },
            { label: 'Previous Close', key: 'previousClose', tooltip: 'The closing price from the prior trading day.' },
            { label: 'Change', key: 'change', tooltip: 'Price change since the previous close.' },
            { label: 'Change Percent', key: 'changePercent', tooltip: 'Percentage move since the previous close.' },
            { label: 'Volume', key: 'volume', tooltip: 'Number of shares traded today.' },
            { label: 'Latest Trading Day', key: 'latestTradingDay', tooltip: 'The date of this quote.' },
        ];

        res.render('predict', { stockData, details, error: null });
    } catch (error) {
        console.error('Error fetching stock prediction data:', error);
        res.render('predict', { stockData: null, details: [], error: 'Failed to fetch stock data. Please try again.' });
    }
};

module.exports = predictController;
