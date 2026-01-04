# Expenses Tracker

A modern React.js application for tracking personal expenses and income with visual analytics.

## Features

- 📊 **Visual Analytics**: Interactive pie chart showing expense breakdown by category
- 💰 **Expense & Income Tracking**: Toggle between expenses and income views
- 📅 **Date Grouping**: Transactions organized by date with daily expense totals
- 🎨 **Category Management**: Track expenses across multiple categories (Basic, Enjoyment, Health Care, Give, Others)
- 📱 **Responsive Design**: Clean, modern UI optimized for mobile and desktop

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

#### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

#### Backend API Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

4. The API will be available at `http://localhost:8080`

**Note:** Make sure both frontend and backend servers are running for full functionality.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
expenses-tracker/
├── backend/
│   ├── data/
│   │   └── database.json (auto-generated)
│   ├── server.js
│   ├── package.json
│   └── README.md
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ToggleSwitch.jsx
│   │   ├── PieChart.jsx
│   │   ├── TransactionList.jsx
│   │   ├── TransactionItem.jsx
│   │   ├── CreditsList.jsx
│   │   ├── AddButton.jsx
│   │   └── AddExpenseModal.jsx
│   ├── services/
│   │   └── api.js (API service functions)
│   ├── data/
│   │   └── sampleData.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── API_ENDPOINTS.md
```

## Technologies Used

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Recharts** - Chart library for data visualization
- **CSS3** - Styling

### Backend
- **Express.js** - Web framework
- **Node.js** - Runtime environment
- **JSON File Storage** - Simple database solution

## API Endpoints

The backend provides RESTful API endpoints for managing expenses, income, and credits. See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete documentation.

### Quick Reference

**Expenses:**
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

**Income:**
- `GET /api/income` - Get all income
- `POST /api/income` - Create income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

**Credits:**
- `GET /api/credits` - Get all credits
- `POST /api/credits` - Create credit
- `PUT /api/credits/:id` - Update credit
- `DELETE /api/credits/:id` - Delete credit

### Using the API in React

Import the API service functions:

```javascript
import { expensesAPI, incomeAPI, creditsAPI } from './services/api';

// Fetch all expenses
const expenses = await expensesAPI.getAll();

// Create new expense
await expensesAPI.create({
  date: '2024-01-15',
  amount: 500,
  category: 'Grocery',
  paymentMode: 'Cash'
});
```

## Customization

You can customize the app by:
- Modifying `src/data/sampleData.js` to add your own transactions
- Adjusting colors in component CSS files
- Adding new categories and their corresponding colors
- Extending functionality with additional features
- Connecting to a real database (replace JSON file storage in `backend/server.js`)

## License

MIT

