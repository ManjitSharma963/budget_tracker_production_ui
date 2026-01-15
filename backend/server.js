import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerUser, loginUser, getUserByToken, authenticateToken } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
// Configure CORS to allow requests from any origin (including public IPs)
// IMPORTANT: CORS must be applied BEFORE any routes
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all origins
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200 // Some browsers expect 200 instead of 204
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight requests for all routes
// This MUST be before other routes
app.options('*', (req, res) => {
  const origin = req.headers.origin || '*';
  console.log('🔄 OPTIONS preflight request from:', origin);
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(200);
});

// Also handle OPTIONS for specific auth routes
app.options('/api/auth/login', (req, res) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.options('/api/auth/register', (req, res) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database file path
const dbPath = path.join(__dirname, 'data', 'database.json');

// Initialize database if it doesn't exist
const initializeDatabase = () => {
  const defaultData = {
    expenses: [],
    income: [],
    credits: [],
    notes: [],
    tasks: [],
    budgets: [],
    recurringItems: [],
    expenseTemplates: [],
    savingsGoals: [],
    expenseSplits: []
  };
  
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
  }
};

// Read database
const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { expenses: [], income: [], credits: [], notes: [], tasks: [], budgets: [], recurringItems: [], expenseTemplates: [], savingsGoals: [], expenseSplits: [] };
  }
};

// Write database
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

// Get current timestamp in ISO format
const getTimestamp = () => {
  return new Date().toISOString().replace('Z', '').replace(/\.\d{3}/, '');
};

// Check if two time ranges overlap
const doTimeRangesOverlap = (start1, end1, start2, end2) => {
  if (!start1 || !end1 || !start2 || !end2) return false;
  
  // Convert time strings (HH:MM) to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  // Check if ranges overlap
  // Two ranges overlap if: start1 < end2 && start2 < end1
  return start1Min < end2Min && start2Min < end1Min;
};

// Check for time conflicts with existing tasks
const checkTimeConflict = (tasks, date, startTime, endTime, excludeTaskId = null) => {
  if (!startTime || !endTime) return null; // No conflict if no time specified
  
  // Filter tasks for the same date, excluding the task being updated
  const sameDateTasks = tasks.filter(task => {
    if (task.date !== date) return false;
    if (excludeTaskId && task.id === excludeTaskId) return false;
    if (!task.startTime || !task.endTime) return false; // Skip tasks without time
    return true;
  });
  
  // Check for overlaps
  for (const task of sameDateTasks) {
    if (doTimeRangesOverlap(startTime, endTime, task.startTime, task.endTime)) {
      return {
        conflictingTask: task,
        message: `Time slot conflicts with existing task "${task.title}" (${task.startTime} - ${task.endTime})`
      };
    }
  }
  
  return null;
};

// Initialize database on startup
initializeDatabase();

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register endpoint (public - no auth required)
app.post('/api/auth/register', (req, res) => {
  // Set CORS headers explicitly
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    console.log('📝 Register request received from:', origin);
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const result = registerUser(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint (public - no auth required)
app.post('/api/auth/login', (req, res) => {
  // Set CORS headers explicitly
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    console.log('🔐 Login request received from:', origin);
    console.log('📧 Email:', req.body?.email ? 'provided' : 'missing');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = loginUser(email, password);
    console.log('✅ Login successful for:', email);
    res.json(result);
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    message: 'API is running'
  });
});

// ==================== EXPENSES ENDPOINTS ====================
// All expense endpoints require authentication

// GET /api/expenses - Fetch all expenses
app.get('/api/expenses', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.expenses);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching expenses',
      message: error.message
    });
  }
});

// GET /api/expenses/:id - Fetch single expense
app.get('/api/expenses/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const expense = db.expenses.find(e => e.id === parseInt(req.params.id));
    
    if (!expense) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching expense',
      message: error.message
    });
  }
});

