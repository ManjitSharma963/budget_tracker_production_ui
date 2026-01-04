# Expenses Tracker API

Backend API server for the Expenses Tracker application.

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:8080`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if API is running
- **Response:** `{ "status": "UP", "message": "API is running" }`

### Expenses Endpoints

#### Get All Expenses
- **GET** `/api/expenses`
- **Response:** Array of expense objects
```json
[
  {
    "id": 1,
    "amount": 100.50,
    "description": "Grocery shopping",
    "category": "Food",
    "createdAt": "2024-01-03T10:00:00",
    "updatedAt": "2024-01-03T10:00:00"
  }
]
```

#### Get Single Expense
- **GET** `/api/expenses/:id`
- **Response:** Single expense object

#### Create Expense
- **POST** `/api/expenses`
- **Body:**
```json
{
  "amount": 100.50,
  "description": "Grocery shopping",
  "category": "Food"
}
```
- **Required fields:** `amount`, `description`, `category`

#### Update Expense
- **PUT** `/api/expenses/:id`
- **Body:** Same as create, but all fields are optional

#### Delete Expense
- **DELETE** `/api/expenses/:id`
- **Response:** 204 No Content

---

### Income Endpoints

#### Get All Income
- **GET** `/api/income`
- **Response:** Array of income objects
```json
[
  {
    "id": 1,
    "amount": 5000.00,
    "description": "Monthly salary",
    "source": "Employer",
    "createdAt": "2024-01-03T10:00:00",
    "updatedAt": "2024-01-03T10:00:00"
  }
]
```

#### Get Single Income
- **GET** `/api/income/:id`

#### Create Income
- **POST** `/api/income`
- **Body:**
```json
{
  "amount": 5000.00,
  "description": "Monthly salary",
  "source": "Employer"
}
```
- **Required fields:** `amount`, `description`, `source`

#### Update Income
- **PUT** `/api/income/:id`

#### Delete Income
- **DELETE** `/api/income/:id`
- **Response:** 204 No Content

---

### Credits Endpoints

#### Get All Credits
- **GET** `/api/credits`
- **Response:** Array of credit objects
```json
[
  {
    "id": 1,
    "amount": 200.00,
    "description": "Loan from friend",
    "creditor": "John Doe",
    "createdAt": "2024-01-03T10:00:00",
    "updatedAt": "2024-01-03T10:00:00"
  }
]
```

#### Get Single Credit
- **GET** `/api/credits/:id`

#### Create Credit
- **POST** `/api/credits`
- **Body:**
```json
{
  "amount": 200.00,
  "description": "Loan from friend",
  "creditor": "John Doe"
}
```
- **Required fields:** `amount`, `description`, `creditor`

#### Update Credit
- **PUT** `/api/credits/:id`

#### Delete Credit
- **DELETE** `/api/credits/:id`
- **Response:** 204 No Content

---

## Data Storage

Data is stored in `backend/data/database.json` file. The structure is:

```json
{
  "expenses": [],
  "income": [],
  "credits": []
}
```

## Response Format

- **GET requests:** Return arrays or objects directly (not wrapped)
- **POST requests:** Return the created object with status 201
- **PUT requests:** Return the updated object with status 200
- **DELETE requests:** Return 204 No Content
- **Error responses:** Return JSON with `error` and optional `message` fields

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error message (optional)"
}
```

## Status Codes

- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## CORS

The API is configured to accept requests from any origin. For production, you should configure CORS to only allow requests from your frontend domain.

## Notes

- All timestamps (createdAt, updatedAt) are automatically managed
- Amount fields must be positive numbers
- IDs are auto-incremented integers
- All endpoints require `Content-Type: application/json` header for POST and PUT requests
