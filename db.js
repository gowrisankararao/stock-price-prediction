const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Use in-memory DB when running on Vercel or when explicitly requested
const useInMemory = !!(process.env.VERCEL || process.env.USE_IN_MEMORY_DB);
const dbPath = useInMemory ? ':memory:' : path.join(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log(`Connected to SQLite database (${dbPath})`);
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )`, async (createErr) => {
            if (createErr) {
                console.error('Failed to create users table:', createErr.message);
                return;
            }

            // If running in-memory, optionally seed an admin user for demo purposes
            if (useInMemory && process.env.SEED_ADMIN_USER === '1') {
                const adminUser = process.env.ADMIN_USERNAME || 'admin@example.com';
                const adminPass = process.env.ADMIN_PASSWORD || 'adminpass';
                const hashed = await bcrypt.hash(adminPass, 10);
                db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', [adminUser, hashed, 'admin'], (err) => {
                    if (err) console.error('Failed to seed admin user:', err.message);
                    else console.log('Seeded admin user for in-memory DB');
                });
            }
        });
    }
});

module.exports = db;
