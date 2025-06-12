// Contact Service - ApperClient integration for Contact table
const { ApperClient } = window.ApperSDK

const contactService = {
  // Get all contacts
  async getAll() {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'FirstName', 'LastName', 'Email', 'Phone', 'Address'],
        orderBy: [
          { fieldName: 'LastName', SortType: 'ASC' },
          { fieldName: 'FirstName', SortType: 'ASC' }
        ]
      }

      const response = await apperClient.fetchRecords('Contact', params)

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data?.map(contact => ({
        id: contact.Id,
        firstName: contact.FirstName || '',
        lastName: contact.LastName || '',
        email: contact.Email || '',
        phone: contact.Phone || '',
        address: contact.Address || '',
        name: contact.Name || '',
        tags: contact.Tags || '',
        owner: contact.Owner || '',
        createdOn: contact.CreatedOn,
        createdBy: contact.CreatedBy,
        modifiedOn: contact.ModifiedOn,
        modifiedBy: contact.ModifiedBy,
        fullName: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim()
      })) || []

    } catch (error) {
      console.error('Error fetching contacts:', error)
      throw error
    }
  },

  // Get contact by ID
  async getById(id) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'FirstName', 'LastName', 'Email', 'Phone', 'Address']
      }

      const response = await apperClient.getRecordById('Contact', id, params)

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (!response.data) {
        return null
      }

      const contact = response.data
      return {
        id: contact.Id,
        firstName: contact.FirstName || '',
        lastName: contact.LastName || '',
        email: contact.Email || '',
        phone: contact.Phone || '',
        address: contact.Address || '',
        name: contact.Name || '',
        tags: contact.Tags || '',
        owner: contact.Owner || '',
        createdOn: contact.CreatedOn,
        createdBy: contact.CreatedBy,
        modifiedOn: contact.ModifiedOn,
        modifiedBy: contact.ModifiedBy,
        fullName: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim()
      }

    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error)
      throw error
    }
  },

  // Create new contact
  async create(contactData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Only include Updateable fields for creation
      const createRecord = {
        FirstName: contactData.firstName || '',
        LastName: contactData.lastName || '',
        Email: contactData.email || '',
        Phone: contactData.phone || '',
        Address: contactData.address || ''
      }

      // Include Name field (auto-generated from FirstName + LastName)
      createRecord.Name = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim()

      // Include optional fields if provided
      if (contactData.tags) {
        createRecord.Tags = contactData.tags
      }
      if (contactData.owner) {
        createRecord.Owner = contactData.owner
      }

      const params = {
        records: [createRecord]
      }

      const response = await apperClient.createRecord('Contact', params)

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulContacts = response.results.filter(result => result.success)
        const failedContacts = response.results.filter(result => !result.success)

        if (failedContacts.length > 0) {
          console.error(`Failed to create ${failedContacts.length} contacts:${failedContacts}`)
          
          failedContacts.forEach(contact => {
            contact.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (contact.message) throw new Error(contact.message)
          })
        }

        if (successfulContacts.length > 0) {
          const contact = successfulContacts[0].data
          return {
            id: contact.Id,
            firstName: contact.FirstName || '',
            lastName: contact.LastName || '',
            email: contact.Email || '',
            phone: contact.Phone || '',
            address: contact.Address || '',
            fullName: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim()
          }
        }
      }

      return null

    } catch (error) {
      console.error('Error creating contact:', error)
      throw error
    }
  },

  // Update contact
  async update(id, contactData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Only include Updateable fields for update
      const updateRecord = {
        Id: id,
        FirstName: contactData.firstName || '',
        LastName: contactData.lastName || '',
        Email: contactData.email || '',
        Phone: contactData.phone || '',
        Address: contactData.address || ''
      }

      // Update Name field (auto-generated from FirstName + LastName)
      updateRecord.Name = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim()

      // Include optional fields if provided
      if (contactData.tags !== undefined) {
        updateRecord.Tags = contactData.tags
      }
      if (contactData.owner !== undefined) {
        updateRecord.Owner = contactData.owner
      }

      const params = {
        records: [updateRecord]
      }

      const response = await apperClient.updateRecord('Contact', params)

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} contacts:${failedUpdates}`)
          
          failedUpdates.forEach(contact => {
            contact.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (contact.message) throw new Error(contact.message)
          })
        }

        if (successfulUpdates.length > 0) {
          const contact = successfulUpdates[0].data
          return {
            id: contact.Id,
            firstName: contact.FirstName || '',
            lastName: contact.LastName || '',
            email: contact.Email || '',
            phone: contact.Phone || '',
            address: contact.Address || '',
            fullName: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim()
          }
        }
      }

      return null

    } catch (error) {
      console.error('Error updating contact:', error)
      throw error
    }
  },

  // Delete contact(s)
  async delete(contactIds) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        RecordIds: Array.isArray(contactIds) ? contactIds : [contactIds]
      }

      const response = await apperClient.deleteRecord('Contact', params)

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} contacts:${failedDeletions}`)
          
          failedDeletions.forEach(contact => {
            if (contact.message) throw new Error(contact.message)
          })
        }

        return successfulDeletions.length === params.RecordIds.length
      }

      return false

    } catch (error) {
      console.error('Error deleting contacts:', error)
      throw error
    }
  }
}

export default contactService