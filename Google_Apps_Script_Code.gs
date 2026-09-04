
// Google Apps Script - Paste this in Extensions > Apps Script in your Google Sheet
// This makes your Google Sheet auto-update from Vercel portal

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var type = data.type; // 'purchase' or 'payment'
    
    if(type === 'purchase') {
      var sheet = ss.getSheetByName('06_DAILY_PURCHASE_ENTRY') || ss.getSheetByName('Daily_Purchase_Entry');
      if(!sheet) sheet = ss.getSheets()[0];
      // Find next empty row (skip header rows)
      var lastRow = sheet.getLastRow();
      // For V3 format: Row 5 is first data row? Adjust
      // Structure: A=Date, B=Supplier, C=Bill No, D=Particulars, E=Type, F=Amount, etc
      // Try to detect header
      if(lastRow < 5) lastRow = 4;
      
      // V3 sheet structure - Daily Purchase Entry
      // Your 06_DAILY_PURCHASE_ENTRY has headers at row 4
      // A: Date, B: Supplier Name, C: Bill No, D: Particulars, E: Amount?
      // We'll append to both daily sheet and master ledger
      
      sheet.appendRow([
        data.date, // Date
        data.supplier, // Supplier
        data.billNo, // Bill No
        data.particulars || 'Purchase - ' + data.billNo, // Particulars
        'Purchase', // Type
        parseFloat(data.amount) || 0, // Bill Amount
        '', // Payment Amount
        '', // Payment Mode
        '', // Swiggy
        '', // Damage
        '', // Incentive
        data.enteredBy || ''
      ]);
      
      // Also append to Master Ledger directly
      var master = ss.getSheetByName('02_MASTER_LEDGER_ENTRY') || ss.getSheetByName('Master_Ledger');
      if(master) {
        master.appendRow([
          data.date,
          data.supplier,
          data.billNo,
          data.particulars || 'Purchase Bill No ' + data.billNo,
          'Purchase',
          parseFloat(data.amount) || 0,
          '',
          '',
          '',
          '',
          '',
          new Date(),
          data.enteredBy || ''
        ]);
      }
    } 
    else if(type === 'payment') {
      var sheet = ss.getSheetByName('07_DAILY_CASH_PAYMENT_ENTRY') || ss.getSheetByName('Daily_Payment_Entry');
      if(!sheet) sheet = ss.getSheets()[1];
      var lastRow = sheet.getLastRow();
      if(lastRow < 5) lastRow = 4;
      
      sheet.appendRow([
        data.date,
        data.supplier,
        data.ref || '',
        data.mode + ' - ' + (data.ref||''),
        data.mode.indexOf('Cash')>-1 ? 'Cash Payment - Store' : 'Online Payment - NEFT/Bank',
        '',
        parseFloat(data.amount) || 0,
        data.mode,
        '',
        '',
        '',
        data.enteredBy || ''
      ]);
      
      var master = ss.getSheetByName('02_MASTER_LEDGER_ENTRY') || ss.getSheetByName('Master_Ledger');
      if(master) {
        master.appendRow([
          data.date,
          data.supplier,
          data.ref || '',
          data.mode + ' - ' + (data.ref||''),
          data.mode.indexOf('Cash')>-1 ? 'Cash Payment - Store' : 'Online Payment - NEFT/Bank',
          '',
          parseFloat(data.amount) || 0,
          data.mode,
          '',
          '',
          '',
          new Date(),
          data.enteredBy || ''
        ]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({success:true, message:'Added to Master Excel'})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success:false, error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status:'Bala Sai Ledger API is running', time: new Date()})).setMimeType(ContentService.MimeType.JSON);
}
