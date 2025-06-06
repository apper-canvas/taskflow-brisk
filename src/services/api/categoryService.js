import categoryData from '../mockData/category.json'

class CategoryService {
  constructor() {
    this.categories = [...categoryData]
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.categories]
  }

  async getById(id) {
    await this.delay()
    const category = this.categories.find(c => c.id === id)
    if (!category) {
      throw new Error('Category not found')
    }
    return { ...category }
  }

  async create(categoryData) {
    await this.delay()
    const newCategory = {
      id: Date.now().toString(),
      name: categoryData.name,
      color: categoryData.color || '#3B82F6',
      icon: categoryData.icon || 'Circle'
    }
    this.categories.push(newCategory)
    return { ...newCategory }
  }

  async update(id, updateData) {
    await this.delay()
    const index = this.categories.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Category not found')
    }
    
    this.categories[index] = {
      ...this.categories[index],
      ...updateData,
      id // Ensure ID doesn't change
    }
    return { ...this.categories[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.categories.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Category not found')
    }
    
    this.categories.splice(index, 1)
    return true
  }
}

export default new CategoryService()