// POST /api/expenses - Create new expense
app.post('/api/expenses', authenticateToken, (req, res) => {
  try {
    const { amount, description, category } = req.body;
    
    if (!amount || !description || !category) {
      return res.status(400).json({
        error: 'Missing required fields: amount, description, category'
      });
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    const db = readDatabase();
    const timestamp = getTimestamp();
    
    const newExpense = {
      id: db.expenses.length > 0 ? Math.max(...db.expenses.map(e => e.id)) + 1 : 1,
      amount: parseFloat(amount),
      description,
      category,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.expenses.push(newExpense);
    writeDatabase(db);
    
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating expense',
      message: error.message
    });
  }
});

// PUT /api/expenses/:id - Update expense
app.put('/api/expenses/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const index = db.expenses.findIndex(e => e.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    
    const { amount, description, category } = req.body;
    
    if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    const updatedExpense = {
      ...db.expenses[index],
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      updatedAt: getTimestamp()
    };
    
    db.expenses[index] = updatedExpense;
    writeDatabase(db);
    
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating expense',
      message: error.message
    });
  }
});

// DELETE /api/expenses/:id - Delete expense
app.delete('/api/expenses/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const index = db.expenses.findIndex(e => e.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }
    
    db.expenses.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting expense',
      message: error.message
    });
  }
});

// ==================== INCOME ENDPOINTS ====================
// All income endpoints require authentication

// GET /api/income - Fetch all income
app.get('/api/income', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.income);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching income',
      message: error.message
    });
  }
});

// GET /api/income/:id - Fetch single income
app.get('/api/income/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const income = db.income.find(i => i.id === parseInt(req.params.id));
    
    if (!income) {
      return res.status(404).json({
        error: 'Income not found'
      });
    }
    
    res.json(income);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching income',
      message: error.message
    });
  }
});

// POST /api/income - Create new income
app.post('/api/income', authenticateToken, (req, res) => {
  try {
    const { amount, description, source } = req.body;
    
    if (!amount || !description || !source) {
      return res.status(400).json({
        error: 'Missing required fields: amount, description, source'
      });
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    const db = readDatabase();
    const timestamp = getTimestamp();
    
    const newIncome = {
      id: db.income.length > 0 ? Math.max(...db.income.map(i => i.id)) + 1 : 1,
      amount: parseFloat(amount),
      description,
      source,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.income.push(newIncome);
    writeDatabase(db);
    
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating income',
      message: error.message
    });
  }
});

// PUT /api/income/:id - Update income
app.put('/api/income/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const index = db.income.findIndex(i => i.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Income not found'
      });
    }
    
    const { amount, description, source } = req.body;
    
    if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    const updatedIncome = {
      ...db.income[index],
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(description !== undefined && { description }),
      ...(source !== undefined && { source }),
      updatedAt: getTimestamp()
    };
    
    db.income[index] = updatedIncome;
    writeDatabase(db);
    
    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating income',
      message: error.message
    });
  }
});

// DELETE /api/income/:id - Delete income
app.delete('/api/income/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const index = db.income.findIndex(i => i.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Income not found'
      });
    }
    
    db.income.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting income',
      message: error.message
    });
  }
});

// ==================== CREDITS ENDPOINTS ====================
// All credit endpoints require authentication

// GET /api/credits - Fetch all credits
app.get('/api/credits', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.credits);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching credits',
      message: error.message
    });
  }
});

// GET /api/credits/:id - Fetch single credit
app.get('/api/credits/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const credit = db.credits.find(c => c.id === parseInt(req.params.id));
    
    if (!credit) {
      return res.status(404).json({
        error: 'Credit not found'
      });
    }
    
    res.json(credit);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching credit',
      message: error.message
    });
  }
});

