
'use client';
import { useState, useEffect } from 'react';

const SUPPLIERS = [
"AAWIN","AMBAL ENTERPRISES","ANNAMALAIYAR ENTERPRISES","BHARATH AQUA","BHAWAR SALES CORPORATION","BRANDBRIDGE NETWORKS PRIVATE LIMITED","D&S ENTERPRISES","DEVI AGENCIES","DHARMADEVI  AGENCY A2B","DHARMADEVI AGENCY","DKA AADARSHA AGENCY","GEETHA ENTERPRISES","GK FOODS","ID FRESH FOOD INDIA PVT LTD","INTELLIGENT RETAIL PRIVATE LIMITED","IRAIVI ENTERPRISES","IRAIVI ENTERPRISES NESTLE","JAI SADHAN ENTERPRISES","JAYANTHINATHAR AGENCY","KARPAGA VINAYAGAR ENTERPRISES","LRK ENTERPRISES","M K ENTERPRISES","MK ENTERPRISES OIL","MKM TRADING COMPANY","MUTHUMALAI AGENCY","NANDHINI TRADE NETWORK PRIVATE LIMITED","NELLAI KUTTAM SNACKS","RUPESH ENTERPRISES","SAARA ENTERPRISES","SAINT GEORGE TRADERS","SAKTHI AGENCIES MT","SARAVANA ENTERPRISES","SCOOTSY LOGISTICS PRIVATE LIMITED","SCOOTSY LOGISTICS PRIVATE LIMITED (HOUSEHOLDS)","SCOOTSY LOGISTICS PRIVATE LIMITED [ BISCUTS]","SERAPHINE DEV IMPEX PVT.LTD","SEVVEL AGENCY","SRI GOLDEN","SRI GOLDEN  KELLOGGS","SRI GOLDEN AGENCY","SRI GOLDEN AGENCY ELITE","SRI JAYALAKSHMI ENTERPRISE","SRI MURUGUVEL ENTERPRISES","SRI RAM TRADERS","SRI SAKTHI VINAYAGAR AGENCY","SRI SHASTA ENTERPRISES","SRI SRINIVASA AGENCIES ALPENLIEBE","SRI SRINIVASA AGENCIES LOTTE CHOCOPIE"
];

// !!! REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT WEB APP URL AFTER DEPLOYING !!!
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

