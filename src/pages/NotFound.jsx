import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <ApperIcon name="AlertTriangle" className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-6xl font-bold text-surface-900 dark:text-surface-50 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-surface-700 dark:text-surface-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. Let's get you back to managing your tasks.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="ArrowLeft" className="w-5 h-5" />
          <span>Back to TaskFlow</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFound