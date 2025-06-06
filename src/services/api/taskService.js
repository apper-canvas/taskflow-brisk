class TaskService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'task'
  }

  async getAll() {
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'description', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at']
      }
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data || response.data.length === 0) {
        return []
      }
      
      // Map database fields to expected format
      return response.data.map(task => ({
        id: task.Id,
        title: task.title || task.Name,
        description: task.description || '',
        category: task.category || '',
        priority: task.priority || 'medium',
        dueDate: task.due_date || null,
        completed: task.completed || false,
        createdAt: task.created_at || task.CreatedOn,
        completedAt: task.completed_at || null,
        name: task.Name,
        tags: task.Tags,
        owner: task.Owner,
        createdOn: task.CreatedOn,
        createdBy: task.CreatedBy,
        modifiedOn: task.ModifiedOn,
        modifiedBy: task.ModifiedBy
      }))
    } catch (error) {
      console.error("Error fetching tasks:", error)
      throw new Error('Failed to fetch tasks')
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'description', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at']
      }
      const response = await this.apperClient.getRecordById(this.tableName, id, params)
      
      if (!response || !response.data) {
        throw new Error('Task not found')
      }
      
      // Map database fields to expected format
      const task = response.data
      return {
        id: task.Id,
        title: task.title || task.Name,
        description: task.description || '',
        category: task.category || '',
        priority: task.priority || 'medium',
        dueDate: task.due_date || null,
        completed: task.completed || false,
        createdAt: task.created_at || task.CreatedOn,
        completedAt: task.completed_at || null,
        name: task.Name,
        tags: task.Tags,
        owner: task.Owner,
        createdOn: task.CreatedOn,
        createdBy: task.CreatedBy,
        modifiedOn: task.ModifiedOn,
        modifiedBy: task.ModifiedBy
      }
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error)
      throw new Error('Task not found')
    }
  }

  async create(taskData) {
    try {
      // Only include Updateable fields in create operation
      const params = {
        records: [{
          Name: taskData.title,
          Tags: taskData.tags || '',
          Owner: taskData.owner || '',
          title: taskData.title,
          description: taskData.description || '',
          category: taskData.category || '',
          priority: taskData.priority || 'medium',
          due_date: taskData.dueDate || null,
          completed: false,
          created_at: new Date().toISOString(),
          completed_at: null
        }]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results.length > 0) {
        const createdTask = response.results[0]
        if (createdTask.success && createdTask.data) {
          // Map database fields to expected format
          const task = createdTask.data
          return {
            id: task.Id,
            title: task.title || task.Name,
            description: task.description || '',
            category: task.category || '',
            priority: task.priority || 'medium',
            dueDate: task.due_date || null,
            completed: task.completed || false,
            createdAt: task.created_at || task.CreatedOn,
            completedAt: task.completed_at || null
          }
        }
      }
      
      throw new Error('Failed to create task')
    } catch (error) {
      console.error("Error creating task:", error)
      throw new Error('Failed to create task')
    }
  }

  async update(id, updateData) {
    try {
      // Only include Updateable fields in update operation
      const updateRecord = {
        Id: id
      }

      // Map fields from updateData to database fields
      if (updateData.title !== undefined) {
        updateRecord.Name = updateData.title
        updateRecord.title = updateData.title
      }
      if (updateData.description !== undefined) {
        updateRecord.description = updateData.description
      }
      if (updateData.category !== undefined) {
        updateRecord.category = updateData.category
      }
      if (updateData.priority !== undefined) {
        updateRecord.priority = updateData.priority
      }
      if (updateData.dueDate !== undefined) {
        updateRecord.due_date = updateData.dueDate
      }
      if (updateData.completed !== undefined) {
        updateRecord.completed = updateData.completed
      }
      if (updateData.completedAt !== undefined) {
        updateRecord.completed_at = updateData.completedAt
      }
      if (updateData.tags !== undefined) {
        updateRecord.Tags = updateData.tags
      }
      if (updateData.owner !== undefined) {
        updateRecord.Owner = updateData.owner
      }

      const params = {
        records: [updateRecord]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results.length > 0) {
        const updatedTask = response.results[0]
        if (updatedTask.success && updatedTask.data) {
          // Map database fields to expected format
          const task = updatedTask.data
          return {
            id: task.Id,
            title: task.title || task.Name,
            description: task.description || '',
            category: task.category || '',
            priority: task.priority || 'medium',
            dueDate: task.due_date || null,
            completed: task.completed || false,
            createdAt: task.created_at || task.CreatedOn,
            completedAt: task.completed_at || null
          }
        }
      }
      
      throw new Error('Failed to update task')
    } catch (error) {
      console.error("Error updating task:", error)
      throw new Error('Failed to update task')
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results.length > 0) {
        const deletedTask = response.results[0]
        return deletedTask.success
      }
      
      return false
    } catch (error) {
      console.error("Error deleting task:", error)
      throw new Error('Failed to delete task')
    }
  }

  async getByCategory(category) {
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'description', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at'],
        where: [{
          fieldName: "category",
          operator: "ExactMatch",
          values: [category]
        }]
      }
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data || response.data.length === 0) {
        return []
      }
      
      // Map database fields to expected format
      return response.data.map(task => ({
        id: task.Id,
        title: task.title || task.Name,
        description: task.description || '',
        category: task.category || '',
        priority: task.priority || 'medium',
        dueDate: task.due_date || null,
        completed: task.completed || false,
        createdAt: task.created_at || task.CreatedOn,
        completedAt: task.completed_at || null
      }))
    } catch (error) {
      console.error("Error fetching tasks by category:", error)
      throw new Error('Failed to fetch tasks by category')
    }
  }

  async searchTasks(query) {
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'description', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at'],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [{
                fieldName: "title",
                operator: "Contains",
                values: [query]
              }],
              operator: ""
            },
            {
              conditions: [{
                fieldName: "description",
                operator: "Contains",
                values: [query]
              }],
              operator: ""
            }
          ]
        }]
      }
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data || response.data.length === 0) {
        return []
      }
      
      // Map database fields to expected format
      return response.data.map(task => ({
        id: task.Id,
        title: task.title || task.Name,
        description: task.description || '',
        category: task.category || '',
        priority: task.priority || 'medium',
        dueDate: task.due_date || null,
        completed: task.completed || false,
        createdAt: task.created_at || task.CreatedOn,
        completedAt: task.completed_at || null
      }))
    } catch (error) {
      console.error("Error searching tasks:", error)
      throw new Error('Failed to search tasks')
    }
  }
}

export default new TaskService()