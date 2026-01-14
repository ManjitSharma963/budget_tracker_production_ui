import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersPath = path.join(__dirname, 'data', 'users.json');

// Initialize users file
const initializeUsers = () => {
  const dataDir = path.dirname(usersPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, JSON.stringify([], null, 2));
  }
};

// Read users
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Write users
const writeUsers = (users) => {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
};

// Hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Generate token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Register user
export const registerUser = (username, email, password) => {
  initializeUsers();
  const users = readUsers();
  
  // Check if user already exists
  if (users.find(u => u.username === username)) {
    throw new Error('User with this username already exists');
  }
  
  if (users.find(u => u.email === email)) {
    throw new Error('User with this email already exists');
  }
  
  const hashedPassword = hashPassword(password);
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeUsers(users);
  
  const token = generateToken();
  
  return {
    username: newUser.username,
    email: newUser.email,
    message: 'Registration successful'
  };
};

// Login user
export const loginUser = (email, password) => {
  initializeUsers();
  const users = readUsers();
  
  const hashedPassword = hashPassword(password);
  const user = users.find(u => u.email === email && u.password === hashedPassword);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const token = generateToken();
  
  return {
    token,
    email: user.email,
    message: 'Login successful'
  };
};

// Verify token (simple implementation - in production, use JWT)
export const verifyToken = (token) => {
  // For simplicity, we'll just check if token exists
  // In production, you should use JWT with proper verification
  return token && token.length > 0;
};

// Get user by token (simplified - in production use JWT)
export const getUserByToken = (token) => {
  if (!verifyToken(token)) {
    return null;
  }
  
  // For this simple implementation, we'll return a mock user
  // In production, decode JWT token to get user info
  initializeUsers();
  const users = readUsers();
  
  // This is a simplified version - in production, decode JWT
  // For now, we'll just return the first user (not secure, but works for demo)
  if (users.length > 0) {
    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username
    };
  }
  
  return null;
};

// Authentication middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ No token provided in request to:', req.method, req.path);
    return res.status(403).json({ error: 'Access token required. Please login first.' });
  }

  const user = getUserByToken(token);
  if (!user) {
    console.log('❌ Invalid token for request to:', req.method, req.path);
    console.log('Token provided:', token ? `${token.substring(0, 10)}...` : 'none');
    
    // Check if there are any users in the system
    initializeUsers();
    const users = readUsers();
    if (users.length === 0) {
      console.log('⚠️ No users found in database. User needs to register first.');
      return res.status(403).json({ error: 'No users found. Please register first.' });
    }
    
    return res.status(403).json({ error: 'Invalid or expired token. Please login again.' });
  }

  req.user = user;
  next();
};

