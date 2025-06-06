import taskData from '../mockData/task.json'

class TaskService {
  constructor() {
    this.tasks = [...taskData]
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.tasks]
  }

  async getById(id) {
    await this.delay()
    const task = this.tasks.find(t => t.id === id)
    if (!task) {
      throw new Error('Task not found')
    }
    return { ...task }
  }

  async create(taskData) {
    await this.delay()
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category || '',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    }
    this.tasks.push(newTask)
    return { ...newTask }
  }

  async update(id, updateData) {
    await this.delay()
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updateData,
      id // Ensure ID doesn't change
    }
    return { ...this.tasks[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }
    
    this.tasks.splice(index, 1)
    return true
  }

  async getByCategory(category) {
    await this.delay()
    return this.tasks.filter(task => task.category === category).map(task => ({ ...task }))
  }

  async searchTasks(query) {
    await this.delay()
    const lowercaseQuery = query.toLowerCase()
    return this.tasks
      .filter(task => 
        task.title.toLowerCase().includes(lowercaseQuery) ||
        (task.description || '').toLowerCase().includes(lowercaseQuery)
      )
      .map(task => ({ ...task }))
  }
}

export default new TaskService()