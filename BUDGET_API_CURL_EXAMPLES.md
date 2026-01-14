# Budget API - cURL Examples

Base URL: `http://localhost:8080/api`

**Note:** All budget endpoints require authentication. You need to login first and use the Bearer token in the Authorization header.

## Authentication

First, login to get your auth token:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "your-email@example.com"
  }
}
```

Save the token and use it in subsequent requests:
```bash
export TOKEN="your-token-here"
```

---

## Budget Endpoints

### GET /api/budgets

Fetch all budgets

**cURL:**
```bash
curl -X GET http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
[
  {
    "id": 1,
    "category": "Grocery",
    "budgetType": "percentage",
    "amount": 5000.00,
    "percentage": 10.0,
    "period": "monthly",
    "createdAt": "2024-01-10T10:00:00",
    "updatedAt": "2024-01-10T10:00:00"
  },
  {
    "id": 2,
    "category": "Transport",
    "budgetType": "fixed",
    "amount": 20000.00,
    "percentage": null,
    "period": "monthly",
    "createdAt": "2024-01-10T11:00:00",
    "updatedAt": "2024-01-10T11:00:00"
  }
]
```

---

### GET /api/budgets/:id

Fetch single budget by ID

**cURL:**
```bash
curl -X GET http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "id": 1,
  "category": "Grocery",
  "budgetType": "percentage",
  "amount": 5000.00,
  "percentage": 10.0,
  "period": "monthly",
  "createdAt": "2024-01-10T10:00:00",
  "updatedAt": "2024-01-10T10:00:00"
}
```

---

### POST /api/budgets

Create new budget

**Fixed Amount Budget:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Transport",
    "budgetType": "fixed",
    "amount": 20000,
    "period": "monthly"
  }'
```

**Percentage Budget:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Grocery",
    "budgetType": "percentage",
    "percentage": 10,
    "period": "monthly",
    "monthlyIncome": 50000
  }'
```

**Yearly Budget:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Bills",
    "budgetType": "fixed",
    "amount": 120000,
    "period": "yearly"
  }'
```

**Request Body Fields:**
- `category` (required): Budget category - can be any category name (e.g., "Grocery", "Transport", "Utilities", "Education", "Travel", etc.)
- `budgetType` (required): Budget type - `"fixed"` or `"percentage"`
- `amount` (required if budgetType is "fixed"): Fixed budget amount (positive number)
- `percentage` (required if budgetType is "percentage"): Percentage of income (0-100)
- `period` (required): Budget period - `"monthly"` or `"yearly"`
- `monthlyIncome` (optional, recommended for percentage budgets): Monthly income to calculate amount from percentage

**Note:** You can use any category name, not just the predefined ones. Custom categories are fully supported.

**Response:**
```json
{
  "id": 1,
  "category": "Transport",
  "budgetType": "fixed",
  "amount": 20000.00,
  "percentage": null,
  "period": "monthly",
  "createdAt": "2024-01-10T10:00:00",
  "updatedAt": "2024-01-10T10:00:00"
}
```

**More Examples:**

**10% Budget for Grocery:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Grocery",
    "budgetType": "percentage",
    "percentage": 10,
    "period": "monthly",
    "monthlyIncome": 50000
  }'
```

**₹20,000 Budget for Petrol/Transport:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Transport",
    "budgetType": "fixed",
    "amount": 20000,
    "period": "monthly"
  }'
```

**15% Budget for Food:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Food",
    "budgetType": "percentage",
    "percentage": 15,
    "period": "monthly",
    "monthlyIncome": 60000
  }'
```

**Fixed Budget for Bills:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Bills",
    "budgetType": "fixed",
    "amount": 15000,
    "period": "monthly"
  }'
```

**Yearly Budget for Entertainment:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Entertainment",
    "budgetType": "fixed",
    "amount": 60000,
    "period": "yearly"
  }'
```

**Custom Category - Utilities:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Utilities",
    "budgetType": "fixed",
    "amount": 8000,
    "period": "monthly"
  }'
```

