// Events Page JavaScript

// Load events from localStorage (managed by admin panel)
function loadEventsFromStorage() {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    return events;
}

// Initialize events page
document.addEventListener('DOMContentLoaded', function() {
    initializeEventsPage();
});

function initializeEventsPage() {
    setupEventFilters();
    loadAndRenderEvents();
    setupModal();
    setupNewsletterForm();
    animateOnScroll();
    
    // Add refresh button functionality
    const refreshBtn = document.getElementById('refresh-events-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('Manual refresh triggered');
            loadAndRenderEvents();
            showNotification('Events refreshed successfully!', 'success');
        });
    }
    
    // Listen for storage changes to update events in real-time
    window.addEventListener('storage', function(e) {
        if (e.key === 'events') {
            console.log('Events updated in localStorage, refreshing...');
            loadAndRenderEvents();
        }
    });
    
    // Also listen for custom events from the same window (admin panel)
    window.addEventListener('eventsUpdated', function() {
        console.log('Events updated event received, refreshing...');
        loadAndRenderEvents();
    });
}

function loadAndRenderEvents() {
    const events = loadEventsFromStorage();
    const eventsGrid = document.getElementById('events-grid');
    const noEventsMessage = document.getElementById('no-events-message');
    
    console.log('Loading events:', events); // Debug log
    
    if (events.length === 0) {
        if (eventsGrid) eventsGrid.innerHTML = '';
        if (noEventsMessage) noEventsMessage.style.display = 'block';
    } else {
        if (noEventsMessage) noEventsMessage.style.display = 'none';
        renderEventCards(events);
    }
}

