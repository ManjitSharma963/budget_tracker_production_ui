// Local Storage service for Tasks
// Used as fallback when API is not available

const STORAGE_KEY = 'expenses_tracker_tasks'

// Get all tasks from local storage
export const getTasksFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return []
  } catch (error) {
    console.error('Error reading tasks from storage:', error)
    return []
  }
}

// Save tasks to local storage
export const saveTasksToStorage = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    return true
  } catch (error) {
    console.error('Error saving tasks to storage:', error)
    return false
  }
}

// Add a new task to local storage
export const addTaskToStorage = (task) => {
  const tasks = getTasksFromStorage()
  const newTask = {
    ...task,
    id: task.id || Date.now(), // Generate ID if not provided
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  tasks.push(newTask)
  saveTasksToStorage(tasks)
  return newTask
}

// Update a task in local storage
export const updateTaskInStorage = (id, taskData) => {
  const tasks = getTasksFromStorage()
  const index = tasks.findIndex(t => t.id === id)
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      ...taskData,
      id: id,
      updatedAt: new Date().toISOString()
    }
    saveTasksToStorage(tasks)
    return tasks[index]
  }
  return null
}

// Delete a task from local storage
export const deleteTaskFromStorage = (id) => {
  const tasks = getTasksFromStorage()
  const filtered = tasks.filter(t => t.id !== id)
  saveTasksToStorage(filtered)
  return true
}

// Get task by ID from local storage
export const getTaskFromStorage = (id) => {
  const tasks = getTasksFromStorage()
  return tasks.find(t => t.id === id) || null
}

