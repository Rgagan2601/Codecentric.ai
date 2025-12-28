# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for your contact form.

## Prerequisites

1. A Google account
2. Access to Google Sheets
3. Google Cloud Console access

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "CodeCentric Contact Form" or any name you prefer
4. Note the Sheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - Sheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## Step 2: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## Step 3: Create API Credentials

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Under "Website restrictions", add your domain

## Step 4: Configure Sheet Permissions

1. Open your Google Sheet
2. Click "Share" button
3. Change permissions to "Anyone with the link can view" or add specific email addresses
4. Make sure the sheet is accessible with your API key

## Step 5: Configure the Admin Panel

1. Open `admin.html` in your browser
2. Login with credentials:
   - Username: `admin`
   - Password: `codecentric2024`
   
   OR
   
   - Username: `manager`
   - Password: `ai@manager123`

3. In the Google Sheets Configuration section:
   - Enter your Sheet ID
   - Enter your API Key
   - Click "Save Configuration"

## Step 6: Test the Integration

1. Go to your main website
2. Fill out the contact form
3. Submit the form
4. Check your Google Sheet - the data should appear automatically
5. Check the admin panel to view all submissions

## Security Considerations

### For Production Use:

1. **Use OAuth 2.0 instead of API Keys** for better security
2. **Implement proper authentication** for the admin panel
3. **Use environment variables** for sensitive data
4. **Add rate limiting** to prevent spam
5. **Validate and sanitize** all form inputs
6. **Use HTTPS** for all communications

### Current Security Features:

- Simple password protection for admin panel
- Local storage for configuration (not recommended for production)
- Basic form validation
- HTML escaping for displayed data

## Troubleshooting

### Common Issues:

1. **"Failed to connect to Google Sheets"**
   - Check if the API key is correct
   - Verify the Sheet ID is correct
   - Ensure the Google Sheets API is enabled
   - Check if the sheet is publicly accessible

2. **"Permission denied"**
   - Make sure the sheet is shared properly
   - Check API key restrictions
   - Verify the sheet exists and is accessible

3. **"Data not appearing in sheet"**
   - Check browser console for errors
   - Verify the sheet structure (should have columns A-E)
   - Test the admin panel connection

### Testing Steps:

1. Test Google Sheets API connection in admin panel
2. Submit a test contact form
3. Check browser developer tools for any errors
4. Verify data appears in both the sheet and admin panel

## File Structure

```
├── index.html          # Main website with contact form
├── admin.html          # Admin panel for viewing submissions
├── script.js           # Main website JavaScript with Google Sheets integration
├── admin.js            # Admin panel JavaScript
├── styles.css          # Shared styles
└── GOOGLE_SHEETS_SETUP.md  # This setup guide
```

## Admin Panel Features

- **Secure Login**: Password-protected access
- **Configuration Management**: Easy setup of Google Sheets credentials
- **Real-time Data**: View all contact form submissions
- **Statistics Dashboard**: See contact counts by day, week, month
- **Responsive Design**: Works on desktop and mobile devices

## Contact Form Features

- **Automatic Google Sheets Integration**: Submissions are automatically saved
- **Real-time Feedback**: Users get immediate confirmation
- **Fallback Handling**: Graceful degradation if Google Sheets is unavailable
- **Responsive Design**: Works on all devices

## Next Steps

1. Set up the Google Sheet and API as described above
2. Configure the admin panel with your credentials
3. Test the contact form submission
4. Monitor submissions through the admin panel
5. Consider implementing additional security measures for production use

For any issues or questions, please refer to the troubleshooting section or check the browser console for detailed error messages.