// POST /api/credits - Create new credit
app.post('/api/credits', authenticateToken, (req, res) => {
  try {
    const { amount, description, creditor, creditType } = req.body;
    
    if (!amount || !description || !creditor) {
      return res.status(400).json({
        error: 'Missing required fields: amount, description, creditor'
      });
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    // Validate and normalize creditType if provided
    let finalCreditType = 'Borrowed';
    if (creditType) {
      const normalizedType = creditType.trim().toLowerCase();
      if (normalizedType === 'borrowed') {
        finalCreditType = 'Borrowed';
      } else if (normalizedType === 'lent') {
        finalCreditType = 'Lent';
      } else {
        return res.status(400).json({
          error: 'creditType must be either "BORROWED"/"Borrowed" or "LENT"/"Lent"'
        });
      }
    }
    
    const db = readDatabase();
    const timestamp = getTimestamp();
    
    const newCredit = {
      id: db.credits.length > 0 ? Math.max(...db.credits.map(c => c.id)) + 1 : 1,
      amount: parseFloat(amount),
      description,
      creditor,
      creditType: finalCreditType,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.credits.push(newCredit);
    writeDatabase(db);
    
    res.status(201).json(newCredit);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating credit',
      message: error.message
    });
  }
});

// PUT /api/credits/:id - Update credit
app.put('/api/credits/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const index = db.credits.findIndex(c => c.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Credit not found'
      });
    }
    
    const { amount, description, creditor, creditType } = req.body;
    
    if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    let normalizedCreditType = undefined;
    if (creditType !== undefined) {
      const normalizedType = creditType.trim().toLowerCase();
      if (normalizedType === 'borrowed') {
        normalizedCreditType = 'Borrowed';
      } else if (normalizedType === 'lent') {
        normalizedCreditType = 'Lent';
      } else {
        return res.status(400).json({
          error: 'creditType must be either "BORROWED"/"Borrowed" or "LENT"/"Lent"'
        });
      }
    }
    
    const updatedCredit = {
      ...db.credits[index],
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(description !== undefined && { description }),
      ...(creditor !== undefined && { creditor }),
      ...(normalizedCreditType !== undefined && { creditType: normalizedCreditType }),
      updatedAt: getTimestamp()
    };
    
    db.credits[index] = updatedCredit;
    writeDatabase(db);
    
    res.json(updatedCredit);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating credit',
      message: error.message
    });
  }
});

// DELETE /api/credits/:id - Delete credit
app.delete('/api/credits/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const index = db.credits.findIndex(c => c.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Credit not found'
      });
    }
    
    db.credits.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting credit',
      message: error.message
    });
  }
});

// ==================== NOTES ENDPOINTS ====================
// All notes endpoints require authentication

// GET /api/notes - Fetch all notes
app.get('/api/notes', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.notes || []);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching notes',
      message: error.message
    });
  }
});

// GET /api/notes/:id - Fetch single note
app.get('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const note = db.notes.find(n => n.id === parseInt(req.params.id));
    
    if (!note) {
      return res.status(404).json({
        error: 'Note not found'
      });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching note',
      message: error.message
    });
  }
});

// POST /api/notes - Create new note
app.post('/api/notes', authenticateToken, (req, res) => {
  try {
    const { title, note } = req.body;
    
    if (!title && !note) {
      return res.status(400).json({
        error: 'At least one field (title or note) is required'
      });
    }
    
    const db = readDatabase();
    if (!db.notes) {
      db.notes = [];
    }
    
    const timestamp = getTimestamp();
    
    const newNote = {
      id: db.notes.length > 0 ? Math.max(...db.notes.map(n => n.id)) + 1 : 1,
      title: title || '',
      note: note || '',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.notes.push(newNote);
    writeDatabase(db);
    
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating note',
      message: error.message
    });
  }
});

// PUT /api/notes/:id - Update note
app.put('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.notes) {
      db.notes = [];
    }
    
    const index = db.notes.findIndex(n => n.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Note not found'
      });
    }
    
    const { title, note } = req.body;
    
    const updatedNote = {
      ...db.notes[index],
      ...(title !== undefined && { title }),
      ...(note !== undefined && { note }),
      updatedAt: getTimestamp()
    };
    
    db.notes[index] = updatedNote;
    writeDatabase(db);
    
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating note',
      message: error.message
    });
  }
});

