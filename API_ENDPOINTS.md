# API Endpoints & cURL Examples

Base URL: `http://localhost:8080`

## Health Check

### GET /api/health

Check API status

**cURL:**

```bash
curl -X GET http://localhost:8080/api/health
```

**Response:**

```json
{
  "status": "UP",
  "message": "API is running"
}
```

---

## Expenses Endpoints

### GET /api/expenses

Fetch all expenses

**cURL:**

```bash
curl -X GET http://localhost:8080/api/expenses
```

**Response:**

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

---

### GET /api/expenses/:id

Fetch single expense

**cURL:**

```bash
curl -X GET http://localhost:8080/api/expenses/1
```

**Response:**

```json
{
  "id": 1,
  "amount": 100.50,
  "description": "Grocery shopping",
  "category": "Food",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:00:00"
}
```

---

### POST /api/expenses

Create expense

**cURL:**

```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 100.50,
    \"description\": \"Grocery shopping\",
    \"category\": \"Food\"
  }"
```

**Request Body:**

```json
{
  "amount": 100.50,
  "description": "Grocery shopping",
  "category": "Food"
}
```

**Response:**

```json
{
  "id": 1,
  "amount": 100.50,
  "description": "Grocery shopping",
  "category": "Food",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:00:00"
}
```

---

### PUT /api/expenses/:id

Update expense

**cURL:**

```bash
curl -X PUT http://localhost:8080/api/expenses/1 \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 150.75,
    \"description\": \"Updated grocery shopping\",
    \"category\": \"Food & Beverages\"
  }"
```

**Request Body:**

```json
{
  "amount": 150.75,
  "description": "Updated grocery shopping",
  "category": "Food & Beverages"
}
```

**Response:**

```json
{
  "id": 1,
  "amount": 150.75,
  "description": "Updated grocery shopping",
  "category": "Food & Beverages",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:05:00"
}
```

---

### DELETE /api/expenses/:id

Delete expense

**cURL:**

```bash
curl -X DELETE http://localhost:8080/api/expenses/1
```

**Response:**

- Status: 204 No Content

---

## Income Endpoints

### GET /api/income

Fetch all income

**cURL:**

```bash
curl -X GET http://localhost:8080/api/income
```

**Response:**

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

---

### GET /api/income/:id

Fetch single income

**cURL:**

```bash
curl -X GET http://localhost:8080/api/income/1
```

**Response:**

```json
{
  "id": 1,
  "amount": 5000.00,
  "description": "Monthly salary",
  "source": "Employer",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:00:00"
}
```

---

### POST /api/income

Create income

**cURL:**

```bash
curl -X POST http://localhost:8080/api/income \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 5000.00,
    \"description\": \"Monthly salary\",
    \"source\": \"Employer\"
  }"
```

**Request Body:**

```json
{
  "amount": 5000.00,
  "description": "Monthly salary",
  "source": "Employer"
}
```

**Response:**

```json
{
  "id": 1,
  "amount": 5000.00,
  "description": "Monthly salary",
  "source": "Employer",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:00:00"
}
```

---

### PUT /api/income/:id

Update income

**cURL:**

```bash
curl -X PUT http://localhost:8080/api/income/1 \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 5500.00,
    \"description\": \"Updated monthly salary\",
    \"source\": \"Employer\"
  }"
```

**Request Body:**

```json
{
  "amount": 5500.00,
  "description": "Updated monthly salary",
  "source": "Employer"
}
```

**Response:**

```json
{
  "id": 1,
  "amount": 5500.00,
  "description": "Updated monthly salary",
  "source": "Employer",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:05:00"
}
```

---

### DELETE /api/income/:id

Delete income

**cURL:**

```bash
curl -X DELETE http://localhost:8080/api/income/1
```

**Response:**

- Status: 204 No Content

---

## Credits Endpoints

### GET /api/credits

Fetch all credits

**cURL:**

```bash
curl -X GET http://localhost:8080/api/credits
```

**Response:**

```json
[
  {
    "id": 1,
    "amount": 200.00,
    "description": "Loan from friend",
    "creditor": "John Doe",
    "creditType": "Borrowed",
    "createdAt": "2024-01-03T10:00:00",
    "updatedAt": "2024-01-03T10:00:00"
  }
]
```

