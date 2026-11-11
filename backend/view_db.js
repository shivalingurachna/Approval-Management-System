const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/project1';

async function viewDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n Connected to MongoDB:', MONGO_URI);

    const db = mongoose.connection.db;

    // 1. Fetch Users
    const users = await db.collection('users').find({}).project({ password: 0 }).toArray();
    console.log('\n================== 👥 COLLECTION: users ==================');
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.table(
        users.map((u) => ({
          ID: u._id.toString(),
          Name: u.name,
          Email: u.email,
          Role: u.role,
          Status: u.status,
          LastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never',
          Created: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
        }))
      );
    }

    // 2. Fetch Login Logs
    const loginLogs = await db.collection('loginlogs').find({}).sort({ loginAt: -1 }).toArray();
    console.log('\n================== 📜 COLLECTION: loginlogs ==================');
    if (loginLogs.length === 0) {
      console.log('No login logs found in database.');
    } else {
      console.table(
        loginLogs.map((l) => ({
          LogID: l._id.toString(),
          Name: l.name,
          Email: l.email,
          Role: l.role,
          Status: l.status,
          IP: l.ipAddress,
          LoginTime: l.loginAt ? new Date(l.loginAt).toLocaleString() : 'N/A',
        }))
      );
    }

    console.log('\n Database query completed.\n');
  } catch (error) {
    console.error('Error querying MongoDB:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

viewDatabase();
