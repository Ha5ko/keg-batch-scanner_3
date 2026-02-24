/**
 * Google Apps Script for Keg Batch Scanner
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click "Deploy" and authorize the app
 * 9. Copy the Web app URL and paste it in src/utils/config.ts
 */

// Configuration - Update this with your spreadsheet ID
// You can find the ID in the spreadsheet URL:
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAME = 'Keg Scans';

/**
 * Handle GET requests (for testing connection)
 */
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'ping') {
    return createJsonResponse({ success: true, message: 'Connected!' });
  }

  return createJsonResponse({ success: true, message: 'Keg Batch Scanner API' });
}

/**
 * Handle POST requests (for adding scans)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'addScans') {
      return handleAddScans(data);
    }

    return createJsonResponse({
      success: false,
      error: 'Unknown action'
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Add scans to the spreadsheet
 */
function handleAddScans(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Add headers
      sheet.getRange(1, 1, 1, 6).setValues([[
        'Scan ID',
        'Batch Code',
        'Scan Timestamp',
        'Synced At',
        'User Email',
        'Device'
      ]]);
      // Format header row
      sheet.getRange(1, 1, 1, 6)
        .setFontWeight('bold')
        .setBackground('#D00000')
        .setFontColor('#FFFFFF');
      // Freeze header row
      sheet.setFrozenRows(1);
      // Set column widths
      sheet.setColumnWidth(1, 200);
      sheet.setColumnWidth(2, 200);
      sheet.setColumnWidth(3, 180);
      sheet.setColumnWidth(4, 180);
      sheet.setColumnWidth(5, 250);
      sheet.setColumnWidth(6, 200);
    }

    const scans = data.scans || [];
    const email = data.email || 'Unknown';
    const device = data.device || 'Unknown';
    const syncedAt = new Date().toISOString();

    if (scans.length === 0) {
      return createJsonResponse({
        success: true,
        message: 'No scans to add',
        addedCount: 0
      });
    }

    // Prepare rows to add
    const rows = scans.map(scan => [
      scan.id,
      scan.batchCode,
      scan.timestamp,
      syncedAt,
      email,
      device
    ]);

    // Append all rows at once
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, 6).setValues(rows);

    return createJsonResponse({
      success: true,
      message: `Added ${rows.length} scan(s)`,
      addedCount: rows.length
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Create a JSON response with proper CORS headers
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - run this to verify the script works
 */
function testAddScan() {
  const testData = {
    action: 'addScans',
    email: 'test@example.com',
    scans: [{
      id: 'test-' + Date.now(),
      batchCode: 'TEST-BATCH-001',
      timestamp: new Date().toISOString()
    }]
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
