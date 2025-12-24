# CodeCentric.AI - API Documentation

## 1. Overview

### 1.1 Current State
The CodeCentric.AI website is currently a **static frontend application** with no backend API. All functionality is handled client-side using vanilla JavaScript. This document outlines the current client-side "API" patterns and provides specifications for future backend API integration.

### 1.2 Client-Side API Patterns
The website uses JavaScript functions that simulate API interactions for:
- Form submissions
- Data processing
- User feedback
- State management

## 2. Current Client-Side Functions

### 2.1 Contact Form API

#### Function: `setupContactForm()`
Handles contact form submission and processing.

**Implementation:**
```javascript
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const contactData = Object.fromEntries(formData.entries());
        
        // Simulate API call
        processContactSubmission(contactData);
    });
}
```

**Input Schema:**
```javascript
{
    "name": "string (required, min: 2 chars)",
    "email": "string (required, valid email)",
    "subject": "string (required, min: 5 chars)",
    "message": "string (required, min: 10 chars)"
}
```

**Response Simulation:**
```javascript
// Success Response
{
    "status": "success",
    "message": "Message sent successfully! We'll respond to you soon.",
    "timestamp": "2024-12-24T10:30:00Z"
}

// Error Response
{
    "status": "error",
    "message": "Please fill in all required fields",
    "errors": {
        "email": "Invalid email format"
    }
}
```

### 2.2 Navigation API

#### Function: `updateActiveNavLink()`
Updates navigation state based on scroll position.

**Implementation:**
```javascript
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}
```

**State Object:**
```javascript
{
    "currentSection": "string (section ID)",
    "scrollPosition": "number (pixels from top)",
    "activeLink": "string (href value)"
}
```

### 2.3 Notification API

#### Function: `showNotification(message, type)`
Displays user feedback notifications.

**Parameters:**
```javascript
{
    "message": "string (required)",
    "type": "string (optional: 'info' | 'success' | 'error')"
}
```

**Implementation:**
```javascript
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
```

### 2.4 Animation API

#### Function: `setupAnimations()`
Manages scroll-based animations using Intersection Observer.

**Configuration:**
```javascript
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};
```

**Animated Elements:**
```javascript
const animatedElements = [
    '.service-card',
    '.staffing-card', 
    '.case-study-card',
    '.process-step'
];
```

## 3. Future Backend API Specifications

### 3.1 Contact Form Endpoint

#### POST `/api/contact`
Submit contact form data.

**Request:**
```http
POST /api/contact
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "AI Implementation Inquiry",
    "message": "I'm interested in your AI implementation services..."
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "message": "Contact form submitted successfully",
    "id": "contact_12345",
    "timestamp": "2024-12-24T10:30:00Z"
}
```

**Error Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": "Invalid email format",
        "message": "Message is too short"
    }
}
```

### 3.2 Newsletter Subscription Endpoint

#### POST `/api/newsletter`
Subscribe to newsletter (future feature).

**Request:**
```http
POST /api/newsletter
Content-Type: application/json

{
    "email": "user@example.com",
    "preferences": ["ai-updates", "case-studies"]
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
    "success": true,
    "message": "Successfully subscribed to newsletter",
    "subscription_id": "sub_67890"
}
```

### 3.3 Service Inquiry Endpoint

#### POST `/api/service-inquiry`
Submit service-specific inquiry (future feature).

**Request:**
```http
POST /api/service-inquiry
Content-Type: application/json

