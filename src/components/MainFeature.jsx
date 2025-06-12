import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isPast, parseISO } from 'date-fns'
import ApperIcon from './ApperIcon'
import taskService from '../services/api/taskService'
import categoryService from '../services/api/categoryService'
import contactService from '../services/api/contactService'

const MainFeature = () => {
const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    assignedContact: ''
  })

  useEffect(() => {
    loadData()
  }, [])

const loadData = async () => {
    setLoading(true)
    try {
      const [tasksData, categoriesData, contactsData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll(),
        contactService.getAll()
      ])
      setTasks(tasksData || [])
      setCategories(categoriesData || [])
      setContacts(contactsData || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    try {
      const taskData = {
        ...newTask,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null
      }
      const createdTask = await taskService.create(taskData)
      setTasks(prev => [...prev, createdTask])
      setNewTask({ title: '', description: '', category: '', priority: 'medium', dueDate: '' })
      setShowTaskForm(false)
      toast.success('Task created successfully!')
    } catch (err) {
      toast.error('Failed to create task')
    }
  }

  const handleUpdateTask = async (e) => {
    e.preventDefault()
    if (!editingTask || !newTask.title.trim()) return

    try {
      const taskData = {
        ...newTask,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null
      }
      const updatedTask = await taskService.update(editingTask.id, taskData)
      setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task))
      setEditingTask(null)
      setNewTask({ title: '', description: '', category: '', priority: 'medium', dueDate: '' })
      toast.success('Task updated successfully!')
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  const handleToggleComplete = async (task) => {
    try {
      const updatedData = { 
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      }
      const updatedTask = await taskService.update(task.id, updatedData)
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t))
      
      if (!task.completed) {
        toast.success('Task completed! 🎉')
      } else {
        toast.info('Task marked as incomplete')
      }
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }

  const startEdit = (task) => {
    setEditingTask(task)
setNewTask({
      title: task.title,
      description: task.description || '',
      category: task.category || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : '',
      assignedContact: task.assignedContact || ''
    })
}

  const cancelEdit = () => {
    setEditingTask(null)
    setShowTaskForm(false)
    setNewTask({ title: '', description: '', category: '', priority: 'medium', dueDate: '', assignedContact: '' })
  }
  const filteredTasks = tasks.filter(task => {
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !task.completed) ||
                         (filterStatus === 'completed' && task.completed)
    return matchesCategory && matchesSearch && matchesStatus
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt)
      default:
        return 0
    }
  })

  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-surface-100 text-surface-800 border-surface-200'
    }
  }

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null
    const date = parseISO(dueDate)
    if (isToday(date)) return 'today'
    if (isPast(date)) return 'overdue'
    return 'upcoming'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Categories Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 sticky top-24">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
            Categories
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ApperIcon name="Grid3x3" size={20} />
                <span>All Tasks</span>
              </div>
              <span className="text-sm font-medium">{tasks.length}</span>
            </button>
            
            {categories.map(category => {
              const categoryTasks = tasks.filter(task => task.category === category.name)
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-primary text-white'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">{categoryTasks.length}</span>
                </button>
              )
            })}
          </div>

          {/* Progress Ring */}
          <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-surface-200 dark:text-surface-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                    className="text-primary transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-surface-900 dark:text-surface-50">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                {completedTasks} of {totalTasks} completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Task Area */}
      <div className="lg:col-span-3">
        {/* Quick Add + Filters */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <ApperIcon name="Plus" size={20} />
              <span>Add Task</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex bg-surface-100 dark:bg-surface-700 rounded-lg p-1">
              {['all', 'active', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-white dark:bg-surface-600 text-primary shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
        </div>

        {/* Task Form Modal */}
        <AnimatePresence>
          {(showTaskForm || editingTask) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={(e) => e.target === e.currentTarget && cancelEdit()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-6">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                
                <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Task title..."
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <textarea
                      placeholder="Description (optional)..."
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
</div>
                    
                    <div>
                      <select
                        value={newTask.assignedContact}
                        onChange={(e) => setNewTask(prev => ({ ...prev, assignedContact: e.target.value }))}
                        className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Assign to contact</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.fullName}>
                            {contact.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
<option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  
                    <div>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-3 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ApperIcon name="CheckSquare" className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
                {searchTerm || filterStatus !== 'all' || selectedCategory !== 'all' 
                  ? 'No tasks found' 
                  : 'No tasks yet'}
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-6">
                {searchTerm || filterStatus !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first task to get started with TaskFlow'}
              </p>
              {!searchTerm && filterStatus === 'all' && selectedCategory === 'all' && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <ApperIcon name="Plus" size={20} />
                  <span>Create First Task</span>
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {sortedTasks.map(task => {
                const dueDateStatus = getDueDateStatus(task.dueDate)
                const categoryData = categories.find(cat => cat.name === task.category)
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    className={`bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 border-l-4 transition-all hover:shadow-lg ${
                      task.completed 
                        ? 'border-green-400 opacity-75' 
                        : dueDateStatus === 'overdue' 
                          ? 'border-red-400' 
                          : dueDateStatus === 'today'
                            ? 'border-yellow-400'
                            : 'border-primary'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center mt-1">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all task-checkbox ${
                            task.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                          }`}
                        >
                          {task.completed && (
                            <ApperIcon name="Check" className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`text-lg font-semibold ${
                            task.completed 
                              ? 'line-through text-surface-500 dark:text-surface-400' 
                              : 'text-surface-900 dark:text-surface-50'
                          }`}>
                            {task.title}
                          </h4>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEdit(task)}
                              className="p-2 text-surface-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <ApperIcon name="Edit2" size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className={`text-sm mb-3 ${
                            task.completed 
                              ? 'text-surface-400' 
                              : 'text-surface-600 dark:text-surface-400'
                          }`}>
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority} priority
                          </span>
                          
                          {task.category && categoryData && (
                            <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: categoryData.color }}
                              />
                              <span>{task.category}</span>
                            </span>
                          )}
                          
                          {task.dueDate && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              dueDateStatus === 'overdue'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : dueDateStatus === 'today'
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {dueDateStatus === 'today' ? 'Due Today' : format(parseISO(task.dueDate), 'MMM dd')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setShowTaskForm(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl hover:shadow-2xl transition-all glassmorphism flex items-center justify-center"
      >
        <ApperIcon name="Plus" size={24} />
      </button>
    </div>
  )
}

export default MainFeature