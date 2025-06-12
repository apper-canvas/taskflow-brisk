import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import contactService from '@/services/api/contactService'

function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [selectedContacts, setSelectedContacts] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [contactToDelete, setContactToDelete] = useState(null)
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  })

  // Load contacts data
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const contactsData = await contactService.getAll()
      setContacts(contactsData || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission for creating contact
  const handleCreateContact = async (e) => {
    e.preventDefault()
    if (!newContact.firstName.trim() || !newContact.lastName.trim() || !newContact.email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const createdContact = await contactService.create(newContact)
      setContacts(prev => [...prev, createdContact])
      toast.success('Contact created successfully')
      setShowContactForm(false)
      setNewContact({ firstName: '', lastName: '', email: '', phone: '', address: '' })
    } catch (error) {
      toast.error('Failed to create contact: ' + error.message)
    }
  }

  // Handle form submission for updating contact
  const handleUpdateContact = async (e) => {
    e.preventDefault()
    if (!newContact.firstName.trim() || !newContact.lastName.trim() || !newContact.email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const updatedContact = await contactService.update(editingContact.id, newContact)
      setContacts(prev => prev.map(contact => 
        contact.id === editingContact.id ? updatedContact : contact
      ))
      toast.success('Contact updated successfully')
      cancelEdit()
    } catch (error) {
      toast.error('Failed to update contact: ' + error.message)
    }
  }

  // Handle contact deletion
  const handleDeleteContact = async (contactId) => {
    try {
      await contactService.delete(contactId)
      setContacts(prev => prev.filter(contact => contact.id !== contactId))
      toast.success('Contact deleted successfully')
      setShowDeleteConfirm(false)
      setContactToDelete(null)
    } catch (error) {
      toast.error('Failed to delete contact: ' + error.message)
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return

    try {
      await contactService.delete(selectedContacts)
      setContacts(prev => prev.filter(contact => !selectedContacts.includes(contact.id)))
      toast.success(`${selectedContacts.length} contacts deleted successfully`)
      setSelectedContacts([])
    } catch (error) {
      toast.error('Failed to delete contacts: ' + error.message)
    }
  }

  // Start editing a contact
  const startEdit = (contact) => {
    setEditingContact(contact)
    setNewContact({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || '',
      address: contact.address || ''
    })
    setShowContactForm(true)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingContact(null)
    setNewContact({ firstName: '', lastName: '', email: '', phone: '', address: '' })
    setShowContactForm(false)
  }

  // Confirm delete
  const confirmDelete = (contact) => {
    setContactToDelete(contact)
    setShowDeleteConfirm(true)
  }

  // Toggle contact selection
  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase()
    return (
      contact.fullName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchLower))
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-surface-600 dark:text-surface-400">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">
              Contacts
            </h1>
            <p className="text-surface-600 dark:text-surface-400">
              Manage your contacts and assign them to tasks
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            {selectedContacts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <ApperIcon name="Trash2" size={18} />
                <span>Delete Selected ({selectedContacts.length})</span>
              </button>
            )}
            
            <button
              onClick={() => setShowContactForm(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <ApperIcon name="Plus" size={20} />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <ApperIcon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search contacts by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Contacts Grid */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {filteredContacts.length === 0 ? (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
            <ApperIcon name="Users" size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">
              {searchTerm ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by adding your first contact'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowContactForm(true)}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors inline-flex items-center space-x-2"
              >
                <ApperIcon name="Plus" size={20} />
                <span>Add Contact</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-1">
                        {contact.fullName}
                      </h3>
                      <p className="text-surface-600 dark:text-surface-400 text-sm">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(contact)}
                      className="p-2 text-surface-600 dark:text-surface-400 hover:text-primary hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(contact)}
                      className="p-2 text-surface-600 dark:text-surface-400 hover:text-red-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {contact.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Phone" size={14} className="text-surface-400" />
                      <span className="text-surface-600 dark:text-surface-400">{contact.phone}</span>
                    </div>
                  )}
                  
                  {contact.address && (
                    <div className="flex items-start space-x-2 text-sm">
                      <ApperIcon name="MapPin" size={14} className="text-surface-400 mt-0.5" />
                      <span className="text-surface-600 dark:text-surface-400">{contact.address}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Contact Form Modal */}
        <AnimatePresence>
          {showContactForm && (
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
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h3>
                
                <form onSubmit={editingContact ? handleUpdateContact : handleCreateContact} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={newContact.firstName}
                        onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={newContact.lastName}
                        onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Address
                    </label>
                    <textarea
                      value={newContact.address}
                      onChange={(e) => setNewContact(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-surface-200 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
                    >
                      {editingContact ? 'Update Contact' : 'Add Contact'}
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

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && contactToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl p-6 w-full max-w-md"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <ApperIcon name="Trash2" size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2">
                    Delete Contact
                  </h3>
                  
                  <p className="text-surface-600 dark:text-surface-400 mb-6">
                    Are you sure you want to delete <strong>{contactToDelete.fullName}</strong>? 
                    This action cannot be undone.
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDeleteContact(contactToDelete.id)}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setContactToDelete(null)
                      }}
                      className="flex-1 px-4 py-3 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Contacts