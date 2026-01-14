# Tasks API - cURL Examples

Base URL: `http://localhost:8080/api`

**Note:** All task endpoints require authentication. You need to login first and use the Bearer token in the Authorization header.

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

## Tasks Endpoints

### GET /api/tasks

Fetch all tasks

**cURL:**
```bash
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Morning Exercise",
    "subtitle": "Gym workout",
    "date": "2024-01-11",
    "startTime": "06:30",
    "endTime": "07:30",
    "status": "pending",
    "createdAt": "2024-01-10T10:00:00",
    "updatedAt": "2024-01-10T10:00:00"
  },
  {
    "id": 2,
    "title": "Team Meeting",
    "subtitle": "Project discussion",
    "date": "2024-01-11",
    "startTime": "09:00",
    "endTime": "10:00",
    "status": "completed",
    "createdAt": "2024-01-10T11:00:00",
    "updatedAt": "2024-01-11T09:30:00"
  }
]
```

---

### GET /api/tasks/:id

Fetch single task by ID

**cURL:**
```bash
curl -X GET http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "id": 1,
  "title": "Morning Exercise",
  "subtitle": "Gym workout",
  "date": "2024-01-11",
  "startTime": "06:30",
  "endTime": "07:30",
  "status": "pending",
  "createdAt": "2024-01-10T10:00:00",
  "updatedAt": "2024-01-10T10:00:00"
}
```

---

### POST /api/tasks

Create new task

**cURL:**
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Exercise",
    "subtitle": "Gym workout",
    "date": "2024-01-11",
    "startTime": "06:30",
    "endTime": "07:30",
    "status": "pending"
  }'
```

**Minimal Request (only title and date required):**
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wake up",
    "date": "2024-01-11",
    "startTime": "05:05"
  }'
```

**Request Body Fields:**
- `title` (required): Task title
- `date` (required): Task date in format `YYYY-MM-DD`
- `subtitle` (optional): Task subtitle/description
- `startTime` (optional): Start time in format `HH:MM` (24-hour format)
- `endTime` (optional): End time in format `HH:MM` (24-hour format)
- `status` (optional): Task status - `pending`, `completed`, `running`, or `rejected` (default: `pending`)

**Response:**
```json
{
  "id": 1,
  "title": "Morning Exercise",
  "subtitle": "Gym workout",
  "date": "2024-01-11",
  "startTime": "06:30",
  "endTime": "07:30",
  "status": "pending",
  "createdAt": "2024-01-10T10:00:00",
  "updatedAt": "2024-01-10T10:00:00"
}
```

**More Examples:**

**Task with sleep time:**
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sleep",
    "date": "2024-01-10",
    "startTime": "22:10"
  }'
```

**Task with wake up time:**
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wake up",
    "subtitle": "Morning alarm",
    "date": "2024-01-11",
    "startTime": "05:05"
  }'
```

**Task with exercise:**
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Exercise",
    "subtitle": "Gym session",
    "date": "2024-01-11",
    "startTime": "08:30",
    "endTime": "09:30",
    "status": "pending"
  }'
```

**Task with meeting:**
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "subtitle": "Project discussion",
    "date": "2024-01-11",
    "startTime": "10:09",
    "endTime": "11:00",
    "status": "pending"
  }'
```

---

### PUT /api/tasks/:id

Update task

**cURL:**
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Morning Exercise",
    "subtitle": "Updated gym workout",
    "date": "2024-01-11",
    "startTime": "07:00",
    "endTime": "08:00",
    "status": "completed"
  }'
```

**Partial Update (only update status):**
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

**Partial Update (only update time):**
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "06:00",
    "endTime": "07:00"
  }'
```

**Request Body Fields (all optional, only include fields to update):**
- `title`: Task title
- `subtitle`: Task subtitle/description
- `date`: Task date in format `YYYY-MM-DD`
- `startTime`: Start time in format `HH:MM`
- `endTime`: End time in format `HH:MM`
- `status`: Task status - `pending`, `completed`, `running`, or `rejected`

**Response:**
```json
{
  "id": 1,
  "title": "Updated Morning Exercise",
  "subtitle": "Updated gym workout",
  "date": "2024-01-11",
  "startTime": "07:00",
  "endTime": "08:00",
  "status": "completed",
  "createdAt": "2024-01-10T10:00:00",
  "updatedAt": "2024-01-11T08:00:00"
}
```

---

### DELETE /api/tasks/:id

Delete task

**cURL:**
```bash
curl -X DELETE http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
- Status: `204 No Content`

---

## Task Status Values

Valid status values:
- `pending` - Task is pending (default)
- `completed` - Task is completed
- `running` - Task is currently running/in progress
- `rejected` - Task was rejected/cancelled

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

# 2. Create a task
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Exercise",
    "subtitle": "Gym workout",
    "date": "2024-01-11",
    "startTime": "06:30",
    "endTime": "07:30",
    "status": "pending"
  }'

# 3. Get all tasks
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 4. Update task status to completed
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'

# 5. Delete task
curl -X DELETE http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: title, date"
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
  "error": "Task not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error creating task",
  "message": "Detailed error message"
}
```

---

## Notes

- All endpoints require authentication via Bearer token
- Date format must be `YYYY-MM-DD` (e.g., `2024-01-11`)
- Time format must be `HH:MM` in 24-hour format (e.g., `22:10`, `05:05`, `09:30`)
- `title` and `date` are required fields
- `subtitle`, `startTime`, `endTime`, and `status` are optional
- Status defaults to `pending` if not provided
- Timestamps (`createdAt`, `updatedAt`) are automatically managed by the server
- Task IDs are auto-generated sequential integers

---

## Windows Command Prompt Examples

For Windows users, use double quotes and escape inner quotes:

```cmd
curl -X POST http://localhost:8080/api/tasks ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"Morning Exercise\", \"date\": \"2024-01-11\", \"startTime\": \"06:30\"}"
```

Or use a JSON file:

**task.json:**
```json
{
  "title": "Morning Exercise",
  "subtitle": "Gym workout",
  "date": "2024-01-11",
  "startTime": "06:30",
  "endTime": "07:30",
  "status": "pending"
}
```

```cmd
curl -X POST http://localhost:8080/api/tasks ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d @task.json
```