---

### GET /api/credits/:id

Fetch single credit

**cURL:**

```bash
curl -X GET http://localhost:8080/api/credits/1
```

**Response:**

```json
{
  "id": 1,
  "amount": 200.00,
  "description": "Loan from friend",
  "creditor": "John Doe",
  "creditType": "Borrowed",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:00:00"
}
```

---

### POST /api/credits

Create credit

**cURL:**

```bash
curl -X POST http://localhost:8080/api/credits \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 200.00,
    \"description\": \"Loan from friend\",
    \"creditor\": \"John Doe\",
    \"creditType\": \"BORROWED\"
  }"
```

**Example for Lent:**

```bash
curl -X POST http://localhost:8080/api/credits \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 500.00,
    \"description\": \"Loan to friend\",
    \"creditor\": \"Jane Smith\",
    \"creditType\": \"LENT\"
  }"
```

**Request Body:**

```json
{
  "amount": 200.00,
  "description": "Loan from friend",
  "creditor": "John Doe",
  "creditType": "BORROWED"
}
```

**Note:** The `creditType` field is optional. If not provided, it defaults to "Borrowed". Valid values are "BORROWED", "Borrowed", "borrowed" (for borrowed money) or "LENT", "Lent", "lent" (for lent money). The API accepts any case and will normalize it to "Borrowed" or "Lent" in the response.

**Response:**

```json
{
  "id": 1,
  "amount": 200.00,
  "description": "Loan from friend",
  "creditor": "John Doe",
  "creditType": "Borrowed",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:00:00"
}
```

---

### PUT /api/credits/:id

Update credit

**cURL:**

```bash
curl -X PUT http://localhost:8080/api/credits/1 \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 250.00,
    \"description\": \"Updated loan from friend\",
    \"creditor\": \"John Doe\"
  }"
```

**Request Body:**

```json
{
  "amount": 250.00,
  "description": "Updated loan from friend",
  "creditor": "John Doe",
  "creditType": "Lent"
}
```

**Response:**

```json
{
  "id": 1,
  "amount": 250.00,
  "description": "Updated loan from friend",
  "creditor": "John Doe",
  "creditType": "Lent",
  "createdAt": "2024-01-03T10:00:00",
  "updatedAt": "2024-01-03T10:05:00"
}
```

---

### DELETE /api/credits/:id

Delete credit

**cURL:**

```bash
curl -X DELETE http://localhost:8080/api/credits/1
```

**Response:**

- Status: 204 No Content

---

## JavaScript/Fetch Examples

### GET Request

```javascript
fetch('http://localhost:8080/api/expenses')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### POST Request

```javascript
fetch('http://localhost:8080/api/expenses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 100.50,
    description: 'Grocery shopping',
    category: 'Food'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### PUT Request

```javascript
fetch('http://localhost:8080/api/expenses/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 150.75,
    description: 'Updated grocery shopping',
    category: 'Food & Beverages'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### DELETE Request

```javascript
fetch('http://localhost:8080/api/expenses/1', {
  method: 'DELETE'
})
  .then(response => {
    if (response.ok) {
      console.log('Deleted successfully');
    }
  })
  .catch(error => console.error('Error:', error));
```

---

## Axios Examples

### GET Request

```javascript
axios.get('http://localhost:8080/api/expenses')
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

### POST Request

```javascript
axios.post('http://localhost:8080/api/expenses', {
  amount: 100.50,
  description: 'Grocery shopping',
  category: 'Food'
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

### PUT Request

```javascript
axios.put('http://localhost:8080/api/expenses/1', {
  amount: 150.75,
  description: 'Updated grocery shopping',
  category: 'Food & Beverages'
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

### DELETE Request

```javascript
axios.delete('http://localhost:8080/api/expenses/1')
  .then(response => console.log('Deleted successfully'))
  .catch(error => console.error('Error:', error));
```

---

## Response Status Codes

- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `404 Not Found` - Resource not found
- `400 Bad Request` - Invalid request data

---

## Notes

- All endpoints require `Content-Type: application/json` header for POST and PUT requests
- Amount fields must be positive numbers
- Timestamps (createdAt, updatedAt) are automatically managed by the application
- Replace `:id` in URLs with actual numeric IDs (e.g., `/api/expenses/1`)
