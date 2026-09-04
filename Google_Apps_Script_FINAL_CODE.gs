
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if(!ss) ss = SpreadsheetApp.openById('1tynBNoX1CL52mzb-cDczyXAR4P4iHpVz');
    var data = JSON.parse(e.postData.contents);
    var type = data.type;
    
    if(type === 'purchase') {
      var sheet = ss.getSheetByName('06_DAILY_PURCHASE_ENTRY');
      if(!sheet) sheet = ss.getSheetByName('Daily_Purchase_Entry');
      if(!sheet) sheet = ss.getSheets()[2];
      
      sheet.appendRow([
        data.date,
        data.supplier,
        data.billNo,
        data.particulars || 'Purchase - ' + data.billNo,
        'Purchase',
        parseFloat(data.amount) || 0,
        '',
        '',
        '',
        '',
        '',
        data.enteredBy || new Date().toLocaleString()
      ]);
      
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
    } else if(type === 'payment') {
      var sheet = ss.getSheetByName('07_DAILY_CASH_PAYMENT_ENTRY');
      if(!sheet) sheet = ss.getSheetByName('Daily_Payment_Entry');
      if(!sheet) sheet = ss.getSheets()[3];
      
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
        data.enteredBy || new Date().toLocaleString()
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
    
    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success:false, error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status:'Bala Sai Ledger Live API running', time: new Date()})).setMimeType(ContentService.MimeType.JSON);
}
