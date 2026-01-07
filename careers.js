// Careers Page JavaScript

// Load jobs from localStorage (managed by admin panel)
function loadJobsFromStorage() {
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    return jobs;
}

// Initialize careers page
document.addEventListener('DOMContentLoaded', function() {
    initializeCareersPage();
});

function initializeCareersPage() {
    setupJobFilters();
    loadAndRenderJobs();
    setupModal();
    animateOnScroll();
    
    // Add refresh button functionality
    const refreshBtn = document.getElementById('refresh-jobs-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('Manual refresh triggered');
            loadAndRenderJobs();
            showNotification('Jobs refreshed successfully!', 'success');
        });
    }
    
    // Listen for storage changes to update jobs in real-time
    window.addEventListener('storage', function(e) {
        if (e.key === 'jobs') {
            console.log('Jobs updated in localStorage, refreshing...');
            loadAndRenderJobs();
        }
    });
    
    // Also listen for custom events from the same window (admin panel)
    window.addEventListener('jobsUpdated', function() {
        console.log('Jobs updated event received, refreshing...');
        loadAndRenderJobs();
    });
}

function loadAndRenderJobs() {
    const jobs = loadJobsFromStorage();
    const jobsGrid = document.getElementById('jobs-grid');
    const noJobsMessage = document.getElementById('no-jobs-message');
    
    console.log('Loading jobs:', jobs); // Debug log
    
    if (jobs.length === 0) {
        if (jobsGrid) jobsGrid.innerHTML = '';
        if (noJobsMessage) noJobsMessage.style.display = 'block';
    } else {
        if (noJobsMessage) noJobsMessage.style.display = 'none';
        renderJobCards(jobs);
    }
}

function renderJobCards(jobs) {
    const jobsGrid = document.getElementById('jobs-grid');
    
    if (!jobsGrid) {
        console.error('Jobs grid element not found');
        return;
    }
    
    jobsGrid.innerHTML = jobs.map(job => `
        <div class="job-card" data-category="${job.category}" onclick="openJobModal('${job.id}')">
            <div class="job-header">
                <div class="job-title">${job.title}</div>
                <div class="job-meta">
                    <span class="job-type">${job.type}</span>
                    <span class="job-location">${job.location}</span>
                </div>
            </div>
            <div class="job-details">
                <p class="job-description">${job.description.substring(0, 150)}...</p>
                <div class="job-tags">
                    <span class="job-level">${job.level}</span>
                    <span class="job-category">${job.category}</span>
                </div>
                <div class="job-salary">${job.salary}</div>
            </div>
            <div class="job-footer">
                <button class="apply-btn" onclick="event.stopPropagation(); applyForJob('${job.id}')">
                    <i data-lucide="send"></i> Apply Now
                </button>
                <div class="job-posted">
                    Posted ${formatRelativeDate(job.createdAt)}
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    console.log('Rendered', jobs.length, 'job cards'); // Debug log
}

function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
}

// Job filtering functionality
function setupJobFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            const jobs = loadJobsFromStorage();
            
            let filteredJobs = jobs;
            if (filterValue !== 'all') {
                filteredJobs = jobs.filter(job => job.category === filterValue);
            }
            
            renderJobCards(filteredJobs);
        });
    });
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('job-modal');
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeJobModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeJobModal();
        }
    });
}

// Open job modal with details
function openJobModal(jobId) {
    const jobs = loadJobsFromStorage();
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) {
        console.error('Job not found:', jobId);
        return;
    }

    const modal = document.getElementById('job-modal');
    const modalTitle = document.getElementById('modal-job-title');
    const modalContent = document.getElementById('modal-job-content');
    
    if (!modal || !modalTitle || !modalContent) {
        console.error('Modal elements not found');
        return;
    }

    modalTitle.textContent = job.title;
    
    modalContent.innerHTML = `
        <div class="job-detail-section">
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <span style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; border-radius: 20px; font-weight: 500;">${job.type}</span>
                <span style="padding: 0.5rem 1rem; background: var(--secondary-color); color: white; border-radius: 20px; font-weight: 500;">${job.location}</span>
                <span style="padding: 0.5rem 1rem; background: var(--accent-color); color: white; border-radius: 20px; font-weight: 500;">${job.level}</span>
            </div>
            <div style="font-size: 1.2rem; font-weight: 600; color: var(--primary-color); margin-bottom: 1rem;">${job.salary}</div>
            <p style="color: var(--text-light); line-height: 1.6; margin-bottom: 2rem;">${job.description}</p>
        </div>

        <div class="job-detail-section">
            <h3>Required Skills</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem;">
                ${job.skills ? job.skills.map(skill => 
                    `<span style="padding: 0.25rem 0.75rem; background: var(--bg-light); border: 1px solid var(--primary-color); color: var(--primary-color); border-radius: 20px; font-size: 0.9rem;">${skill}</span>`
                ).join('') : '<p>No specific skills listed</p>'}
            </div>
        </div>

        <div class="job-detail-section">
            <h3>Job Details</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div>
                    <strong>Category:</strong><br>
                    <span style="color: var(--text-light);">${job.category}</span>
                </div>
                <div>
                    <strong>Experience Level:</strong><br>
                    <span style="color: var(--text-light);">${job.level}</span>
                </div>
                <div>
                    <strong>Employment Type:</strong><br>
                    <span style="color: var(--text-light);">${job.type}</span>
                </div>
                <div>
                    <strong>Location:</strong><br>
                    <span style="color: var(--text-light);">${job.location}</span>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Store current job ID for application
    modal.setAttribute('data-current-job', jobId);
}

// Close job modal
function closeJobModal() {
    const modal = document.getElementById('job-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Apply for job
function applyForJob(jobId) {
    const jobs = loadJobsFromStorage();
    const job = jobs.find(j => j.id === jobId);
    
    if (job) {
        showNotification(`Thank you for your interest in the ${job.title} position! We'll redirect you to our application form.`, 'success');
        
        // Simulate redirect delay
        setTimeout(() => {
            console.log('Redirecting to application form for:', job);
        }, 2000);
    } else {
        showNotification('Job not found. Please try again.', 'error');
    }
    
    // Close modal if open
    closeJobModal();
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
        '.benefit-card, .job-card, .process-step'
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
if (!document.querySelector('#careers-animations')) {
    const style = document.createElement('style');
    style.id = 'careers-animations';
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
    `;
    document.head.appendChild(style);
}