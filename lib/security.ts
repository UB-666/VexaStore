// Security utilities for input validation and sanitization

// Email validation with proper regex
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  // RFC 5322 simplified email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  return emailRegex.test(email) && email.length <= 254
}

// UUID validation
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Password strength validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] }
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'letmein123']
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    errors.push('Password is too common or weak')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Sanitize string input (prevent XSS)
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return ''
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength)
  
  // Remove dangerous characters
  sanitized = sanitized
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
  
  return sanitized
}

// Sanitize HTML (basic - for user-generated content)
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return ''
  
  // Strip all HTML tags
  return html.replace(/<[^>]*>/g, '')
}

// Validate numeric input
export function validateNumber(
  value: unknown,
  min?: number,
  max?: number
): { valid: boolean; value?: number; error?: string } {
  const num = Number(value)
  
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid number' }
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, error: `Number must be at least ${min}` }
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, error: `Number must not exceed ${max}` }
  }
  
  return { valid: true, value: num }
}

// Validate phone number (international format)
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  
  // Remove all non-digit characters for length check
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Must have at least 10 digits (phone numbers)
  if (digitsOnly.length < 10) return false
  
  // Allow digits, spaces, hyphens, parentheses, dots, and + for international codes
  const phoneRegex = /^[\d\s\-\(\)\+\.]{10,25}$/
  return phoneRegex.test(phone)
}

// Validate postal code (flexible for international)
export function validatePostalCode(code: string, country?: string): boolean {
  if (!code || typeof code !== 'string') return false
  
  // Trim whitespace
  code = code.trim()
  
  // Very lenient - just check it's not empty and has reasonable length
  if (code.length < 2 || code.length > 15) return false
  
  // Allow alphanumeric, spaces, and hyphens
  const basicRegex = /^[A-Z0-9\s\-]{2,15}$/i
  
  if (country === 'US') {
    // US ZIP code (5 digits or 5+4 format) - more lenient
    return /^\d{5}(-?\d{4})?$/.test(code)
  } else if (country === 'CA') {
    // Canadian postal code - more lenient
    return /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i.test(code)
  } else if (country === 'UK' || country === 'GB') {
    // UK postcode - more lenient
    return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(code)
  }
  
  // For other countries, very lenient
  return basicRegex.test(code)
}

// Validate shipping information
export interface ShippingInfo {
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export function validateShippingInfo(info: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!info || typeof info !== 'object') {
    return { valid: false, errors: ['Invalid shipping information'] }
  }
  
  // Cast to any for property access
  const shippingInfo = info as any
  
  // Required fields with better error messages
  if (!shippingInfo.name || typeof shippingInfo.name !== 'string' || shippingInfo.name.trim().length === 0) {
    errors.push('Full name is required')
  } else if (shippingInfo.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  } else if (shippingInfo.name.length > 100) {
    errors.push('Name must not exceed 100 characters')
  }
  
  // Phone validation
  if (!shippingInfo.phone || typeof shippingInfo.phone !== 'string' || shippingInfo.phone.trim().length === 0) {
    errors.push('Phone number is required')
  } else if (!validatePhoneNumber(shippingInfo.phone)) {
    errors.push('Phone number must be at least 10 digits (e.g., (555) 123-4567 or +1-555-123-4567)')
  }
  
  // Address validation
  if (!shippingInfo.addressLine1 || typeof shippingInfo.addressLine1 !== 'string' || shippingInfo.addressLine1.trim().length === 0) {
    errors.push('Street address is required')
  } else if (shippingInfo.addressLine1.trim().length < 3) {
    errors.push('Address must be at least 3 characters')
  } else if (shippingInfo.addressLine1.length > 200) {
    errors.push('Address line 1 must not exceed 200 characters')
  }
  
  if (shippingInfo.addressLine2 && (typeof shippingInfo.addressLine2 !== 'string' || shippingInfo.addressLine2.length > 200)) {
    errors.push('Address line 2 must not exceed 200 characters')
  }
  
  // City validation
  if (!shippingInfo.city || typeof shippingInfo.city !== 'string' || shippingInfo.city.trim().length === 0) {
    errors.push('City is required')
  } else if (shippingInfo.city.trim().length < 2) {
    errors.push('City must be at least 2 characters')
  } else if (shippingInfo.city.length > 100) {
    errors.push('City must not exceed 100 characters')
  }
  
  // State validation
  if (!shippingInfo.state || typeof shippingInfo.state !== 'string' || shippingInfo.state.trim().length === 0) {
    errors.push('State/Province is required')
  } else if (shippingInfo.state.trim().length < 2) {
    errors.push('State/Province must be at least 2 characters')
  } else if (shippingInfo.state.length > 100) {
    errors.push('State/Province must not exceed 100 characters')
  }
  
  // Postal code validation
  if (!shippingInfo.postalCode || typeof shippingInfo.postalCode !== 'string' || shippingInfo.postalCode.trim().length === 0) {
    errors.push('Postal/ZIP code is required')
  } else if (!validatePostalCode(shippingInfo.postalCode, shippingInfo.country)) {
    errors.push('Postal/ZIP code must be 2-15 characters (e.g., 12345, 12345-6789, A1B 2C3)')
  }
  
  // Country validation - more lenient
  if (!shippingInfo.country || typeof shippingInfo.country !== 'string' || shippingInfo.country.trim().length === 0) {
    errors.push('Country is required')
  } else if (shippingInfo.country.trim().length !== 2) {
    errors.push('Country must be a 2-letter code (e.g., US, CA, GB)')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Validate cart items
export interface CartItem {
  productId: string
  quantity: number
}

export function validateCartItems(items: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!Array.isArray(items)) {
    return { valid: false, errors: ['Cart items must be an array'] }
  }
  
  if (items.length === 0) {
    return { valid: false, errors: ['Cart is empty'] }
  }
  
  if (items.length > 100) {
    return { valid: false, errors: ['Cart cannot contain more than 100 items'] }
  }
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    
    if (!item || typeof item !== 'object') {
      errors.push(`Item ${i + 1}: Invalid item format`)
      continue
    }
    
    if (!validateUUID(item.productId)) {
      errors.push(`Item ${i + 1}: Invalid product ID`)
    }
    
    const qtyValidation = validateNumber(item.quantity, 1, 999)
    if (!qtyValidation.valid) {
      errors.push(`Item ${i + 1}: ${qtyValidation.error}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Rate limiting helper (in-memory for simplicity)
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
  
  if (!entry || now > entry.resetTime) {
    // New window
    const resetTime = now + windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }
  
  // Increment count
  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime }
}

// Environment variable validation
export function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_BASE_URL'
  ]
  
  const missing: string[] = []
  const invalid: string[] = []
  
  for (const varName of required) {
    const value = process.env[varName]
    
    if (!value) {
      missing.push(varName)
      continue
    }
    
    // Basic validation
    if (varName.includes('URL') && !value.startsWith('http')) {
      invalid.push(`${varName}: Must start with http or https`)
    }
    
    if (varName.includes('KEY') && value.length < 20) {
      invalid.push(`${varName}: Appears to be invalid (too short)`)
    }
  }
  
  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid
  }
}