// DELETE /api/notes/:id - Delete note
app.delete('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.notes) {
      db.notes = [];
    }
    
    const index = db.notes.findIndex(n => n.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Note not found'
      });
    }
    
    db.notes.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting note',
      message: error.message
    });
  }
});

// ==================== TASKS ENDPOINTS ====================
// All task endpoints require authentication

// GET /api/tasks - Fetch all tasks
app.get('/api/tasks', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.tasks || []);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching tasks',
      message: error.message
    });
  }
});

// GET /api/tasks/:id - Fetch single task
app.get('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.tasks) {
      db.tasks = [];
    }
    const task = db.tasks.find(t => t.id === parseInt(req.params.id));
    
    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching task',
      message: error.message
    });
  }
});

// POST /api/tasks - Create new task
app.post('/api/tasks', authenticateToken, (req, res) => {
  try {
    const { title, subtitle, date, startTime, endTime, status, exercises, nutrition, details } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({
        error: 'Missing required fields: title, date'
      });
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format. Expected YYYY-MM-DD'
      });
    }
    
    // Validate time format if provided (HH:MM)
    if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) {
      return res.status(400).json({
        error: 'Invalid startTime format. Expected HH:MM'
      });
    }
    
    if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) {
      return res.status(400).json({
        error: 'Invalid endTime format. Expected HH:MM'
      });
    }
    
    // Validate status if provided
    const validStatuses = ['pending', 'completed', 'running', 'rejected'];
    const finalStatus = status && validStatuses.includes(status.toLowerCase()) 
      ? status.toLowerCase() 
      : 'pending';
    
    const db = readDatabase();
    if (!db.tasks) {
      db.tasks = [];
    }
    
    // Check for time conflicts if both startTime and endTime are provided
    if (startTime && endTime) {
      const conflict = checkTimeConflict(db.tasks, date, startTime, endTime);
      if (conflict) {
        return res.status(409).json({
          error: 'Time slot conflict',
          message: conflict.message,
          conflictingTask: {
            id: conflict.conflictingTask.id,
            title: conflict.conflictingTask.title,
            startTime: conflict.conflictingTask.startTime,
            endTime: conflict.conflictingTask.endTime
          }
        });
      }
    }
    
    const timestamp = getTimestamp();
    
    const newTask = {
      id: db.tasks.length > 0 ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1,
      title,
      subtitle: subtitle || '',
      date,
      startTime: startTime || null,
      endTime: endTime || null,
      status: finalStatus,
      exercises: exercises || null,
      nutrition: nutrition || null,
      details: details || null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.tasks.push(newTask);
    writeDatabase(db);
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating task',
      message: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.tasks) {
      db.tasks = [];
    }
    
    const index = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }
    
    const { title, subtitle, date, startTime, endTime, status, exercises, nutrition, details } = req.body;
    
    // Validate date format if provided
    if (date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          error: 'Invalid date format. Expected YYYY-MM-DD'
        });
      }
    }
    
    // Validate time formats if provided
    if (startTime !== undefined && !/^\d{2}:\d{2}$/.test(startTime)) {
      return res.status(400).json({
        error: 'Invalid startTime format. Expected HH:MM'
      });
    }
    
    if (endTime !== undefined && !/^\d{2}:\d{2}$/.test(endTime)) {
      return res.status(400).json({
        error: 'Invalid endTime format. Expected HH:MM'
      });
    }
    
    // Validate status if provided
    let normalizedStatus = undefined;
    if (status !== undefined) {
      const validStatuses = ['pending', 'completed', 'running', 'rejected'];
      if (validStatuses.includes(status.toLowerCase())) {
        normalizedStatus = status.toLowerCase();
      } else {
        return res.status(400).json({
          error: 'Invalid status. Must be one of: pending, completed, running, rejected'
        });
      }
    }
    
    // Determine the final values for date, startTime, and endTime
    const finalDate = date !== undefined ? date : db.tasks[index].date;
    const finalStartTime = startTime !== undefined ? startTime : db.tasks[index].startTime;
    const finalEndTime = endTime !== undefined ? endTime : db.tasks[index].endTime;
    
    // Check for time conflicts if both startTime and endTime are provided
    if (finalStartTime && finalEndTime) {
      const conflict = checkTimeConflict(db.tasks, finalDate, finalStartTime, finalEndTime, parseInt(req.params.id));
      if (conflict) {
        return res.status(409).json({
          error: 'Time slot conflict',
          message: conflict.message,
          conflictingTask: {
            id: conflict.conflictingTask.id,
            title: conflict.conflictingTask.title,
            startTime: conflict.conflictingTask.startTime,
            endTime: conflict.conflictingTask.endTime
          }
        });
      }
    }
    
    const updatedTask = {
      ...db.tasks[index],
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(date !== undefined && { date }),
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      ...(normalizedStatus !== undefined && { status: normalizedStatus }),
      ...(exercises !== undefined && { exercises }),
      ...(nutrition !== undefined && { nutrition }),
      ...(details !== undefined && { details }),
      updatedAt: getTimestamp()
    };
    
    db.tasks[index] = updatedTask;
    writeDatabase(db);
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating task',
      message: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.tasks) {
      db.tasks = [];
    }
    
    const index = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }
    
    db.tasks.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting task',
      message: error.message
    });
  }
});

