# Ledger API - cURL Request Examples

## Base URL
```
http://localhost:8080/api
```

## Authentication
All requests require an Authorization header with Bearer token:
```
-H "Authorization: Bearer YOUR_TOKEN"
```

---

## 1. Create Ledger Entry (Payment)

```bash
curl -X POST http://localhost:8080/api/ledger/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "party": {
      "id": 1
    },
    "transactionType": "PAYMENT",
    "amount": 20000.00,
    "transactionDate": "2026-01-08",
    "description": "First installment payment",
    "referenceNumber": "PAY-001",
    "paymentMode": "Cash"
  }'
```

## 2. Create Ledger Entry (Purchase)

```bash
curl -X POST http://localhost:8080/api/ledger/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "party": {
      "id": 1
    },
    "transactionType": "PURCHASE",
    "amount": 200000.00,
    "transactionDate": "2026-01-08",
    "description": "Purchase of granite slabs",
    "referenceNumber": "INV-001"
  }'
```

## 3. Create Ledger Entry (Adjustment)

```bash
curl -X POST http://localhost:8080/api/ledger/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "party": {
      "id": 1
    },
    "transactionType": "ADJUSTMENT",
    "amount": 1000.00,
    "transactionDate": "2026-01-10",
    "description": "Discount adjustment",
    "referenceNumber": "ADJ-001"
  }'
```

## 4. Get Single Ledger Entry

```bash
curl -X GET http://localhost:8080/api/ledger/entries/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. Update Ledger Entry

```bash
curl -X PUT http://localhost:8080/api/ledger/entries/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 25000.00,
    "description": "Updated payment amount",
    "referenceNumber": "PAY-001-UPDATED",
    "paymentMode": "UPI"
  }'
```

## 6. Delete Ledger Entry

```bash
curl -X DELETE http://localhost:8080/api/ledger/entries/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 7. Get All Ledger Entries for a Party

```bash
curl -X GET http://localhost:8080/api/ledger/parties/1/entries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 8. Get Party Summary

```bash
curl -X GET http://localhost:8080/api/ledger/parties/1/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 9. Get Party Outstanding Balance

```bash
curl -X GET http://localhost:8080/api/ledger/parties/1/outstanding \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Field Descriptions

### Transaction Types
- `PURCHASE` - Money you owe (increases remaining amount)
- `PAYMENT` - Money you paid (decreases remaining amount)
- `ADJUSTMENT` - Adjustment entry (can be positive or negative)

### Required Fields
- `party.id` - Party ID (integer)
- `transactionType` - One of: PURCHASE, PAYMENT, ADJUSTMENT
- `amount` - Amount (decimal, must be > 0)
- `transactionDate` - Date in format: YYYY-MM-DD

### Optional Fields
- `description` - Transaction description/notes
- `referenceNumber` - Invoice number, receipt number, etc.
- `paymentMode` - Payment mode (Cash, Card, UPI, Bank Transfer, Cheque, Other) - typically used for PAYMENT type

---

## Example: Complete Payment Flow

### Step 1: Create a Party
```bash
curl -X POST http://localhost:8080/api/parties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mohit Granite",
    "phone": "8152864826",
    "openingBalance": 200000.00,
    "notes": "Regular supplier"
  }'
```

### Step 2: Add a Payment Entry
```bash
curl -X POST http://localhost:8080/api/ledger/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "party": {
      "id": 1
    },
    "transactionType": "PAYMENT",
    "amount": 20000.00,
    "transactionDate": "2026-01-08",
    "description": "First installment",
    "paymentMode": "Cash"
  }'
```

### Step 3: Add Another Payment
```bash
curl -X POST http://localhost:8080/api/ledger/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "party": {
      "id": 1
    },
    "transactionType": "PAYMENT",
    "amount": 50000.00,
    "transactionDate": "2026-01-15",
    "description": "Second installment",
    "paymentMode": "UPI"
  }'
```

### Step 4: Check Party Summary
```bash
curl -X GET http://localhost:8080/api/ledger/parties/1/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Check Outstanding Balance
```bash
curl -X GET http://localhost:8080/api/ledger/parties/1/outstanding \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Response Examples

### Create/Update Ledger Entry Response
```json
{
  "id": 1,
  "party": {
    "id": 1,
    "name": "Mohit Granite"
  },
  "transactionType": "PAYMENT",
  "amount": 20000.00,
  "transactionDate": "2026-01-08",
  "description": "First installment payment",
  "referenceNumber": "PAY-001",
  "paymentMode": "Cash",
  "createdAt": "2026-01-08T10:00:00",
  "updatedAt": "2026-01-08T10:00:00"
}
```

### Get Party Entries Response
```json
[
  {
    "id": 1,
    "party": {
      "id": 1,
      "name": "Mohit Granite"
    },
    "transactionType": "PAYMENT",
    "amount": 20000.00,
    "transactionDate": "2026-01-08",
    "description": "First installment payment",
    "referenceNumber": "PAY-001",
    "paymentMode": "Cash",
    "createdAt": "2026-01-08T10:00:00",
    "updatedAt": "2026-01-08T10:00:00"
  },
  {
    "id": 2,
    "party": {
      "id": 1,
      "name": "Mohit Granite"
    },
    "transactionType": "PAYMENT",
    "amount": 50000.00,
    "transactionDate": "2026-01-15",
    "description": "Second installment",
    "paymentMode": "UPI",
    "createdAt": "2026-01-15T10:00:00",
    "updatedAt": "2026-01-15T10:00:00"
  }
]
```

### Party Summary Response
```json
{
  "partyId": 1,
  "openingBalance": 200000.00,
  "totalPurchases": 0.00,
  "totalPayments": 70000.00,
  "outstandingBalance": 130000.00,
  "transactionCount": 2
}
```

### Outstanding Balance Response
```json
{
  "partyId": 1,
  "outstandingBalance": 130000.00
}
```

