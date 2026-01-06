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
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all origins for now (you can restrict this in production)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

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
    notes: []
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
    return { expenses: [], income: [], credits: [], notes: [] };
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

// Initialize database on startup
initializeDatabase();

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register endpoint (public - no auth required)
app.post('/api/auth/register', (req, res) => {
  try {
    console.log('📝 Register request received from:', req.headers.origin || req.headers.host);
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
  try {
    console.log('🔐 Login request received from:', req.headers.origin || req.headers.host);
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📊 API endpoints available at http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Accessible from: http://localhost:${PORT} or http://YOUR_IP:${PORT}`);
  console.log(`🔐 Auth endpoints: POST /api/auth/login, POST /api/auth/register`);
});