// ==================== BUDGETS ENDPOINTS ====================
// All budget endpoints require authentication

// GET /api/budgets - Fetch all budgets
app.get('/api/budgets', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.budgets || []);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching budgets',
      message: error.message
    });
  }
});

// GET /api/budgets/:id - Fetch single budget
app.get('/api/budgets/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.budgets) {
      db.budgets = [];
    }
    const budget = db.budgets.find(b => b.id === parseInt(req.params.id));
    
    if (!budget) {
      return res.status(404).json({
        error: 'Budget not found'
      });
    }
    
    res.json(budget);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching budget',
      message: error.message
    });
  }
});

// POST /api/budgets - Create new budget
app.post('/api/budgets', authenticateToken, (req, res) => {
  try {
    const { category, budgetType, amount, percentage, period } = req.body;
    
    if (!category || !budgetType || !period) {
      return res.status(400).json({
        error: 'Missing required fields: category, budgetType, period'
      });
    }
    
    if (budgetType === 'percentage' && (!percentage || percentage <= 0 || percentage > 100)) {
      return res.status(400).json({
        error: 'Percentage must be between 0 and 100'
      });
    }
    
    if (budgetType === 'fixed' && (!amount || amount <= 0)) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }
    
    const db = readDatabase();
    if (!db.budgets) {
      db.budgets = [];
    }
    
    // Check if budget already exists for this category
    const existingBudget = db.budgets.find(b => b.category === category && b.period === period);
    if (existingBudget) {
      return res.status(409).json({
        error: 'Budget already exists for this category and period'
      });
    }
    
    const timestamp = getTimestamp();
    
    const newBudget = {
      id: db.budgets.length > 0 ? Math.max(...db.budgets.map(b => b.id)) + 1 : 1,
      category,
      budgetType,
      period,
      amount: budgetType === 'fixed' ? parseFloat(amount) : (percentage ? (parseFloat(percentage) / 100) * (req.body.monthlyIncome || 0) : null),
      percentage: budgetType === 'percentage' ? parseFloat(percentage) : null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.budgets.push(newBudget);
    writeDatabase(db);
    
    res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating budget',
      message: error.message
    });
  }
});