function renderEventCards(events) {
    const eventsGrid = document.getElementById('events-grid');
    
    // Separate upcoming and past events
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) >= now);
    const pastEvents = events.filter(event => new Date(event.date) < now);
    
    eventsGrid.innerHTML = upcomingEvents.map(event => `
        <div class="event-card ${event.featured ? 'featured' : ''}" data-category="${event.type}" onclick="showEventDetails('${event.id}')">
            <div class="event-header">
                <div class="event-type">${event.type}</div>
                ${event.featured ? '<div class="featured-badge">⭐ Featured</div>' : ''}
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description.substring(0, 120)}...</p>
                <div class="event-meta">
                    <div class="event-date">
                        <i data-lucide="calendar"></i>
                        ${formatEventDate(event.date)}
                    </div>
                    <div class="event-time">
                        <i data-lucide="clock"></i>
                        ${event.time}
                    </div>
                    <div class="event-location">
                        <i data-lucide="map-pin"></i>
                        ${event.location}
                    </div>
                    <div class="event-format">
                        <i data-lucide="monitor"></i>
                        ${event.format}
                    </div>
                </div>
                <div class="event-price">${event.price}</div>
            </div>
            <div class="event-footer">
                <button class="register-btn" onclick="event.stopPropagation(); registerForEvent('${event.id}')">
                    <i data-lucide="calendar-plus"></i>
                    Register Now
                </button>
                <div class="event-duration">${event.duration}</div>
            </div>
        </div>
    `).join('');
    
    // Render past events in separate section
    const pastEventsGrid = document.getElementById('past-events-grid');
    if (pastEventsGrid) {
        if (pastEvents.length === 0) {
            pastEventsGrid.innerHTML = `
                <div class="no-past-events-message">
                    <div class="empty-state">
                        <i data-lucide="video"></i>
                        <h3>No Past Events Available</h3>
                        <p>Event recordings and resources will appear here after we host our first events.</p>
                    </div>
                </div>
            `;
        } else {
            pastEventsGrid.innerHTML = pastEvents.map(event => `
                <div class="past-event-card" onclick="showEventDetails('${event.id}')">
                    <div class="past-event-content">
                        <h4>${event.title}</h4>
                        <p>${event.description.substring(0, 100)}...</p>
                        <div class="past-event-meta">
                            <span>📅 ${formatEventDate(event.date)}</span>
                            <span>👥 ${event.type}</span>
                        </div>
                    </div>
                    <div class="past-event-actions">
                        <button onclick="event.stopPropagation(); watchRecording('${event.id}')">
                            <i data-lucide="play"></i> Watch Recording
                        </button>
                        <button onclick="event.stopPropagation(); downloadResources('${event.id}')">
                            <i data-lucide="download"></i> Resources
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Event filtering functionality
function setupEventFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            const events = loadEventsFromStorage();
            
            let filteredEvents = events;
            if (filterValue !== 'all') {
                filteredEvents = events.filter(event => event.type === filterValue);
            }
            
            renderEventCards(filteredEvents);
        });
    });
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('event-modal');
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEventModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeEventModal();
        }
    });
}

// Show event details modal
function showEventDetails(eventId) {
    const events = loadEventsFromStorage();
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
        console.error('Event not found:', eventId);
        return;
    }

    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-event-title');
    const modalContent = document.getElementById('modal-event-content');
    
    if (!modal || !modalTitle || !modalContent) {
        console.error('Modal elements not found');
        return;
    }

    modalTitle.textContent = event.title;
    
    modalContent.innerHTML = `
        <div class="event-detail-section">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div>
                    <strong>Date:</strong><br>
                    <span style="color: var(--text-light);">${formatEventDate(event.date)}</span>
                </div>
                <div>
                    <strong>Time:</strong><br>
                    <span style="color: var(--text-light);">${event.time}</span>
                </div>
                <div>
                    <strong>Format:</strong><br>
                    <span style="color: var(--text-light);">${event.format}</span>
                </div>
                <div>
                    <strong>Price:</strong><br>
                    <span style="color: var(--primary-color); font-weight: 600;">${event.price}</span>
                </div>
            </div>
            <p style="color: var(--text-light); line-height: 1.6; margin-bottom: 2rem;">${event.description}</p>
        </div>

        <div class="event-detail-section">
            <h3>Event Information</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div>
                    <strong>Type:</strong><br>
                    <span style="color: var(--text-light);">${event.type}</span>
                </div>
                <div>
                    <strong>Duration:</strong><br>
                    <span style="color: var(--text-light);">${event.duration}</span>
                </div>
                <div>
                    <strong>Location:</strong><br>
                    <span style="color: var(--text-light);">${event.location}</span>
                </div>
                <div>
                    <strong>Format:</strong><br>
                    <span style="color: var(--text-light);">${event.format}</span>
                </div>
            </div>
        </div>

        ${event.featured ? `
        <div class="event-detail-section">
            <div style="padding: 1rem; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border-radius: var(--border-radius); text-align: center;">
                <h4 style="margin: 0 0 0.5rem 0;">⭐ Featured Event</h4>
                <p style="margin: 0; opacity: 0.9;">This is a special featured event with exclusive content and networking opportunities.</p>
            </div>
        </div>
        ` : ''}
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Store current event ID for registration
    modal.setAttribute('data-current-event', eventId);
}

// Close event modal
function closeEventModal() {
    const modal = document.getElementById('event-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Proceed to registration from modal
function proceedToRegistration() {
    const modal = document.getElementById('event-modal');
    const eventId = modal.getAttribute('data-current-event');
    
    closeEventModal();
    registerForEvent(eventId);
}

// Register for event
function registerForEvent(eventId) {
    const events = loadEventsFromStorage();
    const event = events.find(e => e.id === eventId);
    
    if (event) {
        showNotification(`Redirecting to registration for ${event.title}...`, 'info');
        
        setTimeout(() => {
            console.log('Registering for event:', eventId, event);
        }, 1500);
    } else {
        showNotification('Event not found. Please try again.', 'error');
    }
}

// Watch recording
function watchRecording(eventId) {
    showNotification('Opening event recording...', 'info');
    
    setTimeout(() => {
        console.log('Watching recording for:', eventId);
    }, 1000);
}

// Download resources
function downloadResources(eventId) {
    showNotification('Preparing download...', 'info');
    
    setTimeout(() => {
        console.log('Downloading resources for:', eventId);
    }, 1000);
}

// Newsletter form setup
function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const newsletterData = Object.fromEntries(formData.entries());
            
            // Show loading state
            const submitBtn = this.querySelector('.subscribe-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Subscribing...';
            submitBtn.disabled = true;
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                console.log('Newsletter subscription:', newsletterData);
                showNotification('Successfully subscribed to event updates!', 'success');
                this.reset();
                
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                showNotification('Thank you for subscribing! You\'ll receive updates soon.', 'success');
                this.reset();
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
}

// Register for event
function registerForEvent(eventId) {
    const event = eventData[eventId];
    
    if (event) {
        showNotification(`Redirecting to registration for ${event.title}...`, 'info');
        
        // Simulate redirect delay
        setTimeout(() => {
            // Here you would redirect to your registration form
            console.log('Registering for event:', eventId, event);
            // window.location.href = `registration.html?event=${eventId}`;
        }, 1500);
    } else {
        // For events not in our data, show generic message
        showNotification('Redirecting to event registration...', 'info');
        setTimeout(() => {
            console.log('Registering for event:', eventId);
        }, 1500);
    }
}

// Show event details modal
function showEventDetails(eventId) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-event-title');
    const modalContent = document.getElementById('modal-event-content');
    
    const event = eventData[eventId];
    
    if (!event) {
        console.error('Event not found:', eventId);
        return;
    }

    modalTitle.textContent = event.title;
    
    modalContent.innerHTML = `
        <div class="event-detail-section">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div>
                    <strong>Date:</strong><br>
                    <span style="color: var(--text-light);">${event.date}</span>
                </div>
                <div>
                    <strong>Time:</strong><br>
                    <span style="color: var(--text-light);">${event.time}</span>
                </div>
                <div>
                    <strong>Format:</strong><br>
                    <span style="color: var(--text-light);">${event.format}</span>
                </div>
                <div>
                    <strong>Price:</strong><br>
                    <span style="color: var(--primary-color); font-weight: 600;">${event.price}</span>
                </div>
            </div>
            <p style="color: var(--text-light); line-height: 1.6; margin-bottom: 2rem;">${event.description}</p>
        </div>

        <div class="event-detail-section">
            <h3>Event Agenda</h3>
            <ul style="list-style: none; padding: 0;">
                ${event.agenda.map(item => `
                    <li style="padding: 0.5rem 0; color: var(--text-light); position: relative; padding-left: 1.5rem;">
                        <span style="position: absolute; left: 0; color: var(--primary-color);">•</span>
                        ${item}
                    </li>
                `).join('')}
            </ul>
        </div>

        ${event.speakers ? `
        <div class="event-detail-section">
            <h3>Featured Speakers</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                ${event.speakers.map(speaker => `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-light); border-radius: var(--border-radius);">
                        <div style="width: 40px; height: 40px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                            ${speaker.avatar}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-dark);">${speaker.name}</div>
                            <div style="font-size: 0.9rem; color: var(--text-light);">${speaker.title}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="event-detail-section">
            <h3>What You'll Get</h3>
            <ul style="list-style: none; padding: 0;">
                ${event.benefits.map(benefit => `
                    <li style="padding: 0.5rem 0; color: var(--text-light); position: relative; padding-left: 1.5rem;">
                        <span style="position: absolute; left: 0; color: var(--primary-color);">✓</span>
                        ${benefit}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Store current event ID for registration
    modal.setAttribute('data-current-event', eventId);
}

// Close event modal
function closeEventModal() {
    const modal = document.getElementById('event-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Proceed to registration from modal
function proceedToRegistration() {
    const modal = document.getElementById('event-modal');
    const eventId = modal.getAttribute('data-current-event');
    
    closeEventModal();
    registerForEvent(eventId);
}

// Watch recording
function watchRecording(eventId) {
    showNotification('Opening event recording...', 'info');
    
    setTimeout(() => {
        // Here you would open the recording
        console.log('Watching recording for:', eventId);
        // window.open(`recordings/${eventId}.html`, '_blank');
    }, 1000);
}

// Download resources
function downloadResources(eventId) {
    showNotification('Preparing download...', 'info');
    
    setTimeout(() => {
        // Here you would trigger the download
        console.log('Downloading resources for:', eventId);
        // window.location.href = `resources/${eventId}.zip`;
    }, 1000);
}

// Animation on scroll
function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.category-card, .event-card, .past-event-card'
    );
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
}

// Notification system (reuse from main script)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    // Initialize icons for notification
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS animations if not already added
if (!document.querySelector('#events-animations')) {
    const style = document.createElement('style');
    style.id = 'events-animations';
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .event-detail-section {
            margin-bottom: 2rem;
        }

        .event-detail-section h3 {
            font-size: 1.3rem;
            color: var(--text-dark);
            margin-bottom: 1rem;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
}