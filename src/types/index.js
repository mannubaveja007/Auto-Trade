// Type definitions for the application
// Using JSDoc comments for TypeScript-like type checking in JavaScript

/**
 * @typedef {Object} Buyer
 * @property {string} id - Unique identifier
 * @property {string} companyName - Company name
 * @property {string} email - Contact email
 * @property {string} phone - Contact phone
 * @property {string} address - Company address
 * @property {string} industry - Industry type
 * @property {string} creditRating - Credit rating
 * @property {Array} paymentHistory - Payment history records
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} Vendor
 * @property {string} id - Unique identifier
 * @property {string} name - Vendor name
 * @property {string} email - Contact email
 * @property {string} phone - Contact phone
 * @property {string} address - Vendor address
 * @property {string[]} categories - Product categories
 * @property {number} rating - Vendor rating (1-5)
 * @property {boolean} verified - Verification status
 * @property {number} minOrderValue - Minimum order value
 * @property {string} paymentTerms - Payment terms
 * @property {string} createdAt - Creation timestamp
 * @property {Quote[]} quotes - Related quotes
 * @property {Order[]} orders - Related orders
 */

/**
 * @typedef {Object} ProcurementRequest
 * @property {string} id - Unique identifier
 * @property {string} buyerId - Related buyer ID
 * @property {string} productName - Product name
 * @property {string} category - Product category
 * @property {number} quantity - Quantity needed
 * @property {string} unit - Unit of measurement
 * @property {Object} specifications - Product specifications
 * @property {string} specifications.description - Description
 * @property {string} deliveryDate - Required delivery date
 * @property {string} deliveryAddress - Delivery address
 * @property {number} maxBudget - Maximum budget
 * @property {'open' | 'in_progress' | 'completed' | 'cancelled'} status - Request status
 * @property {'low' | 'medium' | 'high'} urgency - Urgency level
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {Buyer} buyer - Related buyer
 * @property {Quote[]} quotes - Related quotes
 */

/**
 * @typedef {Object} Quote
 * @property {string} id - Unique identifier
 * @property {string} requestId - Related request ID
 * @property {string} vendorId - Related vendor ID
 * @property {number} unitPrice - Unit price
 * @property {number} totalPrice - Total price
 * @property {string} deliveryDate - Delivery date
 * @property {string} paymentTerms - Payment terms
 * @property {string} notes - Additional notes
 * @property {'pending' | 'accepted' | 'rejected' | 'expired'} status - Quote status
 * @property {string} validUntil - Quote validity date
 * @property {string} createdAt - Creation timestamp
 * @property {Vendor} vendor - Related vendor
 * @property {ProcurementRequest} request - Related request
 * @property {NegotiationMessage[]} negotiations - Negotiation messages
 */

/**
 * @typedef {Object} NegotiationMessage
 * @property {string} id - Unique identifier
 * @property {string} quoteId - Related quote ID
 * @property {'buyer' | 'vendor' | 'ai'} sender - Message sender type
 * @property {string} message - Message content
 * @property {Object} metadata - Additional metadata
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Unique identifier
 * @property {string} requestId - Related request ID
 * @property {string} buyerId - Related buyer ID
 * @property {string} vendorId - Related vendor ID
 * @property {string} quoteId - Related quote ID
 * @property {number} totalAmount - Total order amount
 * @property {'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'} status - Order status
 * @property {string} orderDate - Order date
 * @property {string} expectedDelivery - Expected delivery date
 * @property {string} createdAt - Creation timestamp
 * @property {Buyer} buyer - Related buyer
 * @property {Vendor} vendor - Related vendor
 * @property {ProcurementRequest} request - Related request
 */

/**
 * @typedef {Object} ApiResponse
 * @template T
 * @property {T|null} data - Response data
 * @property {ApiError|null} error - Error information
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} [status] - HTTP status code
 * @property {Error} [original] - Original error object
 */

/**
 * @typedef {Object} LoadingState
 * @property {boolean} loading - Loading status
 * @property {string|null} error - Error message
 */

export {};