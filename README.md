# StockapiApp - Stock Price Prediction with AI

A modern web application that predicts stock prices using artificial intelligence, built with Node.js, Express, Socket.io, and integrated with multiple AI providers (Hugging Face, Google Generative AI).

## 🚀 Features

- **User Authentication:** Secure login/register with JWT and bcrypt
- **Stock Price Prediction:** AI-powered stock price forecasting
- **Real-time Chat:** WebSocket-based chat functionality
- **Admin Dashboard:** Admin panel for user management
- **AI Integration:** Multiple AI providers for predictions
- **SQLite Database:** Lightweight persistent storage

## 📋 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** JWT, bcryptjs
- **Real-time:** Socket.io
- **AI Providers:** 
  - Hugging Face Inference API
  - Google Generative AI
- **Frontend:** EJS Templates
- **API Integration:** Axios for external APIs

## 🛠️ Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/gowrisankararao/stock-price-prediction.git
cd stock-price-prediction

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update .env with your actual credentials
nano .env

# Start the development server
npm start
```

The application will be available at `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stockapi_db

# Authentication
JWT_SECRET=your_jwt_secret_key

# APIs
HUGGINGFACE_API_KEY=your_huggingface_key
ALPHAVANTAGE_API_KEY=your_alphavantage_key
RAPIDAPI_KEY=your_rapidapi_key

# Server
PORT=3000
NODE_ENV=development
```

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
│       ├── ci.yml          # Build and test workflow
│       └── deploy.yml      # Deployment to Vercel
├── controllers/            # Route controllers
│   ├── aboutController.js
│   ├── messageController.js
│   └── predictController.js
├── routes/                 # API routes
│   ├── aboutRoutes.js
│   ├── messageRoutes.js
│   └── predictRoutes.js
├── views/                  # EJS templates
│   ├── home.ejs
│   ├── dashboard.ejs
│   ├── admin.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── ...
├── db.js                   # SQLite database setup
├── server.js              # Main server file
├── package.json           # Dependencies
└── vercel.json           # Vercel configuration
```

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for automated testing, building, and deployment to **Vercel**.

### Workflow Files:

1. **ci.yml** - Runs on every push/PR
   - Installs dependencies
   - Runs linting (if configured)
   - Runs tests (if configured)
   - Builds the application

2. **deploy.yml** - Runs on main branch push
   - Builds the project
   - Deploys to Vercel production

### Setup Instructions:

#### 1. Get Vercel Token
```bash
vercel login
vercel tokens create
```

#### 2. Add Secrets to GitHub
Go to `Settings > Secrets and variables > Actions` and add:
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_PROJECT_ID` - (Optional) Your Vercel project ID
- `VERCEL_ORG_ID` - (Optional) Your Vercel org ID

#### 3. Configure Vercel Project
```bash
# Link your project to Vercel
vercel link
```

This creates `.vercel/project.json` and `.vercel/.env.local` files.

## 🚀 Deployment

### Automatic Deployment (via GitHub Actions)
Push to `main` branch:
```bash
git add .
git commit -m "Feature: Add new feature"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Build the application
2. Run tests
3. Deploy to Vercel production

### Manual Deployment
```bash
# Deploy to Vercel
vercel --prod

# View deployment logs
vercel logs
```

## 📊 API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Login user
- `GET /register` - Register page
- `POST /register` - Create new user
- `GET /logout` - Logout user

### Pages
- `GET /home` - Home page (authenticated)
- `GET /dashboard` - Stock dashboard
- `GET /admin` - Admin panel (admin only)
- `GET /about` - About page

### API
- `GET /api/stock/:symbol` - Get stock data (requires API key)
- `POST /chat` - Chat with AI (authenticated)
- `POST /predict` - Stock price prediction (authenticated)

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Run with coverage
npm run test:coverage
```

## 🛠️ Development

### Local Development with Hot Reload
```bash
# Install nodemon for auto-restart
npm install --save-dev nodemon

# Update package.json scripts
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}

# Run development server
npm run dev
```

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Feature: Description"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request on GitHub

# After review and approval, merge to main
# GitHub Actions will automatically deploy
```

## 🔒 Security Best Practices

1. **Never commit secrets** - Use `.env.example` for templates
2. **Keep dependencies updated:**
   ```bash
   npm audit
   npm audit fix
   npm outdated
   ```
3. **Use HTTPS in production**
4. **Enable GitHub Push Protection** for secret scanning
5. **Review security alerts** in GitHub Security tab

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in .env
PORT=3001

# Or kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Database connection error
```bash
# Verify .env has correct DB credentials
# Check if SQLite file exists
ls -la database.db
```

### Vercel deployment fails
```bash
# Check logs
vercel logs

# Rebuild locally
npm run build

# Check vercel.json configuration
cat vercel.json
```

## 📈 Performance Optimization

- Implement caching headers
- Minimize database queries
- Use connection pooling
- Optimize EJS templates
- Consider using Redis for sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Gowri Sankar Aradhya**
- GitHub: [@gowrisankararao](https://github.com/gowrisankararao)
- Repository: [stock-price-prediction](https://github.com/gowrisankararao/stock-price-prediction)

## 📞 Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment info

## 🎯 Roadmap

- [ ] Add comprehensive test suite
- [ ] Implement machine learning models
- [ ] Add WebSocket message persistence
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Add Docker support
- [ ] Implement rate limiting
- [ ] Add email notifications
- [ ] Create mobile app version

## 🔗 Links

- **Repository:** https://github.com/gowrisankararao/stock-price-prediction
- **Live Demo:** https://stock-price-prediction.vercel.app (coming soon)
- **Issues:** https://github.com/gowrisankararao/stock-price-prediction/issues
