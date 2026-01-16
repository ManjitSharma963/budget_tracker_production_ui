import React, { useState, useEffect } from 'react'
import './AddTaskModal.css'

function AddTaskModal({ isOpen, onClose, onSubmit, editTask = null, existingTasks = [] }) {
  const isEditMode = !!editTask
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    status: 'pending',
    reminderEnabled: false,
    reminderTime: '',
    reminderDate: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState({})

  // Check if two time ranges overlap
  const doTimeRangesOverlap = (start1, end1, start2, end2) => {
    if (!start1 || !end1 || !start2 || !end2) return false;
    
    // Convert time strings (HH:MM) to minutes for comparison
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    // Check if ranges overlap
    return start1Min < end2Min && start2Min < end1Min;
  };

  // Check for time conflicts with existing tasks
  const checkTimeConflict = (date, startTime, endTime) => {
    if (!startTime || !endTime) return null;
    
    // Filter tasks for the same date, excluding the task being edited
    const sameDateTasks = (existingTasks || []).filter(task => {
      if (task.date !== date) return false;
      if (editTask && task.id === editTask.id) return false;
      if (!task.startTime || !task.endTime) return false;
      return true;
    });
    
    // Check for overlaps
    for (const task of sameDateTasks) {
      if (doTimeRangesOverlap(startTime, endTime, task.startTime, task.endTime)) {
        return {
          conflictingTask: task,
          message: `Time slot conflicts with existing task "${task.title}" (${task.startTime} - ${task.endTime})`
        };
      }
    }
    
    return null;
  };

  useEffect(() => {
    if (editTask && isOpen) {
      setFormData({
        title: editTask.title || '',
        subtitle: editTask.subtitle || '',
        date: editTask.date ? editTask.date.split('T')[0] : new Date().toISOString().split('T')[0],
        startTime: editTask.startTime || '',
        endTime: editTask.endTime || '',
        status: editTask.status || 'pending',
        reminderEnabled: editTask.reminderEnabled || false,
        reminderTime: editTask.reminderTime || '',
        reminderDate: editTask.reminderDate ? editTask.reminderDate.split('T')[0] : new Date().toISOString().split('T')[0]
      })
    } else if (!editTask && isOpen) {
      setFormData({
        title: '',
        subtitle: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        status: 'pending',
        reminderEnabled: false,
        reminderTime: '',
        reminderDate: new Date().toISOString().split('T')[0]
      })
    }
    setErrors({})
  }, [editTask, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedFormData = {
      ...formData,
      [name]: value
    }
    setFormData(updatedFormData)
    
    // Clear errors for this field
    const newErrors = { ...errors }
    if (newErrors[name]) {
      delete newErrors[name]
    }
    
    // Real-time conflict checking when both times are provided
    if ((name === 'startTime' || name === 'endTime') && updatedFormData.startTime && updatedFormData.endTime) {
      if (updatedFormData.startTime >= updatedFormData.endTime) {
        newErrors.endTime = 'End time must be after start time'
      } else {
        const conflict = checkTimeConflict(updatedFormData.date, updatedFormData.startTime, updatedFormData.endTime)
        if (conflict) {
          newErrors.startTime = 'Time slot is already booked'
          newErrors.endTime = conflict.message
        }
      }
    }
    
    setErrors(newErrors)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time'
      } else {
        // Check for time conflicts
        const conflict = checkTimeConflict(formData.date, formData.startTime, formData.endTime)
        if (conflict) {
          newErrors.endTime = conflict.message
          newErrors.startTime = 'Time slot is already booked'
        }
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    
    onSubmit({
      ...formData,
      id: editTask?.id
    })
    
    onClose()
  }

  const handleClose = () => {
    setFormData({
      title: '',
      subtitle: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      status: 'pending',
      reminderEnabled: false,
      reminderTime: '',
      reminderDate: new Date().toISOString().split('T')[0]
    })
    setErrors({})
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g., Web Design, Market Research"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subtitle">Subtitle</label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Client project, Company task"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`form-input ${errors.date ? 'error' : ''}`}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`form-input ${errors.startTime ? 'error' : ''}`}
              />
              {errors.startTime && <span className="error-message">{errors.startTime}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`form-input ${errors.endTime ? 'error' : ''}`}
              />
              {errors.endTime && <span className="error-message">{errors.endTime}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isEditMode ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTaskModal

