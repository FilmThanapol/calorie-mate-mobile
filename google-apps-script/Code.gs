/**
 * Google Apps Script for Nutrition Tracker
 * Deploy as Web App with execute permissions for "Anyone"
 */

// Configuration
const SHEET_NAME = 'NutritionData';
const REQUIRED_HEADERS = ['Date', 'Time', 'Food Name', 'Amount', 'Calories', 'Protein', 'Image URL'];

/**
 * Initialize the spreadsheet with headers if it doesn't exist
 */
function initializeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Handle GET requests - fetch nutrition data
 */
function doGet(e) {
  try {
    const sheet = initializeSheet();
    const params = e.parameter;
    
    // Get all data
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, REQUIRED_HEADERS.length).getValues();
    
    const meals = data.map(row => ({
      date: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      time: row[1],
      food_name: row[2],
      amount: row[3],
      calories: Number(row[4]) || 0,
      protein: Number(row[5]) || 0,
      image_url: row[6] || ''
    }));
    
    // Filter by date range if provided
    let filteredMeals = meals;
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      filteredMeals = filteredMeals.filter(meal => new Date(meal.date) >= startDate);
    }
    
    if (params.endDate) {
      const endDate = new Date(params.endDate);
      filteredMeals = filteredMeals.filter(meal => new Date(meal.date) <= endDate);
    }
    
    // Sort by date and time (newest first)
    filteredMeals.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB.getTime() - dateA.getTime();
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: filteredMeals }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch data: ' + error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests - add new meal entry
 */
function doPost(e) {
  try {
    const sheet = initializeSheet();
    
    // Parse the request body
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      throw new Error('Invalid JSON in request body');
    }
    
    // Validate required fields
    const requiredFields = ['date', 'time', 'food_name', 'amount', 'calories', 'protein'];
    for (const field of requiredFields) {
      if (!requestData[field] && requestData[field] !== 0) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate data types
    if (isNaN(Number(requestData.calories))) {
      throw new Error('Calories must be a number');
    }
    
    if (isNaN(Number(requestData.protein))) {
      throw new Error('Protein must be a number');
    }
    
    // Prepare the row data
    const rowData = [
      new Date(requestData.date),
      requestData.time,
      requestData.food_name,
      requestData.amount,
      Number(requestData.calories),
      Number(requestData.protein),
      requestData.image_url || ''
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Meal added successfully',
        data: {
          date: requestData.date,
          time: requestData.time,
          food_name: requestData.food_name,
          amount: requestData.amount,
          calories: Number(requestData.calories),
          protein: Number(requestData.protein),
          image_url: requestData.image_url || ''
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to add meal: ' + error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the setup
 */
function testSetup() {
  const sheet = initializeSheet();
  console.log('Sheet initialized successfully');
  console.log('Headers:', sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).getValues()[0]);
  
  // Test adding a sample meal
  const testMeal = {
    date: '2025-07-08',
    time: '12:30',
    food_name: 'Test Chicken Breast',
    amount: '150g',
    calories: 200,
    protein: 30,
    image_url: 'https://example.com/image.jpg'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testMeal)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
}

/**
 * Get summary statistics for the dashboard
 */
function getSummaryStats(startDate, endDate) {
  try {
    const sheet = initializeSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { totalMeals: 0, totalCalories: 0, totalProtein: 0, avgCalories: 0, avgProtein: 0 };
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, REQUIRED_HEADERS.length).getValues();
    
    let filteredData = data;
    if (startDate) {
      const start = new Date(startDate);
      filteredData = filteredData.filter(row => new Date(row[0]) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredData = filteredData.filter(row => new Date(row[0]) <= end);
    }
    
    const totalMeals = filteredData.length;
    const totalCalories = filteredData.reduce((sum, row) => sum + (Number(row[4]) || 0), 0);
    const totalProtein = filteredData.reduce((sum, row) => sum + (Number(row[5]) || 0), 0);
    
    return {
      totalMeals,
      totalCalories,
      totalProtein,
      avgCalories: totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0,
      avgProtein: totalMeals > 0 ? Math.round((totalProtein / totalMeals) * 10) / 10 : 0
    };
    
  } catch (error) {
    console.error('Error getting summary stats:', error);
    return { error: error.message };
  }
}
