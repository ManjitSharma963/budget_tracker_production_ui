// Browser Notification Service

let notificationPermission = null

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    notificationPermission = 'granted'
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    notificationPermission = permission
    return permission === 'granted'
  }

  return false
}

// Show notification
export const showNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported')
    return null
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      ...options
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  } else if (Notification.permission !== 'denied') {
    requestNotificationPermission().then(granted => {
      if (granted) {
        showNotification(title, options)
      }
    })
  }

  return null
}

// Schedule task reminder
export const scheduleTaskReminder = (task) => {
  if (!task.reminderEnabled || !task.reminderDate || !task.reminderTime) {
    return null
  }

  const reminderDateTime = new Date(`${task.reminderDate}T${task.reminderTime}`)
  const now = new Date()
  const delay = reminderDateTime - now

  if (delay <= 0) {
    // Reminder time has passed
    return null
  }

  // Request permission first
  requestNotificationPermission()

  const timeoutId = setTimeout(() => {
    showNotification(`Reminder: ${task.title}`, {
      body: task.subtitle || `Task scheduled for ${task.date}`,
      tag: `task-${task.id}`,
      requireInteraction: true
    })
  }, delay)

  return timeoutId
}

// Check and schedule all task reminders
export const scheduleAllTaskReminders = (tasks) => {
  const timeouts = []
  
  tasks.forEach(task => {
    if (task.reminderEnabled && task.reminderDate && task.reminderTime) {
      const timeoutId = scheduleTaskReminder(task)
      if (timeoutId) {
        timeouts.push({ taskId: task.id, timeoutId })
      }
    }
  })

  return timeouts
}

// Clear all scheduled reminders
export const clearAllReminders = (timeouts) => {
  timeouts.forEach(({ timeoutId }) => {
    clearTimeout(timeoutId)
  })
}

