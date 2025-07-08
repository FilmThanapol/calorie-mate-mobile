# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the Nutrition Tracker app.

## Prerequisites

- Google account
- Access to Google Sheets and Google Apps Script

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Nutrition Tracker Data" (or any name you prefer)
4. Note the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

## Step 2: Set up Google Apps Script

1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. Delete the default `myFunction()` code
3. Copy and paste the entire content from `google-apps-script/Code.gs`
4. Save the project (Ctrl+S or Cmd+S)
5. Name your project "Nutrition Tracker API"

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy** > **New deployment**
2. Click the gear icon next to "Type" and select **Web app**
3. Fill in the deployment settings:
   - **Description**: "Nutrition Tracker API v1"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Important**: Copy the Web App URL - you'll need this for the frontend
6. Click **Done**

## Step 4: Test the Deployment

1. In the Apps Script editor, run the `testSetup()` function:
   - Select `testSetup` from the function dropdown
   - Click the **Run** button
   - Authorize the script when prompted
2. Check your Google Sheet - it should now have headers and a test entry
3. Test the Web App URL by visiting it in your browser - you should see JSON data

## Step 5: Configure the Frontend

1. Copy `.env.example` to `.env`
2. Replace `YOUR_SCRIPT_ID` with your actual Web App URL:
   ```
   VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec
   ```

## Step 6: Verify Integration

1. Start your development server: `npm run dev`
2. Try adding a meal through the app
3. Check your Google Sheet to see if the data appears
4. Check the browser console for any errors

## Troubleshooting

### Common Issues

1. **"Script function not found" error**
   - Make sure you've saved the Apps Script code
   - Verify the function names match exactly

2. **CORS errors**
   - The Apps Script deployment should handle CORS automatically
   - Make sure you deployed as a Web App with "Anyone" access

3. **Authorization errors**
   - Run the `testSetup()` function in Apps Script to authorize
   - Make sure the script has permission to access your spreadsheet

4. **Data not appearing in sheet**
   - Check the browser network tab for failed requests
   - Verify the Web App URL is correct in your `.env` file
   - Check Apps Script logs: **Executions** tab in the editor

### Testing the API Manually

You can test the API endpoints using curl or a tool like Postman:

**GET request (fetch meals):**
```bash
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

**POST request (add meal):**
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-07-08",
    "time": "12:30",
    "food_name": "Test Meal",
    "amount": "100g",
    "calories": 150,
    "protein": 20,
    "image_url": ""
  }'
```

## Security Considerations

- The Web App is deployed with "Anyone" access for simplicity
- For production use, consider implementing authentication
- Monitor your Apps Script quotas and usage
- Consider rate limiting if needed

## Data Structure

The Google Sheet will have the following columns:
- **Date**: YYYY-MM-DD format
- **Time**: HH:MM format  
- **Food Name**: Text description
- **Amount**: Serving size (e.g., "150g", "1 cup")
- **Calories**: Numeric value
- **Protein**: Numeric value (grams)
- **Image URL**: URL to uploaded image (optional)

## Next Steps

Once Google Sheets integration is working:
1. Set up Google Drive integration for image uploads
2. Implement data synchronization in the frontend
3. Add offline support with local storage fallback
4. Consider implementing data export features