{
    "name": "Jane Smith",
    "email": "jane@company.com",
    "company": "Tech Corp",
    "service": "ai-implementation",
    "budget": "50k-100k",
    "timeline": "3-months",
    "description": "We need AI implementation for our customer service..."
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "message": "Service inquiry submitted successfully",
    "inquiry_id": "inq_54321",
    "estimated_response_time": "24 hours"
}
```

### 3.4 Case Studies Endpoint

#### GET `/api/case-studies`
Retrieve case studies (future dynamic content).

**Request:**
```http
GET /api/case-studies?limit=3&category=ai-implementation
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "data": [
        {
            "id": "case_001",
            "title": "Advanced AI for Enterprise-Level Automation",
            "date": "2024-12-19",
            "category": "ai-implementation",
            "excerpt": "CodeCentric.AI has revealed the launch of advanced AI automation solutions...",
            "read_time": "5 min",
            "url": "/case-studies/enterprise-automation"
        }
    ],
    "total": 15,
    "page": 1,
    "limit": 3
}
```

## 4. Integration Patterns

### 4.1 API Client Setup
Future JavaScript API client implementation:

```javascript
class CodeCentricAPI {
    constructor(baseURL = 'https://api.codecentric.ai') {
        this.baseURL = baseURL;
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Usage
const api = new CodeCentricAPI();
```

### 4.2 Form Integration Update
Updated contact form with real API integration:

```javascript
async function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const contactData = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await api.post('/contact', contactData);
            
            if (response.success) {
                showNotification('Message sent successfully! We\'ll respond to you soon.', 'success');
                this.reset();
            } else {
                showNotification('Failed to send message. Please try again.', 'error');
            }
        } catch (error) {
            showNotification('Network error. Please check your connection.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    });
}
```

## 5. Error Handling

### 5.1 Client-Side Error Handling
```javascript
// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('Network error. Please check your connection.', 'error');
});
```

### 5.2 API Error Codes
Future backend error code specifications:

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## 6. Rate Limiting

### 6.1 Client-Side Rate Limiting
```javascript
class RateLimiter {
    constructor(maxRequests = 5, timeWindow = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }

    canMakeRequest() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            return false;
        }
        
        this.requests.push(now);
        return true;
    }
}

// Usage
const contactFormLimiter = new RateLimiter(3, 300000); // 3 requests per 5 minutes
```

## 7. Analytics Integration

### 7.1 Event Tracking API
Future analytics event tracking:

```javascript
class AnalyticsAPI {
    constructor() {
        this.events = [];
    }

    track(event, properties = {}) {
        const eventData = {
            event,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };

        this.events.push(eventData);
        this.sendEvent(eventData);
    }

    async sendEvent(eventData) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }
}

// Usage
const analytics = new AnalyticsAPI();

// Track form submissions
analytics.track('contact_form_submitted', {
    form_type: 'contact',
    user_type: 'visitor'
});

// Track service interest
analytics.track('service_viewed', {
    service_name: 'AI Implementation',
    section: 'services'
});
```

## 8. Security Considerations

### 8.1 CSRF Protection
Future CSRF token implementation:

```javascript
// Get CSRF token
async function getCSRFToken() {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return data.token;
}

// Include CSRF token in requests
async function makeSecureRequest(endpoint, data) {
    const token = await getCSRFToken();
    
    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify(data)
    });
}
```

### 8.2 Input Sanitization
```javascript
function sanitizeInput(input) {
    // Remove script tags
    input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Escape HTML entities
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
```

## 9. Testing API Functions

### 9.1 Unit Tests for Client Functions
```javascript
// Jest test examples
describe('Contact Form API', () => {
    test('should validate email format', () => {
        const validEmail = 'test@example.com';
        const invalidEmail = 'invalid-email';
        
        expect(validateEmail(validEmail)).toBe(true);
        expect(validateEmail(invalidEmail)).toBe(false);
    });

    test('should sanitize input', () => {
        const maliciousInput = '<script>alert("xss")</script>Hello';
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(sanitized).toBe('Hello');
        expect(sanitized).not.toContain('<script>');
    });
});
```

### 9.2 Integration Tests
```javascript
// Cypress integration tests
describe('API Integration', () => {
    it('should submit contact form successfully', () => {
        cy.intercept('POST', '/api/contact', { 
            success: true, 
            message: 'Message sent successfully' 
        }).as('submitContact');

        cy.visit('/');
        cy.get('#contact-form').within(() => {
            cy.get('input[name="name"]').type('John Doe');
            cy.get('input[name="email"]').type('john@example.com');
            cy.get('input[name="subject"]').type('Test Subject');
            cy.get('textarea[name="message"]').type('Test message');
            cy.get('.submit-btn').click();
        });

        cy.wait('@submitContact');
        cy.contains('Message sent successfully').should('be.visible');
    });
});
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**API Version**: Client-side v1.0 (Backend TBD)  
**Next Review**: March 2025