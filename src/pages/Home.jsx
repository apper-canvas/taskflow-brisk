import { useState, useEffect, useContext } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'
import { AuthContext } from '@/App'
function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.user)
  const { logout } = useContext(AuthContext)

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-surface-100 to-surface-200 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-surface-900/80 border-b border-surface-200/50 dark:border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <ApperIcon name="CheckSquare" className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    Welcome, {user?.firstName || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                <ApperIcon name={darkMode ? "Sun" : "Moon"} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ApperIcon name="CheckSquare" className="w-16 h-16 text-primary" />
          </div>
          
          <h2 className="text-4xl font-bold text-surface-900 dark:text-surface-50 mb-4">
            Welcome to TaskFlow
          </h2>
          <p className="text-xl text-surface-600 dark:text-surface-400 mb-8 max-w-2xl mx-auto">
            Stay productive and manage your tasks efficiently. Organize, prioritize, and track your progress with our intuitive task management system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/tasks"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center space-x-3"
            >
              <ApperIcon name="ArrowRight" size={24} />
              <span>Get Started</span>
            </Link>
            
            <div className="flex items-center space-x-6 text-surface-600 dark:text-surface-400">
              <div className="flex items-center space-x-2">
                <ApperIcon name="CheckCircle" size={20} className="text-green-500" />
                <span>Track Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Filter" size={20} className="text-blue-500" />
                <span>Smart Filtering</span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Bell" size={20} className="text-orange-500" />
                <span>Due Date Alerts</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Plus" className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2">
                Create Tasks
              </h3>
              <p className="text-surface-600 dark:text-surface-400 text-sm">
                Easily add new tasks with titles, descriptions, priorities, and due dates
              </p>
            </div>
            
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Grid3x3" className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2">
                Organize by Category
              </h3>
              <p className="text-surface-600 dark:text-surface-400 text-sm">
                Group your tasks into categories for better organization and focus
              </p>
            </div>
            
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="TrendingUp" className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2">
                Track Progress
              </h3>
              <p className="text-surface-600 dark:text-surface-400 text-sm">
                Monitor your productivity with completion rates and progress tracking
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home