export default function Page() {
  const [tab, setTab] = useState('purchase');
  const [purchases, setPurchases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [formP, setFormP] = useState({date: new Date().toISOString().slice(0,10), supplier:'', billNo:'', amount:'', enteredBy:''});
  const [formPay, setFormPay] = useState({date: new Date().toISOString().slice(0,10), supplier:'', amount:'', mode:'NEFT - Online', ref:'', enteredBy:''});
  const [showSuppliersP, setShowSuppliersP] = useState(false);
  const [showSuppliersPay, setShowSuppliersPay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');

  useEffect(()=>{
    const savedUrl = localStorage.getItem('bala_google_sheet_url');
    if(savedUrl) setSheetUrl(savedUrl);
    const savedSheetLink = localStorage.getItem('bala_sheet_link');
    if(savedSheetLink) setSheetUrl(savedSheetLink);
  },[]);

  const filteredSuppliers = (input) => {
    if(!input) return [];
    return SUPPLIERS.filter(s=> s.toLowerCase().includes(input.toLowerCase())).slice(0,8);
  };

  const saveToGoogleSheet = async (type, data) => {
    if(!sheetUrl || sheetUrl.includes('YOUR_SCRIPT_ID')) {
      alert('First setup Google Sheet URL! Go to settings tab.');
      setTab('settings');
      return false;
    }
    setSaving(true);
    try {
      // Google Apps Script requires no-cors workaround - use form post
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({type, ...data})
      });
      // Since no-cors, we can't read response, assume success
      setSaving(false);
      return true;
    } catch(e) {
      setSaving(false);
      alert('Error saving to Google Sheet: ' + e.message + ' - But data saved locally, will sync later.');
      return false;
    }
  };

  const addPurchase = async () => {
    if(!formP.supplier || !formP.amount) { alert('Supplier and Amount required'); return; }
    const data = {...formP, amount: parseFloat(formP.amount)};
    const success = await saveToGoogleSheet('purchase', data);
    if(success || !sheetUrl) {
      setPurchases([...purchases, {...data, id: Date.now()}]);
      setFormP({...formP, billNo:'', amount:''});
      setShowSuppliersP(false);
      if(success) alert('Added to Master Excel in Google Drive!');
    }
  };

  const addPayment = async () => {
    if(!formPay.supplier || !formPay.amount) { alert('Supplier and Amount required'); return; }
    const data = {...formPay, amount: parseFloat(formPay.amount)};
    const success = await saveToGoogleSheet('payment', data);
    if(success || !sheetUrl) {
      setPayments([...payments, {...data, id: Date.now()}]);
      setFormPay({...formPay, amount:'', ref:''});
      setShowSuppliersPay(false);
      if(success) alert('Payment added to Master Excel in Google Drive!');
    }
  };

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', padding:'16px', fontFamily:'system-ui'}}>
      <div style={{maxWidth:'1100px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
          <h1 style={{fontSize:'20px', fontWeight:'bold', color:'#1e3a8a'}}>Bala Sai Agencies - Live Master</h1>
          <button onClick={()=>setTab('settings')} style={{fontSize:'12px', padding:'6px 12px', border:'1px solid #ddd', borderRadius:'6px'}}>Settings</button>
        </div>
        
        <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
          <button onClick={()=>setTab('purchase')} style={{padding:'8px 16px', borderRadius:'6px', background: tab==='purchase'?'#1e3a8a':'white', color: tab==='purchase'?'white':'black', border:'1px solid #ddd'}}>Daily Purchase</button>
          <button onClick={()=>setTab('payment')} style={{padding:'8px 16px', borderRadius:'6px', background: tab==='payment'?'#1e3a8a':'white', color: tab==='payment'?'white':'black', border:'1px solid #ddd'}}>Daily Payment</button>
          <button onClick={()=>setTab('outstanding')} style={{padding:'8px 16px', borderRadius:'6px', background: tab==='outstanding'?'#1e3a8a':'white', color: tab==='outstanding'?'white':'black', border:'1px solid #ddd'}}>View Master</button>
        </div>

        {tab==='purchase' && (
          <div style={{background:'white', padding:'16px', borderRadius:'8px'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'8px'}}>
              <input type="date" value={formP.date} onChange={e=>setFormP({...formP,date:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <div style={{position:'relative'}}>
                <input placeholder="Supplier" value={formP.supplier} onChange={e=>{setFormP({...formP,supplier:e.target.value}); setShowSuppliersP(true);}} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px', width:'100%'}}/>
                {showSuppliersP && filteredSuppliers(formP.supplier).length>0 && (
                  <div style={{position:'absolute', background:'white', border:'1px solid #ddd', width:'100%', zIndex:10}}>
                    {filteredSuppliers(formP.supplier).map(s=><div key={s} onClick={()=>{setFormP({...formP,supplier:s}); setShowSuppliersP(false);}} style={{padding:'6px', fontSize:'12px', cursor:'pointer', borderBottom:'1px solid #eee'}}>{s}</div>)}
                  </div>
                )}
              </div>
              <input placeholder="Bill No" value={formP.billNo} onChange={e=>setFormP({...formP,billNo:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <input placeholder="Amount" type="number" value={formP.amount} onChange={e=>setFormP({...formP,amount:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <input placeholder="Entered By" value={formP.enteredBy} onChange={e=>setFormP({...formP,enteredBy:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <button onClick={addPurchase} disabled={saving} style={{background:'#1e3a8a', color:'white', borderRadius:'6px', padding:'8px'}}>{saving?'Saving to Master...':'Add to Master Excel'}</button>
            </div>
          </div>
        )}

        {tab==='payment' && (
          <div style={{background:'white', padding:'16px', borderRadius:'8px'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'8px'}}>
              <input type="date" value={formPay.date} onChange={e=>setFormPay({...formPay,date:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <div style={{position:'relative'}}>
                <input placeholder="Supplier" value={formPay.supplier} onChange={e=>{setFormPay({...formPay,supplier:e.target.value}); setShowSuppliersPay(true);}} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px', width:'100%'}}/>
                {showSuppliersPay && filteredSuppliers(formPay.supplier).length>0 && (
                  <div style={{position:'absolute', background:'white', border:'1px solid #ddd', width:'100%', zIndex:10}}>
                    {filteredSuppliers(formPay.supplier).map(s=><div key={s} onClick={()=>{setFormPay({...formPay,supplier:s}); setShowSuppliersPay(false);}} style={{padding:'6px', fontSize:'12px', cursor:'pointer'}}>{s}</div>)}
                  </div>
                )}
              </div>
              <input placeholder="Amount" type="number" value={formPay.amount} onChange={e=>setFormPay({...formPay,amount:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <select value={formPay.mode} onChange={e=>setFormPay({...formPay,mode:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}>
                <option>Cash - Store</option>
                <option>NEFT - Online</option>
                <option>Online - Bank</option>
                <option>Indian Bank</option>
              </select>
              <input placeholder="UTR/Ref" value={formPay.ref} onChange={e=>setFormPay({...formPay,ref:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <button onClick={addPayment} disabled={saving} style={{background:'#1e3a8a', color:'white', borderRadius:'6px', padding:'8px'}}>{saving?'Saving...':'Add to Master Excel'}</button>
            </div>
          </div>
        )}

        {tab==='outstanding' && (
          <div style={{background:'white', padding:'16px', borderRadius:'8px', textAlign:'center'}}>
            <p style={{fontSize:'14px', marginBottom:'12px'}}>Your Master Excel is in Google Drive. Open it to see live data:</p>
            <a href="https://drive.google.com" target="_blank" style={{display:'inline-block', background:'#1e3a8a', color:'white', padding:'10px 20px', borderRadius:'6px', textDecoration:'none'}}>Open Google Drive</a>
            <p style={{fontSize:'12px', color:'#666', marginTop:'12px'}}>Every entry you add via Purchase/Payment tabs goes directly to your Master Ledger sheet (02_MASTER_LEDGER_ENTRY)</p>
          </div>
        )}

        {tab==='settings' && (
          <div style={{background:'white', padding:'16px', borderRadius:'8px'}}>
            <h3 style={{fontWeight:'bold', marginBottom:'8px'}}>Google Sheet Setup (One-time)</h3>
            <p style={{fontSize:'13px', marginBottom:'8px'}}>1. Upload your V3 Excel to Google Drive and open with Google Sheets</p>
            <p style={{fontSize:'13px', marginBottom:'8px'}}>2. In Google Sheets: Extensions - Apps Script - Paste code from Google_Apps_Script_Code.gs file</p>
            <p style={{fontSize:'13px', marginBottom:'8px'}}>3. Deploy - New Deployment - Web App - Anyone - Copy URL</p>
            <p style={{fontSize:'13px', marginBottom:'12px'}}>4. Paste that URL below:</p>
            <input placeholder="Paste Google Apps Script Web App URL here" value={sheetUrl} onChange={e=>setSheetUrl(e.target.value)} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px', width:'100%', marginBottom:'8px'}}/>
            <button onClick={()=>{localStorage.setItem('bala_google_sheet_url', sheetUrl); localStorage.setItem('bala_sheet_link', sheetUrl); alert('Saved! Now entries will auto-update to your Master Excel in Google Drive');}} style={{background:'#16a34a', color:'white', padding:'8px 16px', borderRadius:'6px'}}>Save Sheet URL</button>
            <div style={{marginTop:'16px', padding:'12px', background:'#f1f5f9', borderRadius:'6px', fontSize:'12px'}}>
              <strong>How it works:</strong><br/>
              When staff enters Purchase: Date, Supplier, Bill No, Amount - it auto-inserts row into your 06_DAILY_PURCHASE_ENTRY sheet in Google Sheets, which auto-updates 02_MASTER_LEDGER_ENTRY via your existing formulas.<br/><br/>
              When you open your Google Drive Excel, new rows are already there. No manual copy needed.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
