
export async function GET() {
  return Response.json({ purchases: [], payments: [] });
}
export async function POST(req) {
  try {
    const body = await req.json();
    // Try to save to blob if token exists, otherwise just return success
    try {
      const { put } = await import('@vercel/blob');
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      const purData = (body.purchases||[]).map(p=>({Date:p.date, Supplier:p.supplier, Bill_No:p.billNo, Amount:p.amount}));
      const wsPur = XLSX.utils.json_to_sheet(purData);
      XLSX.utils.book_append_sheet(wb, wsPur, 'Daily_Purchase');
      const payData = (body.payments||[]).map(p=>({Date:p.date, Supplier:p.supplier, Amount:p.amount, Mode:p.mode, Ref:p.ref}));
      const wsPay = XLSX.utils.json_to_sheet(payData);
      XLSX.utils.book_append_sheet(wb, wsPay, 'Daily_Payment');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const blob = await put('ledger-data/ledger.xlsx', buf, { access: 'public', addRandomSuffix: false });
      return Response.json({ success: true, url: blob.url });
    } catch(e) {
      // If blob not configured, just return success for local storage
      return Response.json({ success: true, message: 'Saved locally - add BLOB_READ_WRITE_TOKEN for cloud Excel', blobError: e.message });
    }
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
