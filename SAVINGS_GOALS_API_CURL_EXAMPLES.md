# Savings Goals API - cURL Examples

This document provides comprehensive cURL examples for all Savings Goals API endpoints.

## 📋 Table of Contents
- [Authentication](#authentication)
- [Get All Savings Goals](#get-all-savings-goals)
- [Create Savings Goal](#create-savings-goal)
- [Update Savings Goal](#update-savings-goal)
- [Delete Savings Goal](#delete-savings-goal)
- [Complete Examples](#complete-examples)

---

## 🔐 Authentication

All endpoints require authentication. First, login to get your token:

```bash
# Login
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
    "id": 1,
    "email": "your-email@example.com"
  }
}
```

**Save the token:**
```bash
export TOKEN="your-token-here"
```

---

## 📊 Get All Savings Goals

Get all savings goals for the authenticated user.

**Endpoint:** `GET /api/savings-goals`

**Request:**
```bash
curl -X GET http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Vacation Fund",
    "targetAmount": 50000,
    "currentAmount": 15000,
    "targetDate": "2026-12-31",
    "description": "Saving for family vacation to Europe",
    "createdAt": "2026-01-14T10:00:00",
    "updatedAt": "2026-01-14T10:00:00"
  },
  {
    "id": 2,
    "name": "Emergency Fund",
    "targetAmount": 100000,
    "currentAmount": 25000,
    "targetDate": null,
    "description": "6 months of expenses",
    "createdAt": "2026-01-10T08:00:00",
    "updatedAt": "2026-01-14T14:00:00"
  }
]
```

---

## ➕ Create Savings Goal

Create a new savings goal.

**Endpoint:** `POST /api/savings-goals`

### Example 1: Basic Goal (No Target Date)

```bash
curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Car",
    "targetAmount": 500000,
    "currentAmount": 50000,
    "description": "Saving for a new car"
  }'
```

### Example 2: Goal with Target Date

```bash
curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vacation Fund",
    "targetAmount": 50000,
    "currentAmount": 10000,
    "targetDate": "2026-12-31",
    "description": "Family vacation to Europe"
  }'
```

### Example 3: Starting from Zero

```bash
curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Fund",
    "targetAmount": 200000,
    "currentAmount": 0,
    "description": "6 months emergency fund"
  }'
```

### Example 4: Minimal Required Fields

```bash
curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "House Down Payment",
    "targetAmount": 2000000
  }'
```

**Request Body Fields:**
- `name` (required): Goal name (e.g., "Vacation", "Emergency Fund", "New Car")
- `targetAmount` (required): Target amount in ₹ (must be positive number)
- `currentAmount` (optional): Current saved amount (default: 0)
- `targetDate` (optional): Target date in YYYY-MM-DD format (null if no deadline)
- `description` (optional): Additional notes about the goal

**Response:**
```json
{
  "id": 3,
  "name": "Vacation Fund",
  "targetAmount": 50000,
  "currentAmount": 10000,
  "targetDate": "2026-12-31",
  "description": "Family vacation to Europe",
  "createdAt": "2026-01-14T15:30:00",
  "updatedAt": "2026-01-14T15:30:00"
}
```

**Error Responses:**

**400 Bad Request - Missing Required Fields:**
```json
{
  "error": "Missing required fields: name, targetAmount"
}
```

**400 Bad Request - Invalid Amount:**
```json
{
  "error": "Target amount must be a positive number"
}
```

---

## ✏️ Update Savings Goal

Update an existing savings goal.

**Endpoint:** `PUT /api/savings-goals/:id`

### Example 1: Update Current Amount

```bash
curl -X PUT http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAmount": 20000
  }'
```

### Example 2: Update Target Amount

```bash
curl -X PUT http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAmount": 75000
  }'
```

### Example 3: Update Multiple Fields

```bash
curl -X PUT http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "European Vacation",
    "targetAmount": 60000,
    "currentAmount": 25000,
    "targetDate": "2027-06-30",
    "description": "Updated: Extended vacation to 3 weeks"
  }'
```

### Example 4: Remove Target Date

```bash
curl -X PUT http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetDate": null
  }'
```

**Request Body Fields (all optional):**
- `name`: Updated goal name
- `targetAmount`: Updated target amount (must be positive)
- `currentAmount`: Updated current amount (can be 0 or positive)
- `targetDate`: Updated target date (YYYY-MM-DD format, or null)
- `description`: Updated description

**Response:**
```json
{
  "id": 1,
  "name": "European Vacation",
  "targetAmount": 60000,
  "currentAmount": 25000,
  "targetDate": "2027-06-30",
  "description": "Updated: Extended vacation to 3 weeks",
  "createdAt": "2026-01-14T10:00:00",
  "updatedAt": "2026-01-14T16:00:00"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Savings goal not found"
}
```

**400 Bad Request - Invalid Amount:**
```json
{
  "error": "Target amount must be a positive number"
}
```

---

## 🗑️ Delete Savings Goal

Delete a savings goal.

**Endpoint:** `DELETE /api/savings-goals/:id`

**Request:**
```bash
curl -X DELETE http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
- Status: `204 No Content` (success)
- No response body

**Error Response:**

**404 Not Found:**
```json
{
  "error": "Savings goal not found"
}
```

---

## 📝 Complete Examples

### Workflow: Create, Update, and Track a Goal

```bash
# 1. Create a new savings goal
curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Fund",
    "targetAmount": 100000,
    "currentAmount": 0,
    "description": "6 months of expenses"
  }'

# Response: {"id": 1, "name": "Emergency Fund", ...}

# 2. Add money to the goal (update current amount)
curl -X PUT http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAmount": 10000
  }'

# 3. Add more money later
curl -X PUT http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAmount": 25000
  }'

# 4. Check progress (get all goals)
curl -X GET http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN"

# 5. Update target if needed
curl -X PUT http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAmount": 120000
  }'

# 6. Delete goal if no longer needed
curl -X DELETE http://localhost:8080/api/savings-goals/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Multiple Goals Examples

```bash
# Create multiple goals
curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vacation",
    "targetAmount": 50000,
    "currentAmount": 15000,
    "targetDate": "2026-12-31"
  }'

curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Car",
    "targetAmount": 500000,
    "currentAmount": 50000,
    "targetDate": "2027-12-31"
  }'

curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Fund",
    "targetAmount": 200000,
    "currentAmount": 75000
  }'

# Get all goals to see progress
curl -X GET http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 Common Use Cases

### Use Case 1: Quick Add Money to Goal

```bash
# Get current goal
GOAL_ID=1
CURRENT=$(curl -s -X GET http://localhost:8080/api/savings-goals/$GOAL_ID \
  -H "Authorization: Bearer $TOKEN" | jq -r '.currentAmount')

# Add 5000 to current amount
NEW_AMOUNT=$(echo "$CURRENT + 5000" | bc)

curl -X PUT http://localhost:8080/api/savings-goals/$GOAL_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"currentAmount\": $NEW_AMOUNT
  }"
```

### Use Case 2: Check Goal Progress

```bash
# Get all goals and calculate progress
curl -s -X GET http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {
    name: .name,
    progress: ((.currentAmount / .targetAmount) * 100),
    remaining: (.targetAmount - .currentAmount)
  }'
```

### Use Case 3: Find Goals Reaching Target Date Soon

```bash
# Get goals with target dates in next 3 months
curl -s -X GET http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | 
    select(.targetDate != null) | 
    select(.targetDate >= "'$(date -d "+0 days" +%Y-%m-%d)'" and .targetDate <= "'$(date -d "+90 days" +%Y-%m-%d)'")'
```

---

## ⚠️ Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK**: Successful GET or PUT request
- **201 Created**: Successful POST request
- **204 No Content**: Successful DELETE request
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

**Example Error Response:**
```json
{
  "error": "Error message here",
  "message": "Detailed error description"
}
```

---

## 📌 Notes

1. **Authentication Required**: All endpoints require a valid JWT token in the Authorization header
2. **Amount Format**: All amounts are in Indian Rupees (₹) and should be positive numbers
3. **Date Format**: Dates should be in `YYYY-MM-DD` format (ISO 8601 date)
4. **Current Amount**: Can be updated independently to track savings progress
5. **Target Date**: Optional - set to `null` for goals without deadlines
6. **Progress Calculation**: Frontend calculates progress as `(currentAmount / targetAmount) * 100`

---

## 🚀 Quick Start

```bash
# 1. Login and save token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | jq -r '.token')

# 2. Create your first goal
curl -X POST http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Goal",
    "targetAmount": 10000,
    "currentAmount": 0
  }'

# 3. Get all goals
curl -X GET http://localhost:8080/api/savings-goals \
  -H "Authorization: Bearer $TOKEN"
```

---

**Happy Saving! 💰🎯**

