const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const db = require('./db');
const { Server } = require('socket.io');
const http = require('http');  
const axios = require('axios'); 
const dotenv = require('dotenv');
const { chatCompletion } = require('@huggingface/inference');
const messageRoutes = require('./routes/messageRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const predictRoutes = require('./routes/predictRoutes');


dotenv.config();
const hfApiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.RAPIDAPI_KEY || null;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const API_KEY = process.env.API_KEY || process.env.ALPHAVANTAGE_API_KEY || process.env.ALPHA_API_KEY || null;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));



// Middleware for checking authentication
function isAuthenticated(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch {
        res.redirect('/login');
    }
}

// ✅ Admin Middleware
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/home'); // Redirect non-admin users
}

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/home', isAuthenticated, (req, res) => {
    res.render('home', { user: req.user });
});

app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/start', (req, res) => {
    res.render('start'); // Ensure you have a 'start.ejs' file inside the 'views' folder
});


app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('error', { message: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password:", hashedPassword);

        db.get('SELECT COUNT(*) AS userCount FROM users', (err, row) => {
            if (err) {
                console.error("Database error:", err);
                return res.render('error', { message: 'Database error' });
            }

            const userCount = row.userCount;
            const role = userCount === 0 ? 'admin' : 'user';

            db.run(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role],
                function(err) {
                    if (err) return res.render('error', { message: 'User registration failed' });
                    res.redirect('/login');
                }
            );
            
        });
    } catch (error) {
        console.error("Server error:", error);
        res.render('error', { message: 'Something went wrong' });
    }
});


app.get('/login', (req, res) => {
    res.render('login');
});
app.use('/', messageRoutes);
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user || !(await bcrypt.compare(password, user.password))) {
            return res.render('error', { message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
        res.cookie('token', token);
        res.redirect('/home');
    });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});
app.use('/', predictRoutes);
// ✅ Admin Panel Route
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    db.all('SELECT id, username, role FROM users', (err, users) => {
        if (err) return res.render('error', { message: 'Database error' });

        res.render('admin', { users: users, admin: req.user });
    });
});

// Error page
app.get('/error', (req, res) => {
    res.render('error', { message: 'Something went wrong' });
});

// Endpoint for stock data
app.get('/api/stock/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const sampleTimeSeries = {
        AAPL: {
            '2026-07-25': { '1. open': '188.33', '2. high': '190.12', '3. low': '186.04', '4. close': '189.26', '5. volume': '79850000' },
            '2026-07-24': { '1. open': '186.42', '2. high': '189.40', '3. low': '185.65', '4. close': '188.95', '5. volume': '65290000' },
            '2026-07-23': { '1. open': '184.75', '2. high': '187.18', '3. low': '183.40', '4. close': '186.60', '5. volume': '58310000' }
        },
        TSLA: {
            '2026-07-25': { '1. open': '228.90', '2. high': '235.12', '3. low': '227.05', '4. close': '233.50', '5. volume': '19980000' },
            '2026-07-24': { '1. open': '223.75', '2. high': '230.60', '3. low': '222.00', '4. close': '229.90', '5. volume': '18390000' },
            '2026-07-23': { '1. open': '219.50', '2. high': '224.80', '3. low': '217.40', '4. close': '223.20', '5. volume': '17140000' }
        }
    };

    if (!API_KEY) {
        return res.status(400).json({ error: 'Live stock data requires an AlphaVantage API key. Set API_KEY or ALPHAVANTAGE_API_KEY in .env.' });
    }

    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
        );

        if (response.data?.Information || response.data?.Note) {
            return res.status(400).json({ error: response.data.Information || response.data.Note });
        }

        if (!response.data || !response.data['Time Series (Daily)']) {
            return res.status(404).json({ error: 'No stock data available' });
        }

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Chat Route
app.get('/chat', isAuthenticated, (req, res) => {
    res.render('chat', { user: req.user, userInput: '', botReply: '' });
});

app.post('/chat', async (req, res) => {
    const userInput = req.body.userInput;

    if (!hfApiKey) {
        return res.render('chat', {
            userInput,
            botReply: 'The AI chat service is not configured. Set HUGGINGFACE_API_KEY or HF_API_KEY in .env to use chat.',
        });
    }

    try {
        const chatCompletionResponse = await chatCompletion({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a stock market advisor. Provide insights on stocks, market trends, and investment strategies.' },
                { role: 'user', content: userInput }
            ],
            max_tokens: 300,
            accessToken: hfApiKey,
        });

        const botReply = chatCompletionResponse.choices?.[0]?.message?.content || 'No response from AI.';

        res.render('chat', { userInput, botReply });
    } catch (error) {
        console.error('AI Error:', error);
        res.render('chat', { userInput, botReply: `Error fetching AI response: ${error.message || 'unknown error'}` });
    }
});
app.use(aboutRoutes);
// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