**Custom Category - Education:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Education",
    "budgetType": "percentage",
    "percentage": 5,
    "period": "monthly",
    "monthlyIncome": 50000
  }'
```

**Custom Category - Travel:**
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Travel",
    "budgetType": "fixed",
    "amount": 30000,
    "period": "yearly"
  }'
```

---

### PUT /api/budgets/:id

Update budget

**Update Fixed Amount:**
```bash
curl -X PUT http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25000
  }'
```

**Update Percentage:**
```bash
curl -X PUT http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetType": "percentage",
    "percentage": 12,
    "monthlyIncome": 50000
  }'
```

**Change from Fixed to Percentage:**
```bash
curl -X PUT http://localhost:8080/api/budgets/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetType": "percentage",
    "percentage": 8,
    "monthlyIncome": 50000
  }'
```

**Change Period:**
```bash
curl -X PUT http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "period": "yearly"
  }'
```

**Full Update:**
```bash
curl -X PUT http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Transport",
    "budgetType": "fixed",
    "amount": 25000,
    "period": "monthly"
  }'
```

**Request Body Fields (all optional, only include fields to update):**
- `category`: Budget category
- `budgetType`: Budget type - `"fixed"` or `"percentage"`
- `amount`: Fixed budget amount (required if budgetType is "fixed")
- `percentage`: Percentage of income (required if budgetType is "percentage", must be 0-100)
- `period`: Budget period - `"monthly"` or `"yearly"`
- `monthlyIncome`: Monthly income for percentage calculation (recommended when updating percentage)

**Response:**
```json
{
  "id": 1,
  "category": "Transport",
  "budgetType": "fixed",
  "amount": 25000.00,
  "percentage": null,
  "period": "monthly",
  "createdAt": "2024-01-10T10:00:00",
  "updatedAt": "2024-01-10T12:00:00"
}
```

---

### DELETE /api/budgets/:id

Delete budget

**cURL:**
```bash
curl -X DELETE http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
- Status: `204 No Content`

---

## Budget Types

### Fixed Amount Budget
- Set a specific amount (e.g., ₹20,000)
- Amount remains constant regardless of income changes
- Example: "₹20,000 for petrol per month"

### Percentage Budget
- Set a percentage of monthly income (e.g., 10%)
- Amount automatically calculated based on income
- Example: "10% of income for grocery"
- Requires `monthlyIncome` parameter to calculate the amount

---

## Budget Periods

- `monthly`: Budget resets every month
- `yearly`: Budget resets every year

---

## Categories

### Predefined Categories
The following categories are commonly used:
- `Grocery`
- `Entertainment`
- `Transport`
- `Health Care`
- `Shopping`
- `Food`
- `Bills`
- `Others`

### Custom Categories
**You can create budgets for ANY category name!** The system supports custom categories, so you're not limited to the predefined ones.

**Examples of custom categories:**
- `Utilities` - For electricity, water, gas bills
- `Education` - For school fees, courses, books
- `Travel` - For vacations, trips
- `Insurance` - For health, life, vehicle insurance
- `Investment` - For savings, investments
- `Personal Care` - For grooming, beauty products
- `Subscriptions` - For Netflix, Spotify, etc.
- `Home Maintenance` - For repairs, improvements
- `Pet Care` - For pet food, vet bills
- `Gifts` - For birthdays, celebrations
- Or any other category name you want!

Simply use any category name when creating a budget - the system will accept it.

---

## Complete Example Workflow

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. Create a percentage budget (10% for Grocery)
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Grocery",
    "budgetType": "percentage",
    "percentage": 10,
    "period": "monthly",
    "monthlyIncome": 50000
  }'

# 3. Create a fixed budget (₹20,000 for Transport)
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Transport",
    "budgetType": "fixed",
    "amount": 20000,
    "period": "monthly"
  }'

# 4. Get all budgets
curl -X GET http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 5. Update budget amount
curl -X PUT http://localhost:8080/api/budgets/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25000
  }'

# 6. Delete budget
curl -X DELETE http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: category, budgetType, period"
}
```

```json
{
  "error": "Percentage must be between 0 and 100"
}
```

```json
{
  "error": "Amount must be greater than 0"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Budget not found"
}
```

