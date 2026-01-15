import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TransactionItem from './TransactionItem'

describe('TransactionItem', () => {
  const mockTransaction = {
    id: 1,
    type: 'expense',
    description: 'Test Expense',
    amount: 100,
    category: 'Basic',
    date: '2024-01-15',
    paymentMode: 'Cash'
  }

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
    onDeleteRequest: vi.fn()
  }

  it('renders transaction details correctly', () => {
    render(
      <TransactionItem
        transaction={mockTransaction}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Test Expense')).toBeInTheDocument()
    expect(screen.getByText('-₹100')).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TransactionItem
        transaction={mockTransaction}
        {...mockHandlers}
      />
    )

    const editButton = screen.getByLabelText(/edit/i)
    fireEvent.click(editButton)

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTransaction)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TransactionItem
        transaction={mockTransaction}
        {...mockHandlers}
      />
    )

    const deleteButton = screen.getByLabelText(/delete/i)
    fireEvent.click(deleteButton)

    expect(mockHandlers.onDeleteRequest || mockHandlers.onDelete).toHaveBeenCalled()
  })

  it('calls onDuplicate when duplicate button is clicked', () => {
    render(
      <TransactionItem
        transaction={mockTransaction}
        {...mockHandlers}
      />
    )

    const duplicateButton = screen.getByLabelText(/duplicate/i)
    fireEvent.click(duplicateButton)

    expect(mockHandlers.onDuplicate).toHaveBeenCalledWith(mockTransaction)
  })

  it('displays income amount correctly', () => {
    const incomeTransaction = {
      ...mockTransaction,
      type: 'income',
      amount: 5000
    }

    render(
      <TransactionItem
        transaction={incomeTransaction}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('₹5,000')).toBeInTheDocument()
  })

  it('has proper ARIA labels', () => {
    render(
      <TransactionItem
        transaction={mockTransaction}
        {...mockHandlers}
      />
    )

    expect(screen.getByRole('article')).toHaveAttribute('aria-label')
    expect(screen.getByLabelText(/edit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/delete/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/duplicate/i)).toBeInTheDocument()
  })
})