// PUT /api/budgets/:id - Update budget
app.put('/api/budgets/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.budgets) {
      db.budgets = [];
    }
    
    const index = db.budgets.findIndex(b => b.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Budget not found'
      });
    }
    
    const { category, budgetType, amount, percentage, period } = req.body;
    
    if (budgetType === 'percentage' && percentage !== undefined && (percentage <= 0 || percentage > 100)) {
      return res.status(400).json({
        error: 'Percentage must be between 0 and 100'
      });
    }
    
    if (budgetType === 'fixed' && amount !== undefined && amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }
    
    const updatedBudget = {
      ...db.budgets[index],
      ...(category !== undefined && { category }),
      ...(budgetType !== undefined && { budgetType }),
      ...(period !== undefined && { period }),
      ...(budgetType === 'fixed' && amount !== undefined && { amount: parseFloat(amount), percentage: null }),
      ...(budgetType === 'percentage' && percentage !== undefined && { 
        percentage: parseFloat(percentage),
        amount: (parseFloat(percentage) / 100) * (req.body.monthlyIncome || 0)
      }),
      updatedAt: getTimestamp()
    };
    
    db.budgets[index] = updatedBudget;
    writeDatabase(db);
    
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating budget',
      message: error.message
    });
  }
});

// DELETE /api/budgets/:id - Delete budget
app.delete('/api/budgets/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.budgets) {
      db.budgets = [];
    }
    
    const index = db.budgets.findIndex(b => b.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Budget not found'
      });
    }
    
    db.budgets.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting budget',
      message: error.message
    });
  }
});

// Error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.log('❌ Route not found:', req.method, req.path);
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ==================== RECURRING ITEMS ENDPOINTS ====================
// All recurring item endpoints require authentication

// GET /api/recurring - Fetch all recurring items
app.get('/api/recurring', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.recurringItems || []);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching recurring items',
      message: error.message
    });
  }
});

// GET /api/recurring/:id - Fetch single recurring item
app.get('/api/recurring/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.recurringItems) {
      db.recurringItems = [];
    }
    const item = db.recurringItems.find(r => r.id === parseInt(req.params.id));
    
    if (!item) {
      return res.status(404).json({
        error: 'Recurring item not found'
      });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching recurring item',
      message: error.message
    });
  }
});

// POST /api/recurring - Create new recurring item
app.post('/api/recurring', authenticateToken, (req, res) => {
  try {
    const { type, amount, description, category, source, frequency, startDate, endDate, isActive } = req.body;
    
    if (!type || !amount || !description || !frequency || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: type, amount, description, frequency, startDate'
      });
    }
    
    if (type !== 'expense' && type !== 'income') {
      return res.status(400).json({
        error: 'Type must be either "expense" or "income"'
      });
    }
    
    if (type === 'expense' && !category) {
      return res.status(400).json({
        error: 'Category is required for expenses'
      });
    }
    
    if (type === 'income' && !source) {
      return res.status(400).json({
        error: 'Source is required for income'
      });
    }
    
    const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validFrequencies.includes(frequency.toLowerCase())) {
      return res.status(400).json({
        error: 'Frequency must be one of: daily, weekly, monthly, yearly'
      });
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    const db = readDatabase();
    if (!db.recurringItems) {
      db.recurringItems = [];
    }
    
    const timestamp = getTimestamp();
    
    const newRecurringItem = {
      id: db.recurringItems.length > 0 ? Math.max(...db.recurringItems.map(r => r.id)) + 1 : 1,
      type: type.toLowerCase(),
      amount: parseFloat(amount),
      description,
      category: category || null,
      source: source || null,
      frequency: frequency.toLowerCase(),
      startDate,
      endDate: endDate || null,
      isActive: isActive !== undefined ? isActive : true,
      lastGenerated: null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.recurringItems.push(newRecurringItem);
    writeDatabase(db);
    
    res.status(201).json(newRecurringItem);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating recurring item',
      message: error.message
    });
  }
});

