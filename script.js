// Enhanced Dynamic Website JavaScript

// Global state
let currentStep = 1;
const totalSteps = 2;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    setupNavigation();
    setupAnimations();
    setupForms();
    setupCounters();
    setupScrollEffects();
    setupServiceInteractions();
}

// Navigation Setup
function setupNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll Effects
function setupScrollEffects() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        // Navbar background on scroll
        if (window.scrollY > 100) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        updateActiveNavLink();
    });
}

// Update active navigation link based on scroll position
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

// Animated Counters
function setupCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.7
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Intersection Observer for animations
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.service-card, .about-content, .services-header, .contact-info, .tech-item'
    );
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
}

// Service Card Interactions
function setupServiceInteractions() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        // Add click to enquiry functionality
        const serviceLink = card.querySelector('.service-link');
        serviceLink?.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceType = card.getAttribute('data-service');
            prefillEnquiryForm(serviceType);
            document.getElementById('enquiry').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Tech stack interactions
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('click', () => {
            const tech = item.getAttribute('data-tech');
            showTechInfo(tech);
        });
    });
}

// Show tech information (could be expanded to show modal or tooltip)
function showTechInfo(tech) {
    const techInfo = {
        'Python': 'Advanced AI and machine learning development',
        'TensorFlow': 'Deep learning and neural network frameworks',
        'React': 'Modern frontend development and user interfaces',
        'Node.js': 'Server-side JavaScript and API development'
    };
    
    // Simple alert for now - could be enhanced with modal
    alert(`${tech}: ${techInfo[tech] || 'Cutting-edge technology solution'}`);
}

// Form Handling
function setupForms() {
    setupEnquiryForm();
    setupContactForm();
}

// Enquiry Form Multi-step
function setupEnquiryForm() {
    const enquiryForm = document.getElementById('enquiry-form');
    if (!enquiryForm) return;

    enquiryForm.addEventListener('submit', handleEnquirySubmit);
    updateProgressBar();
}

function nextStep() {
    if (currentStep < totalSteps) {
        // Validate current step
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
            updateProgressBar();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgressBar();
    }
}

function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((stepEl, index) => {
        stepEl.classList.toggle('active', index + 1 === step);
    });
}

function updateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    
    if (progressFill) {
        const progress = (currentStep / totalSteps) * 100;
        progressFill.style.width = `${progress}%`;
    }

    stepIndicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index + 1 <= currentStep);
    });
}

function validateStep(step) {
    const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e2e8f0';
        }
    });

    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
    }

    return isValid;
}

function handleEnquirySubmit(e) {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    const formData = new FormData(e.target);
    const enquiryData = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Submitting...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        console.log('Enquiry Data:', enquiryData);
        showNotification('Thank you! Your enquiry has been submitted successfully. We\'ll get back to you within 24 hours.', 'success');
        
        // Reset form
        e.target.reset();
        currentStep = 1;
        showStep(1);
        updateProgressBar();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 2000);
}

// Contact Form
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const contactData = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            console.log('Contact Data:', contactData);
            showNotification('Message sent successfully! We\'ll respond to you soon.', 'success');
            this.reset();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 1500);
    });
}

// Prefill enquiry form based on service selection
function prefillEnquiryForm(serviceType) {
    const projectTypeSelect = document.querySelector('select[name="projectType"]');
    if (projectTypeSelect) {
        projectTypeSelect.value = serviceType;
    }
}

// Notification System
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

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        }
    `;
    document.head.appendChild(style);

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

// Expose functions to global scope for HTML onclick handlers
window.nextStep = nextStep;
window.prevStep = prevStep;

// Performance optimization - lazy load images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
setupLazyLoading();