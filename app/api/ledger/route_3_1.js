
import { put, list } from '@vercel/blob';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'ledger-data' });
    if (blobs.length === 0) {
      return Response.json({ purchases: [], payments: [] });
    }
    const latest = blobs[0];
    const res = await fetch(latest.url);
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const purSheet = wb.Sheets['Daily_Purchase'];
    const paySheet = wb.Sheets['Daily_Payment'];
    const purchases = purSheet ? XLSX.utils.sheet_to_json(purSheet) : [];
    const payments = paySheet ? XLSX.utils.sheet_to_json(paySheet) : [];
    return Response.json({ purchases, payments, blobUrl: latest.url });
  } catch (e) {
    return Response.json({ purchases: [], payments: [], error: e.message });
  }
}

export async function POST(req) {
  try {
    const { purchases, payments } = await req.json();
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Purchase sheet
    const purData = purchases.map(p=>({
      Date: p.date,
      Supplier: p.supplier,
      Bill_No: p.billNo,
      Amount: p.amount,
      Particulars: p.particulars || '',
      Entered_By: p.enteredBy || ''
    }));
    const wsPur = XLSX.utils.json_to_sheet(purData);
    XLSX.utils.book_append_sheet(wb, wsPur, 'Daily_Purchase');
    
    // Payment sheet
    const payData = payments.map(p=>({
      Date: p.date,
      Supplier: p.supplier,
      Amount: p.amount,
      Mode: p.mode,
      Ref: p.ref || '',
      Entered_By: p.enteredBy || ''
    }));
    const wsPay = XLSX.utils.json_to_sheet(payData);
    XLSX.utils.book_append_sheet(wb, wsPay, 'Daily_Payment');
    
    // Summary sheet - No Opening logic
    const totals = {};
    purchases.forEach(p=>{
      if(!totals[p.supplier]) totals[p.supplier]={pur:0, pay:0};
      totals[p.supplier].pur+=parseFloat(p.amount||0);
    });
    payments.forEach(p=>{
      if(!totals[p.supplier]) totals[p.supplier]={pur:0, pay:0};
      totals[p.supplier].pay+=parseFloat(p.amount||0);
    });
    const summary = Object.keys(totals).map(s=>({
      Supplier: s,
      Total_Purchase: totals[s].pur,
      Total_Paid: totals[s].pay,
      Final_Due_No_Opening: totals[s].pur - totals[s].pay,
      Balance_Type: (totals[s].pur - totals[s].pay)>=0 ? 'Cr' : 'Dr'
    }));
    const wsSum = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSum, 'Outstanding_No_Opening');
    
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Save to Vercel Blob
    const blob = await put('ledger-data/ledger.xlsx', buf, { access: 'public', addRandomSuffix: false, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Also save JSON backup
    await put('ledger-data/data.json', JSON.stringify({purchases, payments}), { access: 'public', addRandomSuffix: false });
    
    return Response.json({ success: true, url: blob.url });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