// PUT /api/recurring/:id - Update recurring item
app.put('/api/recurring/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.recurringItems) {
      db.recurringItems = [];
    }
    
    const index = db.recurringItems.findIndex(r => r.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Recurring item not found'
      });
    }
    
    const { type, amount, description, category, source, frequency, startDate, endDate, isActive } = req.body;
    
    if (type !== undefined && type !== 'expense' && type !== 'income') {
      return res.status(400).json({
        error: 'Type must be either "expense" or "income"'
      });
    }
    
    if (frequency !== undefined) {
      const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
      if (!validFrequencies.includes(frequency.toLowerCase())) {
        return res.status(400).json({
          error: 'Frequency must be one of: daily, weekly, monthly, yearly'
        });
      }
    }
    
    if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    const updatedItem = {
      ...db.recurringItems[index],
      ...(type !== undefined && { type: type.toLowerCase() }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(source !== undefined && { source }),
      ...(frequency !== undefined && { frequency: frequency.toLowerCase() }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: getTimestamp()
    };
    
    db.recurringItems[index] = updatedItem;
    writeDatabase(db);
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating recurring item',
      message: error.message
    });
  }
});

// DELETE /api/recurring/:id - Delete recurring item
app.delete('/api/recurring/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.recurringItems) {
      db.recurringItems = [];
    }
    
    const index = db.recurringItems.findIndex(r => r.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Recurring item not found'
      });
    }
    
    db.recurringItems.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting recurring item',
      message: error.message
    });
  }
});

// POST /api/recurring/:id/generate - Manually generate entry from recurring item
app.post('/api/recurring/:id/generate', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.recurringItems) {
      db.recurringItems = [];
    }
    
    const recurringItem = db.recurringItems.find(r => r.id === parseInt(req.params.id));
    
    if (!recurringItem) {
      return res.status(404).json({
        error: 'Recurring item not found'
      });
    }
    
    if (!recurringItem.isActive) {
      return res.status(400).json({
        error: 'Recurring item is not active'
      });
    }
    
    const timestamp = getTimestamp();
    const today = new Date().toISOString().split('T')[0];
    
    // Create entry based on type
    if (recurringItem.type === 'expense') {
      const newExpense = {
        id: db.expenses.length > 0 ? Math.max(...db.expenses.map(e => e.id)) + 1 : 1,
        amount: recurringItem.amount,
        description: recurringItem.description,
        category: recurringItem.category,
        date: today,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      db.expenses.push(newExpense);
    } else {
      const newIncome = {
        id: db.income.length > 0 ? Math.max(...db.income.map(i => i.id)) + 1 : 1,
        amount: recurringItem.amount,
        description: recurringItem.description,
        source: recurringItem.source,
        date: today,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      db.income.push(newIncome);
    }
    
    // Update lastGenerated
    recurringItem.lastGenerated = today;
    recurringItem.updatedAt = timestamp;
    
    writeDatabase(db);
    
    res.status(201).json({
      message: 'Entry generated successfully',
      recurringItem
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error generating entry',
      message: error.message
    });
  }
});

// ==================== EXPENSE TEMPLATES ENDPOINTS ====================
// All template endpoints require authentication

// GET /api/templates - Fetch all expense templates
app.get('/api/templates', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.expenseTemplates || []);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching templates',
      message: error.message
    });
  }
});

// POST /api/templates - Create new template
app.post('/api/templates', authenticateToken, (req, res) => {
  try {
    const { name, amount, category, paymentMode, note } = req.body;
    
    if (!name || !amount || !category) {
      return res.status(400).json({
        error: 'Missing required fields: name, amount, category'
      });
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    const db = readDatabase();
    if (!db.expenseTemplates) {
      db.expenseTemplates = [];
    }
    
    const timestamp = getTimestamp();
    
    const newTemplate = {
      id: db.expenseTemplates.length > 0 ? Math.max(...db.expenseTemplates.map(t => t.id)) + 1 : 1,
      name,
      amount: parseFloat(amount),
      category,
      paymentMode: paymentMode || 'Cash',
      note: note || '',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.expenseTemplates.push(newTemplate);
    writeDatabase(db);
    
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating template',
      message: error.message
    });
  }
});

