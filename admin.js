// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.config = {
            sheetId: localStorage.getItem('sheetId') || '',
            apiKey: localStorage.getItem('apiKey') || ''
        };
        this.contacts = [];
        this.jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
        this.events = JSON.parse(localStorage.getItem('events') || '[]');
        this.websiteContent = JSON.parse(localStorage.getItem('websiteContent') || '{}');
        this.websiteSettings = JSON.parse(localStorage.getItem('websiteSettings') || '{}');
        this.currentEditingJob = null;
        this.currentEditingEvent = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkLoginStatus();
        this.loadConfig();
        this.initializeDefaultContent();
        this.initializeDefaultSettings();
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button - only bind if element exists
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Config form - only bind if element exists
        const configForm = document.getElementById('config-form');
        if (configForm) {
            configForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveConfig();
            });
        }

        // Refresh button - only bind if element exists
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadContacts();
            });
        }
    }

    bindDashboardEvents() {
        // Tab switching
        this.bindTabEvents();
        
        // Job management
        this.bindJobEvents();
        
        // Event management
        this.bindEventEvents();
        
        // Content management
        this.bindContentEvents();
        
        // Settings management
        this.bindSettingsEvents();
    }

    bindTabEvents() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        const quickNavButtons = document.querySelectorAll('.quick-nav-btn');

        // Handle main tab buttons
        if (tabButtons.length > 0) {
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.getAttribute('data-tab');
                    this.switchToTab(targetTab, tabButtons, tabContents, quickNavButtons);
                });
            });
        }

        // Handle quick navigation buttons
        if (quickNavButtons.length > 0) {
            quickNavButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.getAttribute('data-tab');
                    this.switchToTab(targetTab, tabButtons, tabContents, quickNavButtons);
                });
            });
        }
    }

    switchToTab(targetTab, tabButtons, tabContents, quickNavButtons) {
        try {
            // Update active tab button
            if (tabButtons && tabButtons.length > 0) {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                const targetTabBtn = document.querySelector(`[data-tab="${targetTab}"].tab-btn`);
                if (targetTabBtn) {
                    targetTabBtn.classList.add('active');
                }
            }
            
            // Update active quick nav button
            if (quickNavButtons && quickNavButtons.length > 0) {
                quickNavButtons.forEach(btn => btn.classList.remove('active'));
                const targetQuickNavBtn = document.querySelector(`[data-tab="${targetTab}"].quick-nav-btn`);
                if (targetQuickNavBtn) {
                    targetQuickNavBtn.classList.add('active');
                }
            }
            
            // Update active tab content
            if (tabContents && tabContents.length > 0) {
                tabContents.forEach(content => content.classList.remove('active'));
                const targetTabContent = document.getElementById(`${targetTab}-tab`);
                if (targetTabContent) {
                    targetTabContent.classList.add('active');
                }
            }
            
            // Load tab-specific data
            this.loadTabData(targetTab);
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    bindJobEvents() {
        // Add job button
        const addJobBtn = document.getElementById('add-job-btn');
        if (addJobBtn) {
            addJobBtn.addEventListener('click', () => {
                this.openJobModal();
            });
        }

        // Test job button
        const testJobBtn = document.getElementById('test-job-btn');
        if (testJobBtn) {
            testJobBtn.addEventListener('click', () => {
                this.addTestJob();
            });
        }

        // Job form submission
        const jobForm = document.getElementById('job-form');
        if (jobForm) {
            jobForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveJob();
            });
        }
    }

    bindEventEvents() {
        // Add event button
        const addEventBtn = document.getElementById('add-event-btn');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => {
                this.openEventModal();
            });
        }

        // Event form submission
        const eventForm = document.getElementById('event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEvent();
            });
        }
    }

    bindContentEvents() {
        // Edit content buttons
        const editContentBtns = document.querySelectorAll('.edit-content-btn');
        if (editContentBtns.length > 0) {
            editContentBtns.forEach(button => {
                button.addEventListener('click', () => {
                    const section = button.getAttribute('data-section');
                    this.openContentModal(section);
                });
            });
        }

        // Add service button
        const addServiceBtn = document.querySelector('.add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => {
                this.openServiceModal();
            });
        }

        // Content form submission
        const contentForm = document.getElementById('content-form');
        if (contentForm) {
            contentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveContent();
            });
        }

        // Service form submission
        const serviceForm = document.getElementById('service-form');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveService();
            });
        }

        // Preview and publish buttons
        const previewBtn = document.getElementById('preview-changes-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewChanges();
            });
        }

        const publishBtn = document.getElementById('publish-changes-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.publishChanges();
            });
        }
    }

    bindSettingsEvents() {
        // Save settings button
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Auto-save on input change
        const settingsInputs = document.querySelectorAll('#settings-tab input, #settings-tab textarea');
        if (settingsInputs.length > 0) {
            settingsInputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.autoSaveSettings();
                });
            });
        }
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'contacts':
                this.loadContacts();
                break;
            case 'jobs':
                this.renderJobs();
                break;
            case 'events':
                this.renderEvents();
                break;
            case 'content':
                this.loadContentPreviews();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
        this.updateStats();
    }

    initializeDefaultContent() {
        if (Object.keys(this.websiteContent).length === 0) {
            this.websiteContent = {
                hero: {
                    title: 'YOUR CERTIFIED AI EXPERT!',
                    subtitle: 'Unlock your business potential with cutting-edge AI solutions tailored to your needs.',
                    ctaText: 'Book a free consultation',
                    ctaLink: '#contact'
                },
                about: {
                    title: 'Unlocking Excellence Through AI Technology',
                    description: 'Welcome to CodeCentric.AI, where innovation meets expertise. We specialize in transforming businesses through intelligent AI solutions and cutting-edge technology.'
                },
                contact: {
                    email: 'hello@codecentric.ai',
                    phone: '+1 (555) 123-4567',
                    location: 'Indore, India'
                },
                navigation: [
                    { name: 'Home', link: 'index.html' },
                    { name: 'Services', link: 'index.html#services' },
                    { name: 'Careers', link: 'careers.html' },
                    { name: 'Events', link: 'events.html' },
                    { name: 'Contact', link: 'index.html#contact' }
                ],
                footer: {
                    description: 'Transforming businesses through intelligent AI solutions and cutting-edge technology.',
                    socialLinks: {
                        linkedin: '',
                        twitter: '',
                        github: '',
                        instagram: ''
                    }
                }
            };
            localStorage.setItem('websiteContent', JSON.stringify(this.websiteContent));
        }
    }

    initializeDefaultSettings() {
        if (Object.keys(this.websiteSettings).length === 0) {
            this.websiteSettings = {
                general: {
                    siteTitle: 'CodeCentric.AI - AI Development Services',
                    siteDescription: 'Expert AI Implementation Company - CodeCentric.AI',
                    companyName: 'codecentric.ai'
                },
                contact: {
                    email: 'hello@codecentric.ai',
                    phone: '+1 (555) 123-4567',
                    address: 'Indore, India'
                },
                social: {
                    linkedin: '',
                    twitter: '',
                    github: ''
                },
                features: {
                    enableCareers: true,
                    enableEvents: true,
                    enableNewsletter: true,
                    maintenanceMode: false
                },
                analytics: {
                    googleAnalytics: '',
                    facebookPixel: '',
                    enableTracking: true
                },
                performance: {
                    enableCaching: true,
                    lazyLoading: true,
                    cacheDuration: 24
                }
            };
            localStorage.setItem('websiteSettings', JSON.stringify(this.websiteSettings));
        }
    }

    checkLoginStatus() {
        const loginStatus = localStorage.getItem('adminLoggedIn');
        if (loginStatus === 'true') {
            this.showDashboard();
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (In production, use proper authentication)
        const validCredentials = [
            { username: 'admin', password: 'codecentric2024' },
            { username: 'manager', password: 'ai@manager123' }
        ];

        const isValid = validCredentials.some(cred => 
            cred.username === username && cred.password === password
        );

        if (isValid) {
            localStorage.setItem('adminLoggedIn', 'true');
            this.showDashboard();
            this.hideError('login-error');
        } else {
            this.showError('login-error', 'Invalid username or password');
        }
    }

    handleLogout() {
        localStorage.removeItem('adminLoggedIn');
        this.showLogin();
    }

    showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard').classList.add('active');
        this.isLoggedIn = true;
        
        // Bind dashboard events after login
        this.bindDashboardEvents();
        
        this.loadContacts();
        this.renderJobs();
        this.renderEvents();
        this.loadContentPreviews();
        this.loadSettings();
        this.updateStats();
    }

    showLogin() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard').classList.remove('active');
        this.isLoggedIn = false;
    }

    loadConfig() {
        document.getElementById('sheet-id').value = this.config.sheetId;
        document.getElementById('api-key').value = this.config.apiKey;
    }

    saveConfig() {
        const sheetId = document.getElementById('sheet-id').value;
        const apiKey = document.getElementById('api-key').value;

        if (!sheetId || !apiKey) {
            this.showMessage('config-message', 'Please fill in all configuration fields', 'error');
            return;
        }

        this.config.sheetId = sheetId;
        this.config.apiKey = apiKey;

        localStorage.setItem('sheetId', sheetId);
        localStorage.setItem('apiKey', apiKey);

        this.showMessage('config-message', 'Configuration saved successfully!', 'success');
        
        // Test the connection
        this.testGoogleSheetsConnection();
    }

    async testGoogleSheetsConnection() {
        try {
            // First try to access the sheet
            const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.sheetId}?key=${this.config.apiKey}`;
            const testResponse = await fetch(testUrl);
            
            if (!testResponse.ok) {
                const errorData = await testResponse.json();
                console.error('API Error:', errorData);
                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            // Then try to read some data
            const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.sheetId}/values/Sheet1!A1:E10?key=${this.config.apiKey}`;
            const dataResponse = await fetch(dataUrl);

            if (dataResponse.ok) {
                const data = await dataResponse.json();
                console.log('Connection successful, data:', data);
                this.showMessage('config-message', 'Google Sheets connection successful!', 'success');
                this.loadContacts();
            } else {
                const errorData = await dataResponse.json();
                console.error('Data fetch error:', errorData);
                throw new Error(`Data access error: ${errorData.error?.message || 'Cannot read sheet data'}`);
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showMessage('config-message', `Failed to connect: ${error.message}`, 'error');
        }
    }

    async loadContacts() {
        if (!this.config.sheetId || !this.config.apiKey) {
            this.showError('contacts-error', 'Please configure Google Sheets settings first');
            return;
        }

        this.showLoading(true);
        this.hideError('contacts-error');

        try {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.config.sheetId}/values/Sheet1!A:E?key=${this.config.apiKey}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Load contacts error:', errorData);
                
                let errorMessage = 'Failed to load contacts from Google Sheets';
                if (errorData.error) {
                    if (errorData.error.code === 403) {
                        errorMessage = 'Permission denied. Please check if the sheet is publicly accessible and API key is valid.';
                    } else if (errorData.error.code === 404) {
                        errorMessage = 'Sheet not found. Please check the Sheet ID.';
                    } else {
                        errorMessage = `API Error: ${errorData.error.message}`;
                    }
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            this.contacts = this.parseContactsData(data.values || []);
            this.renderContacts();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading contacts:', error);
            this.showError('contacts-error', error.message);
        } finally {
            this.showLoading(false);
        }
    }

    parseContactsData(values) {
        if (values.length <= 1) return []; // No data or only headers
        
        const headers = values[0];
        const contacts = [];

        for (let i = 1; i < values.length; i++) {
            const row = values[i];
            if (row.length >= 5) {
                contacts.push({
                    timestamp: row[0] || '',
                    name: row[1] || '',
                    email: row[2] || '',
                    subject: row[3] || '',
                    message: row[4] || ''
                });
            }
        }

        return contacts.reverse(); // Show newest first
    }

    renderContacts() {
        const tbody = document.getElementById('contacts-tbody');
        tbody.innerHTML = '';

        if (this.contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">No contacts found</td></tr>';
            return;
        }

        this.contacts.forEach(contact => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(contact.timestamp)}</td>
                <td>${this.escapeHtml(contact.name)}</td>
                <td>${this.escapeHtml(contact.email)}</td>
                <td>${this.escapeHtml(contact.subject)}</td>
                <td>${this.truncateText(this.escapeHtml(contact.message), 100)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateStats() {
        try {
            const total = this.contacts.length;
            const today = this.getContactsCount('today');
            const totalJobs = this.jobs.length;
            const totalEvents = this.events.length;

            const totalContactsEl = document.getElementById('total-contacts');
            const todayContactsEl = document.getElementById('today-contacts');
            const totalJobsEl = document.getElementById('total-jobs');
            const totalEventsEl = document.getElementById('total-events');

            if (totalContactsEl) totalContactsEl.textContent = total;
            if (todayContactsEl) todayContactsEl.textContent = today;
            if (totalJobsEl) totalJobsEl.textContent = totalJobs;
            if (totalEventsEl) totalEventsEl.textContent = totalEvents;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    getContactsCount(period) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return this.contacts.filter(contact => {
            const contactDate = new Date(contact.timestamp);
            
            switch (period) {
                case 'today':
                    return contactDate >= startOfDay;
                case 'week':
                    return contactDate >= startOfWeek;
                case 'month':
                    return contactDate >= startOfMonth;
                default:
                    return false;
            }
        }).length;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch (error) {
            return dateString;
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        document.getElementById('contacts-loading').style.display = show ? 'block' : 'none';
        document.getElementById('contacts-table').style.display = show ? 'none' : 'table';
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    hideError(elementId) {
        document.getElementById(elementId).style.display = 'none';
    }

    showMessage(elementId, message, type) {
        const messageElement = document.getElementById(elementId);
        messageElement.textContent = message;
        messageElement.className = type === 'error' ? 'error-message' : 'success-message';
        messageElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

    // Job Management Methods
    openJobModal(job = null) {
        const modal = document.getElementById('job-modal');
        const title = document.getElementById('job-modal-title');
        const form = document.getElementById('job-form');
        
        this.currentEditingJob = job;
        
        if (job) {
            title.textContent = 'Edit Job';
            this.populateJobForm(job);
        } else {
            title.textContent = 'Add New Job';
            form.reset();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeJobModal() {
        const modal = document.getElementById('job-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentEditingJob = null;
    }

    populateJobForm(job) {
        document.getElementById('job-title').value = job.title || '';
        document.getElementById('job-category').value = job.category || '';
        document.getElementById('job-type').value = job.type || '';
        document.getElementById('job-location').value = job.location || '';
        document.getElementById('job-level').value = job.level || '';
        document.getElementById('job-salary').value = job.salary || '';
        document.getElementById('job-description').value = job.description || '';
        document.getElementById('job-skills').value = job.skills ? job.skills.join(', ') : '';
    }

    saveJob() {
        const formData = new FormData(document.getElementById('job-form'));
        const jobData = {
            id: this.currentEditingJob ? this.currentEditingJob.id : Date.now().toString(),
            title: formData.get('title'),
            category: formData.get('category'),
            type: formData.get('type'),
            location: formData.get('location'),
            level: formData.get('level'),
            salary: formData.get('salary'),
            description: formData.get('description'),
            skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : [],
            createdAt: this.currentEditingJob ? this.currentEditingJob.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.currentEditingJob) {
            const index = this.jobs.findIndex(j => j.id === this.currentEditingJob.id);
            if (index !== -1) {
                this.jobs[index] = jobData;
            }
        } else {
            this.jobs.push(jobData);
        }

        localStorage.setItem('jobs', JSON.stringify(this.jobs));
        
        // Dispatch custom event to notify other windows/tabs
        window.dispatchEvent(new CustomEvent('jobsUpdated', { detail: this.jobs }));
        
        this.renderJobs();
        this.updateStats();
        this.closeJobModal();
        
        this.showMessage('config-message', 
            `Job ${this.currentEditingJob ? 'updated' : 'created'} successfully!`, 'success');
            
        console.log('Job saved:', jobData); // Debug log
        console.log('All jobs:', this.jobs); // Debug log
    }

    deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            this.jobs = this.jobs.filter(job => job.id !== jobId);
            localStorage.setItem('jobs', JSON.stringify(this.jobs));
            
            // Dispatch custom event to notify other windows/tabs
            window.dispatchEvent(new CustomEvent('jobsUpdated', { detail: this.jobs }));
            
            this.renderJobs();
            this.updateStats();
            this.showMessage('config-message', 'Job deleted successfully!', 'success');
        }
    }

    renderJobs() {
        const jobsList = document.getElementById('jobs-list');
        
        if (this.jobs.length === 0) {
            jobsList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="briefcase"></i>
                    <h4>No Jobs Posted</h4>
                    <p>Click "Add New Job" to create your first job posting.</p>
                </div>
            `;
        } else {
            jobsList.innerHTML = this.jobs.map(job => `
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-title">${job.title}</div>
                            <div class="item-meta">
                                <span class="meta-tag">${job.category}</span>
                                <span class="meta-tag">${job.type}</span>
                                <span class="meta-tag">${job.location}</span>
                                <span class="meta-tag">${job.level}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="edit-btn" onclick="adminPanel.editJob('${job.id}')">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button class="delete-btn" onclick="adminPanel.deleteJob('${job.id}')">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                    <p style="color: var(--text-light); margin-top: 1rem;">${job.description.substring(0, 150)}...</p>
                    <p style="color: var(--primary-color); font-weight: 600; margin-top: 0.5rem;">${job.salary}</p>
                </div>
            `).join('');
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    editJob(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (job) {
            this.openJobModal(job);
        }
    }

    addTestJob() {
        const testJob = {
            id: Date.now().toString(),
            title: 'Senior AI Engineer',
            category: 'engineering',
            type: 'Full-time',
            location: 'Remote',
            level: 'Senior',
            salary: '$120k - $180k',
            description: 'Lead the development of cutting-edge AI solutions and mentor junior engineers in our growing team. Work with the latest AI technologies and frameworks.',
            skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.jobs.push(testJob);
        localStorage.setItem('jobs', JSON.stringify(this.jobs));
        
        // Dispatch custom event to notify other windows/tabs
        window.dispatchEvent(new CustomEvent('jobsUpdated', { detail: this.jobs }));
        
        this.renderJobs();
        this.updateStats();
        
        this.showMessage('config-message', 'Test job added successfully!', 'success');
        console.log('Test job added:', testJob);
    }

    // Event Management Methods
    openEventModal(event = null) {
        const modal = document.getElementById('event-modal');
        const title = document.getElementById('event-modal-title');
        const form = document.getElementById('event-form');
        
        this.currentEditingEvent = event;
        
        if (event) {
            title.textContent = 'Edit Event';
            this.populateEventForm(event);
        } else {
            title.textContent = 'Add New Event';
            form.reset();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeEventModal() {
        const modal = document.getElementById('event-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentEditingEvent = null;
    }

    populateEventForm(event) {
        document.getElementById('event-title').value = event.title || '';
        document.getElementById('event-type').value = event.type || '';
        document.getElementById('event-date').value = event.date || '';
        document.getElementById('event-time').value = event.time || '';
        document.getElementById('event-duration').value = event.duration || '';
        document.getElementById('event-format').value = event.format || '';
        document.getElementById('event-location').value = event.location || '';
        document.getElementById('event-price').value = event.price || '';
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-featured').checked = event.featured || false;
    }

    saveEvent() {
        const formData = new FormData(document.getElementById('event-form'));
        const eventData = {
            id: this.currentEditingEvent ? this.currentEditingEvent.id : Date.now().toString(),
            title: formData.get('title'),
            type: formData.get('type'),
            date: formData.get('date'),
            time: formData.get('time'),
            duration: formData.get('duration'),
            format: formData.get('format'),
            location: formData.get('location'),
            price: formData.get('price'),
            description: formData.get('description'),
            featured: formData.has('featured'),
            createdAt: this.currentEditingEvent ? this.currentEditingEvent.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.currentEditingEvent) {
            const index = this.events.findIndex(e => e.id === this.currentEditingEvent.id);
            if (index !== -1) {
                this.events[index] = eventData;
            }
        } else {
            this.events.push(eventData);
        }

        localStorage.setItem('events', JSON.stringify(this.events));
        
        // Dispatch custom event to notify other windows/tabs
        window.dispatchEvent(new CustomEvent('eventsUpdated', { detail: this.events }));
        
        this.renderEvents();
        this.updateStats();
        this.closeEventModal();
        
        this.showMessage('config-message', 
            `Event ${this.currentEditingEvent ? 'updated' : 'created'} successfully!`, 'success');
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(event => event.id !== eventId);
            localStorage.setItem('events', JSON.stringify(this.events));
            
            // Dispatch custom event to notify other windows/tabs
            window.dispatchEvent(new CustomEvent('eventsUpdated', { detail: this.events }));
            
            this.renderEvents();
            this.updateStats();
            this.showMessage('config-message', 'Event deleted successfully!', 'success');
        }
    }

    renderEvents() {
        const eventsList = document.getElementById('events-list');
        
        if (this.events.length === 0) {
            eventsList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar"></i>
                    <h4>No Events Scheduled</h4>
                    <p>Click "Add New Event" to create your first event.</p>
                </div>
            `;
        } else {
            eventsList.innerHTML = this.events.map(event => `
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-title">${event.title} ${event.featured ? '⭐' : ''}</div>
                            <div class="item-meta">
                                <span class="meta-tag">${event.type}</span>
                                <span class="meta-tag">${event.format}</span>
                                <span class="meta-tag">${event.price}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="edit-btn" onclick="adminPanel.editEvent('${event.id}')">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button class="delete-btn" onclick="adminPanel.deleteEvent('${event.id}')">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                    <p style="color: var(--text-light); margin-top: 1rem;">${event.description.substring(0, 150)}...</p>
                    <p style="color: var(--primary-color); font-weight: 600; margin-top: 0.5rem;">
                        📅 ${event.date} at ${event.time} | 📍 ${event.location}
                    </p>
                </div>
            `).join('');
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.openEventModal(event);
        }
    }

    // Content Management Methods
    loadContentPreviews() {
        // Update content previews
        document.getElementById('hero-title-preview').textContent = this.websiteContent.hero?.title || 'YOUR CERTIFIED AI EXPERT!';
        document.getElementById('hero-subtitle-preview').textContent = this.websiteContent.hero?.subtitle?.substring(0, 50) + '...' || 'Unlock your business potential...';
        document.getElementById('hero-cta-preview').textContent = this.websiteContent.hero?.ctaText || 'Book a free consultation';
        
        document.getElementById('about-title-preview').textContent = this.websiteContent.about?.title || 'Unlocking Excellence Through AI Technology';
        document.getElementById('about-desc-preview').textContent = this.websiteContent.about?.description?.substring(0, 50) + '...' || 'Welcome to CodeCentric.AI...';
        
        document.getElementById('contact-email-preview').textContent = this.websiteContent.contact?.email || 'hello@codecentric.ai';
        document.getElementById('contact-phone-preview').textContent = this.websiteContent.contact?.phone || '+1 (555) 123-4567';
        document.getElementById('contact-location-preview').textContent = this.websiteContent.contact?.location || 'Indore, India';
        
        document.getElementById('footer-desc-preview').textContent = this.websiteContent.footer?.description?.substring(0, 50) + '...' || 'Transforming businesses...';
        
        // Update navigation preview
        const navPreview = document.getElementById('nav-items-preview');
        if (this.websiteContent.navigation) {
            navPreview.innerHTML = this.websiteContent.navigation.map(item => 
                `<span class="nav-item">${item.name}</span>`
            ).join('');
        }
    }

    openContentModal(section) {
        const modal = document.getElementById('content-modal');
        const title = document.getElementById('content-modal-title');
        const formFields = document.getElementById('content-form-fields');
        
        title.textContent = `Edit ${section.charAt(0).toUpperCase() + section.slice(1)} Section`;
        
        let fieldsHTML = '';
        
        switch(section) {
            case 'hero':
                fieldsHTML = `
                    <div class="form-group">
                        <label for="hero-title">Hero Title</label>
                        <input type="text" id="hero-title" name="title" value="${this.websiteContent.hero?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="hero-subtitle">Hero Subtitle</label>
                        <textarea id="hero-subtitle" name="subtitle" rows="3" required>${this.websiteContent.hero?.subtitle || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="hero-cta-text">CTA Button Text</label>
                        <input type="text" id="hero-cta-text" name="ctaText" value="${this.websiteContent.hero?.ctaText || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="hero-cta-link">CTA Button Link</label>
                        <input type="text" id="hero-cta-link" name="ctaLink" value="${this.websiteContent.hero?.ctaLink || ''}" required>
                    </div>
                `;
                break;
            case 'about':
                fieldsHTML = `
                    <div class="form-group">
                        <label for="about-title">About Title</label>
                        <input type="text" id="about-title" name="title" value="${this.websiteContent.about?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="about-description">About Description</label>
                        <textarea id="about-description" name="description" rows="5" required>${this.websiteContent.about?.description || ''}</textarea>
                    </div>
                `;
                break;
            case 'contact':
                fieldsHTML = `
                    <div class="form-group">
                        <label for="contact-email">Contact Email</label>
                        <input type="email" id="contact-email" name="email" value="${this.websiteContent.contact?.email || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-phone">Contact Phone</label>
                        <input type="tel" id="contact-phone" name="phone" value="${this.websiteContent.contact?.phone || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-location">Location</label>
                        <input type="text" id="contact-location" name="location" value="${this.websiteContent.contact?.location || ''}" required>
                    </div>
                `;
                break;
        }
        
        formFields.innerHTML = fieldsHTML;
        modal.setAttribute('data-section', section);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeContentModal() {
        const modal = document.getElementById('content-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    saveContent() {
        const modal = document.getElementById('content-modal');
        const section = modal.getAttribute('data-section');
        const formData = new FormData(document.getElementById('content-form'));
        
        if (!this.websiteContent[section]) {
            this.websiteContent[section] = {};
        }
        
        for (let [key, value] of formData.entries()) {
            this.websiteContent[section][key] = value;
        }
        
        localStorage.setItem('websiteContent', JSON.stringify(this.websiteContent));
        this.loadContentPreviews();
        this.closeContentModal();
        
        this.showMessage('config-message', `${section.charAt(0).toUpperCase() + section.slice(1)} section updated successfully!`, 'success');
    }

    previewChanges() {
        this.showMessage('config-message', 'Preview functionality would open a preview window with your changes.', 'info');
    }

    publishChanges() {
        this.showMessage('config-message', 'Changes published successfully! Your website has been updated.', 'success');
    }

    // Settings Management Methods
    loadSettings() {
        // Load general settings
        document.getElementById('site-title').value = this.websiteSettings.general?.siteTitle || '';
        document.getElementById('site-description').value = this.websiteSettings.general?.siteDescription || '';
        document.getElementById('company-name').value = this.websiteSettings.general?.companyName || '';
        
        // Load contact settings
        document.getElementById('contact-email').value = this.websiteSettings.contact?.email || '';
        document.getElementById('contact-phone').value = this.websiteSettings.contact?.phone || '';
        document.getElementById('contact-address').value = this.websiteSettings.contact?.address || '';
        
        // Load social media settings
        document.getElementById('linkedin-url').value = this.websiteSettings.social?.linkedin || '';
        document.getElementById('twitter-url').value = this.websiteSettings.social?.twitter || '';
        document.getElementById('github-url').value = this.websiteSettings.social?.github || '';
        
        // Load feature toggles
        document.getElementById('enable-careers').checked = this.websiteSettings.features?.enableCareers || false;
        document.getElementById('enable-events').checked = this.websiteSettings.features?.enableEvents || false;
        document.getElementById('enable-newsletter').checked = this.websiteSettings.features?.enableNewsletter || false;
        document.getElementById('maintenance-mode').checked = this.websiteSettings.features?.maintenanceMode || false;
        
        // Load analytics settings
        document.getElementById('google-analytics').value = this.websiteSettings.analytics?.googleAnalytics || '';
        document.getElementById('facebook-pixel').value = this.websiteSettings.analytics?.facebookPixel || '';
        document.getElementById('enable-tracking').checked = this.websiteSettings.analytics?.enableTracking || false;
        
        // Load performance settings
        document.getElementById('enable-caching').checked = this.websiteSettings.performance?.enableCaching || false;
        document.getElementById('lazy-loading').checked = this.websiteSettings.performance?.lazyLoading || false;
        document.getElementById('cache-duration').value = this.websiteSettings.performance?.cacheDuration || 24;
    }

    saveSettings() {
        // Collect all settings
        this.websiteSettings = {
            general: {
                siteTitle: document.getElementById('site-title').value,
                siteDescription: document.getElementById('site-description').value,
                companyName: document.getElementById('company-name').value
            },
            contact: {
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value,
                address: document.getElementById('contact-address').value
            },
            social: {
                linkedin: document.getElementById('linkedin-url').value,
                twitter: document.getElementById('twitter-url').value,
                github: document.getElementById('github-url').value
            },
            features: {
                enableCareers: document.getElementById('enable-careers').checked,
                enableEvents: document.getElementById('enable-events').checked,
                enableNewsletter: document.getElementById('enable-newsletter').checked,
                maintenanceMode: document.getElementById('maintenance-mode').checked
            },
            analytics: {
                googleAnalytics: document.getElementById('google-analytics').value,
                facebookPixel: document.getElementById('facebook-pixel').value,
                enableTracking: document.getElementById('enable-tracking').checked
            },
            performance: {
                enableCaching: document.getElementById('enable-caching').checked,
                lazyLoading: document.getElementById('lazy-loading').checked,
                cacheDuration: parseInt(document.getElementById('cache-duration').value)
            }
        };
        
        localStorage.setItem('websiteSettings', JSON.stringify(this.websiteSettings));
        this.showMessage('config-message', 'All settings saved successfully!', 'success');
    }

    autoSaveSettings() {
        // Auto-save settings on change (debounced)
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveSettings();
        }, 1000);
    }
}

// Global variable for access from HTML onclick handlers
let adminPanel;

// Global modal functions for HTML onclick handlers
function closeJobModal() {
    if (adminPanel) adminPanel.closeJobModal();
}

function closeEventModal() {
    if (adminPanel) adminPanel.closeEventModal();
}

function closeContentModal() {
    if (adminPanel) adminPanel.closeContentModal();
}

function closeServiceModal() {
    // Service modal functionality can be added later
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});