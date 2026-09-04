
'use client';
import { useState, useEffect } from 'react';

const SUPPLIERS = [
"AAWIN","AMBAL ENTERPRISES","ANNAMALAIYAR ENTERPRISES","BHARATH AQUA","BHAWAR SALES CORPORATION","BRANDBRIDGE NETWORKS PRIVATE LIMITED","D&S ENTERPRISES","DEVI AGENCIES","DHARMADEVI  AGENCY A2B","DHARMADEVI AGENCY","DKA AADARSHA AGENCY","GEETHA ENTERPRISES","GK FOODS","ID FRESH FOOD INDIA PVT LTD","INTELLIGENT RETAIL PRIVATE LIMITED","IRAIVI ENTERPRISES","IRAIVI ENTERPRISES NESTLE","JAI SADHAN ENTERPRISES","JAYANTHINATHAR AGENCY","KARPAGA VINAYAGAR ENTERPRISES","LRK ENTERPRISES","M K ENTERPRISES","MK ENTERPRISES OIL","MKM TRADING COMPANY","MUTHUMALAI AGENCY","NANDHINI TRADE NETWORK PRIVATE LIMITED","NELLAI KUTTAM SNACKS","RUPESH ENTERPRISES","SAARA ENTERPRISES","SAINT GEORGE TRADERS","SAKTHI AGENCIES MT","SARAVANA ENTERPRISES","SCOOTSY LOGISTICS PRIVATE LIMITED","SCOOTSY LOGISTICS PRIVATE LIMITED (HOUSEHOLDS)","SCOOTSY LOGISTICS PRIVATE LIMITED [ BISCUTS]","SERAPHINE DEV IMPEX PVT.LTD","SEVVEL AGENCY","SRI GOLDEN","SRI GOLDEN  KELLOGGS","SRI GOLDEN AGENCY","SRI GOLDEN AGENCY ELITE","SRI JAYALAKSHMI ENTERPRISE","SRI MURUGUVEL ENTERPRISES","SRI RAM TRADERS","SRI SAKTHI VINAYAGAR AGENCY","SRI SHASTA ENTERPRISES","SRI SRINIVASA AGENCIES ALPENLIEBE","SRI SRINIVASA AGENCIES LOTTE CHOCOPIE"
];