### 409 Conflict
```json
{
  "error": "Budget already exists for this category and period"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error creating budget",
  "message": "Detailed error message"
}
```

---

## Notes

- All endpoints require authentication via Bearer token
- Only one budget per category per period is allowed (e.g., one monthly budget for Grocery)
- For percentage budgets, provide `monthlyIncome` to calculate the amount
- When updating a budget type from "fixed" to "percentage", include `monthlyIncome` in the request
- Budget amounts are stored as numbers (floats)
- Percentages are stored as numbers (0-100)
- Timestamps (`createdAt`, `updatedAt`) are automatically managed by the server
- Budget IDs are auto-generated sequential integers
- The `amount` field is automatically calculated for percentage budgets based on `monthlyIncome`

---

## Windows Command Prompt Examples

For Windows users, use double quotes and escape inner quotes:

**Create Fixed Budget:**
```cmd
curl -X POST http://localhost:8080/api/budgets ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"category\": \"Transport\", \"budgetType\": \"fixed\", \"amount\": 20000, \"period\": \"monthly\"}"
```

**Create Percentage Budget:**
```cmd
curl -X POST http://localhost:8080/api/budgets ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"category\": \"Grocery\", \"budgetType\": \"percentage\", \"percentage\": 10, \"period\": \"monthly\", \"monthlyIncome\": 50000}"
```

Or use a JSON file:

**budget.json:**
```json
{
  "category": "Transport",
  "budgetType": "fixed",
  "amount": 20000,
  "period": "monthly"
}
```

```cmd
curl -X POST http://localhost:8080/api/budgets ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d @budget.json
```

---

## Practical Examples

### Example 1: Set 10% Budget for Grocery
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Grocery",
    "budgetType": "percentage",
    "percentage": 10,
    "period": "monthly",
    "monthlyIncome": 50000
  }'
```

**Result:** Creates a budget of ₹5,000 (10% of ₹50,000) for Grocery per month.

---

### Example 2: Set ₹20,000 Budget for Petrol/Transport
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Transport",
    "budgetType": "fixed",
    "amount": 20000,
    "period": "monthly"
  }'
```

**Result:** Creates a fixed budget of ₹20,000 for Transport per month.

---

### Example 3: Set Multiple Budgets
```bash
# Grocery - 10%
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "Grocery", "budgetType": "percentage", "percentage": 10, "period": "monthly", "monthlyIncome": 50000}'

# Transport - ₹20,000
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "Transport", "budgetType": "fixed", "amount": 20000, "period": "monthly"}'

# Food - 15%
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "Food", "budgetType": "percentage", "percentage": 15, "period": "monthly", "monthlyIncome": 50000}'

# Bills - ₹15,000
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "Bills", "budgetType": "fixed", "amount": 15000, "period": "monthly"}'
```

---

### Example 4: Update Budget When Income Changes
```bash
# If monthly income changes from ₹50,000 to ₹60,000, update percentage budgets
curl -X PUT http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "percentage": 10,
    "monthlyIncome": 60000
  }'
```

**Result:** Budget amount automatically recalculates to ₹6,000 (10% of ₹60,000).

---

### Example 5: Change Budget Type
```bash
# Change from fixed to percentage
curl -X PUT http://localhost:8080/api/budgets/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetType": "percentage",
    "percentage": 8,
    "monthlyIncome": 50000
  }'
```

---

### Example 6: Get Budget and Check Progress
```bash
# Get all budgets
curl -X GET http://localhost:8080/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Get specific budget
curl -X GET http://localhost:8080/api/budgets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Then compare with expenses to see if you're within budget.

---

## Integration with Expenses

Budgets work with expenses to track spending:

1. **Set Budget:** Create a budget for a category (e.g., Transport - ₹20,000)
2. **Track Expenses:** Add expenses in that category (e.g., Petrol - ₹5,000)
3. **Monitor Progress:** The frontend automatically calculates:
   - Spent amount
   - Remaining budget
   - Percentage used
   - Over-budget warnings

The budget system automatically tracks all expenses in the same category and period to show your progress.

