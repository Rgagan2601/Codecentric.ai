// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.config = {
            sheetId: localStorage.getItem('sheetId') || '',
            apiKey: localStorage.getItem('apiKey') || ''
        };
        this.contacts = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkLoginStatus();
        this.loadConfig();
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Config form
        document.getElementById('config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfig();
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadContacts();
        });
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
        this.loadContacts();
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
        const total = this.contacts.length;
        const today = this.getContactsCount('today');
        const thisWeek = this.getContactsCount('week');
        const thisMonth = this.getContactsCount('month');

        document.getElementById('total-contacts').textContent = total;
        document.getElementById('today-contacts').textContent = today;
        document.getElementById('this-week-contacts').textContent = thisWeek;
        document.getElementById('this-month-contacts').textContent = thisMonth;
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
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});