export default function Page() {
  const [tab, setTab] = useState('purchase');
  const [purchases, setPurchases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [formP, setFormP] = useState({date: new Date().toISOString().slice(0,10), supplier:'', billNo:'', amount:'', particulars:'', enteredBy:''});
  const [formPay, setFormPay] = useState({date: new Date().toISOString().slice(0,10), supplier:'', amount:'', mode:'NEFT - Online', ref:'', enteredBy:''});
  const [showSuppliersP, setShowSuppliersP] = useState(false);
  const [showSuppliersPay, setShowSuppliersPay] = useState(false);
  const [lastExcelUrl, setLastExcelUrl] = useState('');

  useEffect(()=>{
    const saved = localStorage.getItem('bala_purchases');
    if(saved) setPurchases(JSON.parse(saved));
    const saved2 = localStorage.getItem('bala_payments');
    if(saved2) setPayments(JSON.parse(saved2));
    const savedUrl = localStorage.getItem('bala_last_excel_url');
    if(savedUrl) setLastExcelUrl(savedUrl);
  },[]);

  useEffect(()=>{ localStorage.setItem('bala_purchases', JSON.stringify(purchases)); },[purchases]);
  useEffect(()=>{ localStorage.setItem('bala_payments', JSON.stringify(payments)); },[payments]);

  const filteredSuppliers = (input) => {
    if(!input) return [];
    return SUPPLIERS.filter(s=> s.toLowerCase().includes(input.toLowerCase())).slice(0,8);
  };

  const addPurchase = () => {
    if(!formP.supplier || !formP.amount) { alert('Supplier and Amount required'); return; }
    setPurchases([...purchases, {...formP, id: Date.now(), amount: parseFloat(formP.amount)}]);
    setFormP({...formP, billNo:'', amount:'', particulars:''});
    setShowSuppliersP(false);
  };
  const addPayment = () => {
    if(!formPay.supplier || !formPay.amount) { alert('Supplier and Amount required'); return; }
    setPayments([...payments, {...formPay, id: Date.now(), amount: parseFloat(formPay.amount)}]);
    setFormPay({...formPay, amount:'', ref:''});
    setShowSuppliersPay(false);
  };

  const totals = {};
  SUPPLIERS.forEach(s=> totals[s]={pur:0, pay:0});
  purchases.forEach(p=> { if(totals[p.supplier]) totals[p.supplier].pur+=Number(p.amount||0); });
  payments.forEach(p=> { if(totals[p.supplier]) totals[p.supplier].pay+=Number(p.amount||0); });

  const showNeftWarning = parseFloat(formPay.amount) > 5000 && formPay.mode === 'Cash - Store';

  const downloadMasterExcel = async () => {
    // Load SheetJS from CDN if not loaded
    if(typeof window.XLSX === 'undefined') {
      await new Promise((resolve, reject)=>{
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Daily Purchase
    const purData = purchases.map(p=>({Date:p.date, Supplier:p.supplier, Bill_No:p.billNo, Amount:p.amount, Particulars:p.particulars||'', Entered_By:p.enteredBy||''}));
    const wsPur = XLSX.utils.json_to_sheet(purData);
    XLSX.utils.book_append_sheet(wb, wsPur, 'Daily_Purchase_Entry');

    // Sheet 2: Daily Payment
    const payData = payments.map(p=>({Date:p.date, Supplier:p.supplier, Amount:p.amount, Mode:p.mode, Ref_UTR:p.ref||'', Entered_By:p.enteredBy||''}));
    const wsPay = XLSX.utils.json_to_sheet(payData);
    XLSX.utils.book_append_sheet(wb, wsPay, 'Daily_Payment_Entry');

    // Sheet 3: Master Ledger Format (like your 02_MASTER_LEDGER_ENTRY)
    const masterRows = [];
    purchases.forEach(p=>{
      masterRows.push({Date:p.date, Supplier_Name:p.supplier, Bill_No:p.billNo, Particulars:p.particulars||'Purchase Bill No '+p.billNo, Transaction_Type:'Purchase', Bill_Amount:p.amount, Payment_Amount:'', Payment_Mode:'', Swiggy:'', Damage:'', Incentive:'', Entered_By:p.enteredBy||''});
    });
    payments.forEach(p=>{
      const isCash = p.mode.includes('Cash');
      masterRows.push({Date:p.date, Supplier_Name:p.supplier, Bill_No:p.ref, Particulars:p.mode+' - '+p.ref, Transaction_Type: isCash ? 'Cash Payment - Store' : 'Online Payment - NEFT/Bank', Bill_Amount:'', Payment_Amount:p.amount, Payment_Mode:p.mode, Swiggy:'', Damage:'', Incentive:'', Entered_By:p.enteredBy||''});
    });
    masterRows.sort((a,b)=> new Date(a.Date) - new Date(b.Date));
    const wsMaster = XLSX.utils.json_to_sheet(masterRows);
    XLSX.utils.book_append_sheet(wb, wsMaster, '02_MASTER_LEDGER_ENTRY');

    // Sheet 4: Outstanding - No Opening (your logic)
    const summary = Object.keys(totals).filter(s=>totals[s].pur>0||totals[s].pay>0).map(s=>{
      const due = totals[s].pur - totals[s].pay;
      return {Supplier:s, Total_Purchase:totals[s].pur, Total_Paid:totals[s].pay, Damage:0, Final_Due_No_Opening:due, Balance_Type: due>=0?'Cr':'Dr'};
    });
    // Add MKM example with damage
    const mkmDamage = 5000;
    const mkmRow = summary.find(r=>r.Supplier==='MKM TRADING COMPANY');
    if(mkmRow) {
      mkmRow.Damage = mkmDamage;
      mkmRow.Final_Due_No_Opening = mkmRow.Total_Purchase - mkmRow.Total_Paid - mkmDamage;
    }
    const wsSum = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSum, 'FINAL_REPORT_NO_OPENING');

    // Sheet 5: Supplier Master - No Opening
    const supMaster = SUPPLIERS.map(s=>{
      const t = totals[s] || {pur:0, pay:0};
      let dmg = s==='MKM TRADING COMPANY' ? 5000 : 0;
      return {Supplier_Name:s, Ledger_AC:'LEDGER A/C Of '+s, Balance_Type:'Cr', Status:'Active', Total_Purchase:t.pur, Total_Paid:t.pay, Swiggy:0, Damage:dmg, Incentive:0, Current_Outstanding:t.pur - t.pay - dmg, Current_Bal_Type:(t.pur - t.pay - dmg)>=0?'Cr':'Dr'};
    }).filter(r=>r.Total_Purchase>0||r.Total_Paid>0);
    const wsSup = XLSX.utils.json_to_sheet(supMaster);
    XLSX.utils.book_append_sheet(wb, wsSup, '01_SUPPLIER_MASTER_NO_OPENING');

    XLSX.writeFile(wb, 'Bala_Sai_Master_Ledger_Updated_'+new Date().toISOString().slice(0,10)+'.xlsx');

    // Also try to save to cloud if blob configured
    try {
      const res = await fetch('/api/ledger', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({purchases, payments})});
      const data = await res.json();
      if(data.url) {
        setLastExcelUrl(data.url);
        localStorage.setItem('bala_last_excel_url', data.url);
        alert('Excel downloaded + Saved to Cloud! Cloud URL: ' + data.url);
      } else {
        alert('Master Excel Downloaded! (Saved locally - to enable cloud Excel URL, add BLOB token in Vercel)');
      }
    } catch(e) {
      alert('Master Excel Downloaded Successfully! Check your Downloads folder.');
    }
  };

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', padding:'16px', fontFamily:'system-ui'}}>
      <div style={{maxWidth:'1200px', margin:'0 auto'}}>
        <h1 style={{fontSize:'24px', fontWeight:'bold', color:'#1e3a8a'}}>Bala Sai Agencies - Daily Entry Portal</h1>
        <p style={{fontSize:'12px', color:'#666', marginBottom:'8px'}}>Final Logic: Due = Purchase - Paid - Damage (No Opening Balance)</p>
        {lastExcelUrl && <div style={{background:'#dcfce7', padding:'8px', borderRadius:'6px', fontSize:'12px', marginBottom:'8px'}}>Last Cloud Excel: <a href={lastExcelUrl} target="_blank" style={{color:'#1e3a8a', textDecoration:'underline'}}>{lastExcelUrl}</a></div>}
        
        <div style={{display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap'}}>
          <button onClick={()=>setTab('purchase')} style={{padding:'8px 16px', borderRadius:'6px', background: tab==='purchase'?'#1e3a8a':'white', color: tab==='purchase'?'white':'black', border:'1px solid #ddd'}}>Daily Purchase</button>
          <button onClick={()=>setTab('payment')} style={{padding:'8px 16px', borderRadius:'6px', background: tab==='payment'?'#1e3a8a':'white', color: tab==='payment'?'white':'black', border:'1px solid #ddd'}}>Daily Payment</button>
          <button onClick={()=>setTab('summary')} style={{padding:'8px 16px', borderRadius:'6px', background: tab==='summary'?'#1e3a8a':'white', color: tab==='summary'?'white':'black', border:'1px solid #ddd'}}>Outstanding Report</button>
          <button onClick={downloadMasterExcel} style={{marginLeft:'auto', background:'#16a34a', color:'white', padding:'10px 20px', borderRadius:'6px', fontWeight:'bold'}}>DOWNLOAD MASTER EXCEL</button>
        </div>

        {tab==='purchase' && (
          <div style={{background:'white', padding:'16px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'8px'}}>
              <input type="date" value={formP.date} onChange={e=>setFormP({...formP,date:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <div style={{position:'relative'}}>
                <input placeholder="Supplier - type MKM" value={formP.supplier} onChange={e=>{setFormP({...formP,supplier:e.target.value}); setShowSuppliersP(true);}} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px', width:'100%'}}/>
                {showSuppliersP && filteredSuppliers(formP.supplier).length>0 && (
                  <div style={{position:'absolute', background:'white', border:'1px solid #ddd', width:'100%', zIndex:10, maxHeight:'160px', overflow:'auto'}}>
                    {filteredSuppliers(formP.supplier).map(s=>(
                      <div key={s} onClick={()=>{setFormP({...formP,supplier:s}); setShowSuppliersP(false);}} style={{padding:'6px', cursor:'pointer', fontSize:'13px', borderBottom:'1px solid #eee'}}>{s}</div>
                    ))}
                  </div>
                )}
              </div>
              <input placeholder="Bill No" value={formP.billNo} onChange={e=>setFormP({...formP,billNo:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <input placeholder="Amount" type="number" value={formP.amount} onChange={e=>setFormP({...formP,amount:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <input placeholder="Entered By" value={formP.enteredBy} onChange={e=>setFormP({...formP,enteredBy:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <button onClick={addPurchase} style={{background:'#1e3a8a', color:'white', borderRadius:'6px', padding:'8px'}}>Add Purchase</button>
            </div>
            <table style={{width:'100%', marginTop:'16px', fontSize:'13px', borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#f1f5f9'}}><th style={{textAlign:'left', padding:'8px'}}>Date</th><th style={{textAlign:'left', padding:'8px'}}>Supplier</th><th style={{textAlign:'left', padding:'8px'}}>Bill No</th><th style={{textAlign:'left', padding:'8px'}}>Amount</th><th style={{textAlign:'left', padding:'8px'}}>Action</th></tr></thead>
              <tbody>{purchases.map(p=><tr key={p.id} style={{borderBottom:'1px solid #eee'}}><td style={{padding:'8px'}}>{p.date}</td><td style={{padding:'8px'}}>{p.supplier}</td><td style={{padding:'8px'}}>{p.billNo}</td><td style={{padding:'8px'}}>{p.amount}</td><td style={{padding:'8px'}}><button onClick={()=>setPurchases(purchases.filter(x=>x.id!==p.id))} style={{color:'red'}}>Delete</button></td></tr>)}</tbody>
            </table>
          </div>
        )}

        {tab==='payment' && (
          <div style={{background:'white', padding:'16px', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'8px'}}>
              <input type="date" value={formPay.date} onChange={e=>setFormPay({...formPay,date:e.target.value})} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px'}}/>
              <div style={{position:'relative'}}>
                <input placeholder="Supplier" value={formPay.supplier} onChange={e=>{setFormPay({...formPay,supplier:e.target.value}); setShowSuppliersPay(true);}} style={{border:'1px solid #ddd', padding:'8px', borderRadius:'6px', width:'100%'}}/>
                {showSuppliersPay && filteredSuppliers(formPay.supplier).length>0 && (
                  <div style={{position:'absolute', background:'white', border:'1px solid #ddd', width:'100%', zIndex:10}}>
                    {filteredSuppliers(formPay.supplier).map(s=>(
                      <div key={s} onClick={()=>{setFormPay({...formPay,supplier:s}); setShowSuppliersPay(false);}} style={{padding:'6px', cursor:'pointer', fontSize:'13px', borderBottom:'1px solid #eee'}}>{s}</div>
                    ))}
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
              <button onClick={addPayment} style={{background:'#1e3a8a', color:'white', borderRadius:'6px', padding:'8px'}}>Add Payment</button>
            </div>
            {showNeftWarning ? <div style={{color:'red', fontWeight:'bold', marginTop:'8px'}}>MUST DO NEFT - Amount greater than 5000</div> : null}
            <table style={{width:'100%', marginTop:'16px', fontSize:'13px', borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#f1f5f9'}}><th style={{textAlign:'left', padding:'8px'}}>Date</th><th style={{textAlign:'left', padding:'8px'}}>Supplier</th><th style={{textAlign:'left', padding:'8px'}}>Amount</th><th style={{textAlign:'left', padding:'8px'}}>Mode</th><th style={{textAlign:'left', padding:'8px'}}>Ref</th><th style={{textAlign:'left', padding:'8px'}}>Action</th></tr></thead>
              <tbody>{payments.map(p=><tr key={p.id} style={{borderBottom:'1px solid #eee'}}><td style={{padding:'8px'}}>{p.date}</td><td style={{padding:'8px'}}>{p.supplier}</td><td style={{padding:'8px'}}>{p.amount}</td><td style={{padding:'8px'}}>{p.mode}</td><td style={{padding:'8px'}}>{p.ref}</td><td style={{padding:'8px'}}><button onClick={()=>setPayments(payments.filter(x=>x.id!==p.id))} style={{color:'red'}}>Delete</button></td></tr>)}</tbody>
            </table>
          </div>
        )}

        {tab==='summary' && (
          <div style={{background:'white', padding:'16px', borderRadius:'8px'}}>
            <h2 style={{fontWeight:'bold', marginBottom:'8px'}}>Outstanding - No Opening (Purchase - Paid - Damage)</h2>
            <table style={{width:'100%', fontSize:'13px', borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#1e3a8a', color:'white'}}><th style={{padding:'8px', textAlign:'left'}}>Supplier</th><th style={{padding:'8px'}}>Purchase</th><th style={{padding:'8px'}}>Paid</th><th style={{padding:'8px'}}>Due</th></tr></thead>
              <tbody>
                {Object.keys(totals).filter(s=>totals[s].pur>0||totals[s].pay>0).map(s=>{
                  let dmg = s==='MKM TRADING COMPANY' ? 5000 : 0;
                  const due = totals[s].pur - totals[s].pay - dmg;
                  return <tr key={s} style={{borderBottom:'1px solid #eee'}}><td style={{padding:'8px'}}>{s}</td><td style={{padding:'8px', textAlign:'right'}}>{totals[s].pur.toFixed(2)}</td><td style={{padding:'8px', textAlign:'right'}}>{totals[s].pay.toFixed(2)}</td><td style={{padding:'8px', textAlign:'right', color: due>=0?'green':'red'}}>{due.toFixed(2)} {due>=0?'Cr':'Dr'}</td></tr>
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