// PUT /api/templates/:id - Update template
app.put('/api/templates/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.expenseTemplates) {
      db.expenseTemplates = [];
    }
    
    const index = db.expenseTemplates.findIndex(t => t.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Template not found'
      });
    }
    
    const { name, amount, category, paymentMode, note } = req.body;
    
    if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }
    
    const updatedTemplate = {
      ...db.expenseTemplates[index],
      ...(name !== undefined && { name }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(category !== undefined && { category }),
      ...(paymentMode !== undefined && { paymentMode }),
      ...(note !== undefined && { note }),
      updatedAt: getTimestamp()
    };
    
    db.expenseTemplates[index] = updatedTemplate;
    writeDatabase(db);
    
    res.json(updatedTemplate);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating template',
      message: error.message
    });
  }
});

// DELETE /api/templates/:id - Delete template
app.delete('/api/templates/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.expenseTemplates) {
      db.expenseTemplates = [];
    }
    
    const index = db.expenseTemplates.findIndex(t => t.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Template not found'
      });
    }
    
    db.expenseTemplates.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting template',
      message: error.message
    });
  }
});

// ==================== SAVINGS GOALS ENDPOINTS ====================
// All savings goal endpoints require authentication

// GET /api/savings-goals - Fetch all savings goals
app.get('/api/savings-goals', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.savingsGoals || []);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching savings goals',
      message: error.message
    });
  }
});

// POST /api/savings-goals - Create new savings goal
app.post('/api/savings-goals', authenticateToken, (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, description } = req.body;
    
    if (!name || !targetAmount) {
      return res.status(400).json({
        error: 'Missing required fields: name, targetAmount'
      });
    }
    
    if (isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
      return res.status(400).json({
        error: 'Target amount must be a positive number'
      });
    }
    
    const db = readDatabase();
    if (!db.savingsGoals) {
      db.savingsGoals = [];
    }
    
    const timestamp = getTimestamp();
    
    const newGoal = {
      id: db.savingsGoals.length > 0 ? Math.max(...db.savingsGoals.map(g => g.id)) + 1 : 1,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || 0),
      targetDate: targetDate || null,
      description: description || '',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    db.savingsGoals.push(newGoal);
    writeDatabase(db);
    
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({
      error: 'Error creating savings goal',
      message: error.message
    });
  }
});

// PUT /api/savings-goals/:id - Update savings goal
app.put('/api/savings-goals/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.savingsGoals) {
      db.savingsGoals = [];
    }
    
    const index = db.savingsGoals.findIndex(g => g.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Savings goal not found'
      });
    }
    
    const { name, targetAmount, currentAmount, targetDate, description } = req.body;
    
    if (targetAmount !== undefined && (isNaN(targetAmount) || parseFloat(targetAmount) <= 0)) {
      return res.status(400).json({
        error: 'Target amount must be a positive number'
      });
    }
    
    const updatedGoal = {
      ...db.savingsGoals[index],
      ...(name !== undefined && { name }),
      ...(targetAmount !== undefined && { targetAmount: parseFloat(targetAmount) }),
      ...(currentAmount !== undefined && { currentAmount: parseFloat(currentAmount) }),
      ...(targetDate !== undefined && { targetDate }),
      ...(description !== undefined && { description }),
      updatedAt: getTimestamp()
    };
    
    db.savingsGoals[index] = updatedGoal;
    writeDatabase(db);
    
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating savings goal',
      message: error.message
    });
  }
});

// DELETE /api/savings-goals/:id - Delete savings goal
app.delete('/api/savings-goals/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    if (!db.savingsGoals) {
      db.savingsGoals = [];
    }
    
    const index = db.savingsGoals.findIndex(g => g.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        error: 'Savings goal not found'
      });
    }
    
    db.savingsGoals.splice(index, 1);
    writeDatabase(db);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting savings goal',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📊 API endpoints available at http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Accessible from: http://localhost:${PORT} or http://YOUR_IP:${PORT}`);
  console.log(`🔐 Auth endpoints: POST /api/auth/login, POST /api/auth/register`);
});
