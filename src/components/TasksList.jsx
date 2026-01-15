import React, { useState, useMemo } from 'react'
import AddButton from './AddButton'
import './TasksList.css'

function TasksList({ tasks, onAddClick, onEdit, onDelete, onToggleStatus }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState('all')
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState(new Set())

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatShortDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric'
    })
  }

  const formatWeekday = (date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short'
    }).charAt(0).toUpperCase()
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes || '00'} ${ampm}`
  }

  const formatTime24 = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    return `${hours.padStart(2, '0')}:${minutes || '00'}`
  }

  // Calculate duration between start and end time
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return null
    
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    
    const durationMinutes = endTotalMinutes - startTotalMinutes
    
    if (durationMinutes <= 0) return null
    
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    
    if (hours > 0 && minutes > 0) {
      return `${hours} hr ${minutes} min${minutes !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`
    } else {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`
    }
  }

  // Toggle task expansion
  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  // Get task icon and color based on category or status
  const getTaskIcon = (task) => {
    const status = task.status?.toLowerCase() || 'pending'
    const title = task.title?.toLowerCase() || ''
    const subtitle = task.subtitle?.toLowerCase() || ''
    const combined = `${title} ${subtitle}`.toLowerCase()

    // Check for specific keywords in title/subtitle
    if (combined.includes('sleep') || combined.includes('bed') || combined.includes('night')) {
      return { icon: '🌙', color: '#3b82f6' } // Blue for sleep
    }
    if (combined.includes('wake') || combined.includes('morning') || combined.includes('sunrise') || combined.includes('alarm')) {
      return { icon: '🌅', color: '#fbbf24' } // Yellow for wake
    }
    if (combined.includes('exercise') || combined.includes('gym') || combined.includes('workout') || combined.includes('fitness')) {
      return { icon: '🏋️', color: '#6b7280' } // Grey for exercise
    }
    if (combined.includes('walk') || combined.includes('run') || combined.includes('jog')) {
      return { icon: '🚶', color: '#14b8a6' } // Teal for walking
    }
    if (combined.includes('meeting') || combined.includes('call') || combined.includes('chat')) {
      return { icon: '💬', color: '#84cc16' } // Lime green for chat
    }
    if (combined.includes('sun') || combined.includes('light')) {
      return { icon: '☀️', color: '#ef4444' } // Red for sun
    }
    if (combined.includes('snow') || combined.includes('cold') || combined.includes('winter')) {
      return { icon: '❄️', color: '#60a5fa' } // Light blue for snow
    }
    
    // Default based on status
    if (status === 'completed') {
      return { icon: '✓', color: '#14b8a6' } // Teal for completed
    }
    if (status === 'running') {
      return { icon: '●', color: '#a855f7' } // Purple for running
    }
    if (status === 'rejected') {
      return { icon: '✗', color: '#ef4444' } // Red for rejected
    }
    
    // Default
    return { icon: '○', color: '#6b7280' } // Grey for pending
  }

  // Get all dates for the month of the selected date
  const getMonthDates = () => {
    const dates = []
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1)
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      dates.push(date)
    }
    
    return dates
  }

  const monthDates = useMemo(() => getMonthDates(), [selectedDate])

  // Filter tasks by selected date and status
  const filteredTasks = useMemo(() => {
    // Format selected date in local timezone (YYYY-MM-DD)
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const selectedDateStr = `${year}-${month}-${day}`
    
    let filtered = tasks.filter(task => {
      if (!task.date) return false
      // Extract date part (handle both "2026-01-14" and "2026-01-14T..." formats)
      const taskDate = task.date.split('T')[0]
      return taskDate === selectedDateStr
    })

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => {
        const status = task.status?.toLowerCase() || 'pending'
        return status === filterStatus.toLowerCase()
      })
    }

    // Sort by start time
    return filtered.sort((a, b) => {
      const timeA = a.startTime || '00:00'
      const timeB = b.startTime || '00:00'
      return timeA.localeCompare(timeB)
    })
  }, [tasks, selectedDate, filterStatus])

  // Check if a date has tasks
  const hasTasksForDate = (date) => {
    // Format date in local timezone (YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return tasks.some(task => {
      if (!task.date) return false
      return task.date.split('T')[0] === dateStr
    })
  }

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || 'pending'
    switch(statusLower) {
      case 'completed':
        return '✓'
      case 'running':
        return '●'
      case 'rejected':
        return '✗'
      default:
        return '○'
    }
  }

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || 'pending'
    switch(statusLower) {
      case 'completed':
        return '#14b8a6' // teal
      case 'running':
        return '#a855f7' // purple
      case 'rejected':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Month and year selection handlers
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    // Show 10 years before and 10 years after current year
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i)
    }
    return years
  }

  const handleMonthChange = (monthIndex) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(monthIndex)
    setSelectedDate(newDate)
    setShowMonthYearPicker(false)
  }

  const handleYearChange = (year) => {
    const newDate = new Date(selectedDate)
    newDate.setFullYear(year)
    setSelectedDate(newDate)
    setShowMonthYearPicker(false)
  }

  const handleTodayClick = () => {
    setSelectedDate(new Date())
    setShowMonthYearPicker(false)
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="tasks-list-container schedule-view">
        <div className="schedule-header">
          <div className="header-content">
            <h1>Today's Schedule</h1>
            <p className="header-date">{formatDate(new Date())}</p>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>No tasks scheduled</p>
          <p className="empty-hint">Tap the + button to add your first task</p>
        </div>
        <button className="fab-button" onClick={onAddClick}>
          <span>+</span>
        </button>
      </div>
    )
  }

  return (
    <div className="tasks-list-container schedule-view">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-content">
          <h1>Today's Schedule</h1>
          <p className="header-date">{formatDate(selectedDate)}</p>
        </div>
        <button 
          className="calendar-icon-btn" 
          title="Select Month/Year"
          onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
        >
          📅
        </button>
      </div>

      {/* Month/Year Picker Modal */}
      {showMonthYearPicker && (
        <div className="month-year-picker-overlay" onClick={() => setShowMonthYearPicker(false)}>
          <div className="month-year-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Select Month & Year</h3>
              <button 
                className="picker-close-btn"
                onClick={() => setShowMonthYearPicker(false)}
              >
                ×
              </button>
            </div>
            
            <div className="picker-content">
              <div className="picker-section">
                <h4>Month</h4>
                <div className="month-grid">
                  {months.map((month, index) => {
                    const isSelected = selectedDate.getMonth() === index
                    return (
                      <button
                        key={index}
                        className={`month-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleMonthChange(index)}
                      >
                        {month.substring(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="picker-section">
                <h4>Year</h4>
                <div className="year-list">
                  {getYears().map((year) => {
                    const isSelected = selectedDate.getFullYear() === year
                    return (
                      <button
                        key={year}
                        className={`year-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleYearChange(year)}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="picker-footer">
              <button className="today-btn" onClick={handleTodayClick}>
                Go to Today
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Date Picker */}
      <div className="weekly-date-picker">
        {monthDates.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0]
          const isSelected = date.toDateString() === selectedDate.toDateString()
          const hasTasks = hasTasksForDate(date)
          
          return (
            <button
              key={index}
              className={`week-day-btn ${isSelected ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="weekday-label">{formatWeekday(date)}</span>
              <span className="weekday-date">{formatShortDate(date)}</span>
              {hasTasks && (
                <div className="task-indicators">
                  <span className="indicator-dot" style={{ backgroundColor: '#a855f7' }}></span>
                  <span className="indicator-dot" style={{ backgroundColor: '#14b8a6' }}></span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Timeline View */}
      <div className="timeline-container">
        {filteredTasks.length > 0 ? (
          <div className="timeline-wrapper">
            <div className="timeline-line"></div>
            {filteredTasks.map((task, index) => {
              const taskIcon = getTaskIcon(task)
              const status = task.status || 'Pending'
              const isLast = index === filteredTasks.length - 1
              const duration = calculateDuration(task.startTime, task.endTime)
              const isExpanded = expandedTasks.has(task.id)
              const hasDetails = task.details || task.exercises || task.nutrition

              return (
                <div key={task.id} className="timeline-item">
                  <div className="timeline-time">
                    {formatTime24(task.startTime) || '00:00'}
                  </div>
                  <div className="timeline-content">
                    <div 
                      className="timeline-icon"
                      style={{ backgroundColor: taskIcon.color }}
                      onClick={() => {
                        if (status.toLowerCase() === 'completed') {
                          onToggleStatus && onToggleStatus(task.id, 'pending')
                        } else {
                          onToggleStatus && onToggleStatus(task.id, 'completed')
                        }
                      }}
                      title={status}
                    >
                      {taskIcon.icon}
                    </div>
                    <div className="timeline-task-info">
                      <div className="timeline-task-header">
                        <div className="timeline-task-main">
                          <div className="timeline-task-title">{task.title}</div>
                          {task.subtitle && (
                            <div className="timeline-task-subtitle">{task.subtitle}</div>
                          )}
                        </div>
                        {duration && (
                          <div className="timeline-task-duration">for {duration}</div>
                        )}
                      </div>
                      
                      {/* Expandable details */}
                      {hasDetails && (
                        <div className="timeline-task-details">
                          {isExpanded ? (
                            <div className="timeline-details-content">
                              {task.exercises && Array.isArray(task.exercises) && (
                                <div className="exercise-details">
                                  {task.exercises.map((exercise, idx) => (
                                    <div key={idx} className="exercise-item">
                                      <span className="exercise-name">{exercise.name}</span>
                                      {exercise.reps && (
                                        <span className="exercise-reps">
                                          ({exercise.sets || 1} x {exercise.reps} = {exercise.totalReps || exercise.reps} total)
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {task.nutrition && (
                                <div className="nutrition-details">
                                  <div className="nutrition-calories">{task.nutrition.calories} kcal</div>
                                  <div className="nutrition-macros">
                                    P {task.nutrition.protein}g C {task.nutrition.carbs}g F {task.nutrition.fat}g
                                  </div>
                                </div>
                              )}
                              {task.details && (
                                <div className="task-details-text">{task.details}</div>
                              )}
                            </div>
                          ) : null}
                          <button
                            className="timeline-expand-btn"
                            onClick={() => toggleTaskExpansion(task.id)}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      className="timeline-menu-btn"
                      onClick={() => {
                        const shouldEdit = window.confirm('Edit this task?')
                        if (shouldEdit) {
                          onEdit(task)
                        } else {
                          const shouldDelete = window.confirm('Delete this task?')
                          if (shouldDelete) {
                            onDelete(task.id)
                          }
                        }
                      }}
                      title="More options"
                    >
                      ⋮
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-schedule">
            <p>No tasks for {formatDate(selectedDate)}</p>
            <p className="empty-hint">Tap the + button to add a task</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fab-button" onClick={onAddClick}>
        <span>+</span>
      </button>
    </div>
  )
}

export default TasksList
