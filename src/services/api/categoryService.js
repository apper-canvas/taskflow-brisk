class CategoryService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'category'
  }

  async getAll() {
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'color', 'icon']
      }
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data || response.data.length === 0) {
        return []
      }
      
      // Map database fields to expected format
      return response.data.map(category => ({
        id: category.Id,
        name: category.Name,
        color: category.color || '#3B82F6',
        icon: category.icon || 'Circle',
        tags: category.Tags,
        owner: category.Owner,
        createdOn: category.CreatedOn,
        createdBy: category.CreatedBy,
        modifiedOn: category.ModifiedOn,
        modifiedBy: category.ModifiedBy
      }))
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw new Error('Failed to fetch categories')
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'color', 'icon']
      }
      const response = await this.apperClient.getRecordById(this.tableName, id, params)
      
      if (!response || !response.data) {
        throw new Error('Category not found')
      }
      
      // Map database fields to expected format
      const category = response.data
      return {
        id: category.Id,
        name: category.Name,
        color: category.color || '#3B82F6',
        icon: category.icon || 'Circle',
        tags: category.Tags,
        owner: category.Owner,
        createdOn: category.CreatedOn,
        createdBy: category.CreatedBy,
        modifiedOn: category.ModifiedOn,
        modifiedBy: category.ModifiedBy
      }
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error)
      throw new Error('Category not found')
    }
  }

  async create(categoryData) {
    try {
      // Only include Updateable fields in create operation
      const params = {
        records: [{
          Name: categoryData.name,
          Tags: categoryData.tags || '',
          Owner: categoryData.owner || '',
          color: categoryData.color || '#3B82F6',
          icon: categoryData.icon || 'Circle'
        }]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results.length > 0) {
        const createdCategory = response.results[0]
        if (createdCategory.success && createdCategory.data) {
          // Map database fields to expected format
          const category = createdCategory.data
          return {
            id: category.Id,
            name: category.Name,
            color: category.color || '#3B82F6',
            icon: category.icon || 'Circle',
            tags: category.Tags,
            owner: category.Owner
          }
        }
      }
      
      throw new Error('Failed to create category')
    } catch (error) {
      console.error("Error creating category:", error)
      throw new Error('Failed to create category')
    }
  }

  async update(id, updateData) {
    try {
      // Only include Updateable fields in update operation
      const params = {
        records: [{
          Id: id,
          Name: updateData.name,
          Tags: updateData.tags || '',
          Owner: updateData.owner || '',
          color: updateData.color || '#3B82F6',
          icon: updateData.icon || 'Circle'
        }]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results.length > 0) {
        const updatedCategory = response.results[0]
        if (updatedCategory.success && updatedCategory.data) {
          // Map database fields to expected format
          const category = updatedCategory.data
          return {
            id: category.Id,
            name: category.Name,
            color: category.color || '#3B82F6',
            icon: category.icon || 'Circle',
            tags: category.Tags,
            owner: category.Owner
          }
        }
      }
      
      throw new Error('Failed to update category')
    } catch (error) {
      console.error("Error updating category:", error)
      throw new Error('Failed to update category')
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results && response.results.length > 0) {
        const deletedCategory = response.results[0]
        return deletedCategory.success
      }
      
      return false
    } catch (error) {
      console.error("Error deleting category:", error)
      throw new Error('Failed to delete category')
    }
  }
}

export default new CategoryService()