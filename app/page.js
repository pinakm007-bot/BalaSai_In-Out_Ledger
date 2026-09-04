
'use client';
import { useState, useEffect } from 'react';

const SUPPLIERS = [
"AAWIN","AMBAL ENTERPRISES","ANNAMALAIYAR ENTERPRISES","BHARATH AQUA","BHAWAR SALES CORPORATION","BRANDBRIDGE NETWORKS PRIVATE LIMITED","D&S ENTERPRISES","DEVI AGENCIES","DHARMADEVI  AGENCY A2B","DHARMADEVI AGENCY","DKA AADARSHA AGENCY","GEETHA ENTERPRISES","GK FOODS","ID FRESH FOOD INDIA PVT LTD","INTELLIGENT RETAIL PRIVATE LIMITED","IRAIVI ENTERPRISES","IRAIVI ENTERPRISES NESTLE","JAI SADHAN ENTERPRISES","JAYANTHINATHAR AGENCY","KARPAGA VINAYAGAR ENTERPRISES","LRK ENTERPRISES","M K ENTERPRISES","MK ENTERPRISES OIL","MKM TRADING COMPANY","MUTHUMALAI AGENCY","NANDHINI TRADE NETWORK PRIVATE LIMITED","NELLAI KUTTAM SNACKS","RUPESH ENTERPRISES","SAARA ENTERPRISES","SAINT GEORGE TRADERS","SAKTHI AGENCIES MT","SARAVANA ENTERPRISES","SCOOTSY LOGISTICS PRIVATE LIMITED","SCOOTSY LOGISTICS PRIVATE LIMITED (HOUSEHOLDS)","SCOOTSY LOGISTICS PRIVATE LIMITED [ BISCUTS]","SERAPHINE DEV IMPEX PVT.LTD","SEVVEL AGENCY","SRI GOLDEN","SRI GOLDEN  KELLOGGS","SRI GOLDEN AGENCY","SRI GOLDEN AGENCY ELITE","SRI JAYALAKSHMI ENTERPRISE","SRI MURUGUVEL ENTERPRISES","SRI RAM TRADERS","SRI SAKTHI VINAYAGAR AGENCY","SRI SHASTA ENTERPRISES","SRI SRINIVASA AGENCIES ALPENLIEBE","SRI SRINIVASA AGENCIES LOTTE CHOCOPIE"
];

export default function Page() {
  const [tab, setTab] = useState('purchase');
  const [purchases, setPurchases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [formP, setFormP] = useState({date: new Date().toISOString().slice(0,10), supplier:'', billNo:'', amount:'', particulars:'', enteredBy:''});
  const [formPay, setFormPay] = useState({date: new Date().toISOString().slice(0,10), supplier:'', amount:'', mode:'NEFT - Online', ref:'', enteredBy:''});
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const saved = localStorage.getItem('bala_purchases');
    if(saved) setPurchases(JSON.parse(saved));
    const saved2 = localStorage.getItem('bala_payments');
    if(saved2) setPayments(JSON.parse(saved2));
    // Load from Vercel Blob API
    fetch('/api/ledger').then(r=>r.json()).then(d=>{
      if(d.purchases) setPurchases(d.purchases);
      if(d.payments) setPayments(d.payments);
    }).catch(()=>{});
  },[]);

  useEffect(()=>{ localStorage.setItem('bala_purchases', JSON.stringify(purchases)); },[purchases]);
  useEffect(()=>{ localStorage.setItem('bala_payments', JSON.stringify(payments)); },[payments]);

  const saveToCloud = async () => {
    setLoading(true);
    await fetch('/api/ledger', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({purchases, payments})});
    setLoading(false);
    alert('Saved to Vercel Cloud - Excel auto-updated!');
  };

  const filteredSuppliers = (input) => SUPPLIERS.filter(s=> s.toLowerCase().includes(input.toLowerCase())).slice(0,10);

  const addPurchase = () => {
    if(!formP.supplier || !formP.amount) return alert('Supplier & Amount required');
    setPurchases([...purchases, {...formP, id: Date.now(), amount: parseFloat(formP.amount)}]);
    setFormP({...formP, billNo:'', amount:'', particulars:''});
  };
  const addPayment = () => {
    if(!formPay.supplier || !formPay.amount) return alert('Supplier & Amount required');
    setPayments([...payments, {...formPay, id: Date.now(), amount: parseFloat(formPay.amount)}]);
    setFormPay({...formPay, amount:'', ref:''});
  };

  const totals = {};
  SUPPLIERS.forEach(s=> totals[s]={pur:0, pay:0});
  purchases.forEach(p=> { if(totals[p.supplier]) totals[p.supplier].pur+=p.amount; });
  payments.forEach(p=> { if(totals[p.supplier]) totals[p.supplier].pay+=p.amount; });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-900">Bala Sai Narayana Agencies - Daily Entry Portal</h1>
        <p className="text-sm text-gray-600 mb-4">Vercel Deployed - Excel auto-updates in Blob Storage</p>
        
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setTab('purchase')} className={`px-4 py-2 rounded ${tab==='purchase'?'bg-blue-900 text-white':'bg-white'}`}>Daily Purchase</button>
          <button onClick={()=>setTab('payment')} className={`px-4 py-2 rounded ${tab==='payment'?'bg-blue-900 text-white':'bg-white'}`}>Daily Payment</button>
          <button onClick={()=>setTab('summary')} className={`px-4 py-2 rounded ${tab==='summary'?'bg-blue-900 text-white':'bg-white'}`}>Outstanding Report</button>
          <button onClick={saveToCloud} className="ml-auto bg-green-600 text-white px-4 py-2 rounded">{loading?'Saving...':'Save to Cloud & Update Excel'}</button>
        </div>

        {tab==='purchase' && (
          <div className="bg-white p-4 rounded shadow">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <input type="date" value={formP.date} onChange={e=>setFormP({...formP,date:e.target.value})} className="border p-2 rounded"/>
              <div className="relative">
                <input placeholder="Supplier - type MKM" value={formP.supplier} onChange={e=>setFormP({...formP,supplier:e.target.value})} className="border p-2 rounded w-full"/>
                {formP.supplier && <div className="absolute bg-white border w-full z-10 max-h-40 overflow-auto">
                  {filteredSuppliers(formP.supplier).map(s=><div key={s} onClick={()=>setFormP({...formP,supplier:s})} className="p-1 hover:bg-blue-100 cursor-pointer text-sm">{s}</div>)}
                </div>}
              </div>
              <input placeholder="Bill No" value={formP.billNo} onChange={e=>setFormP({...formP,billNo:e.target.value})} className="border p-2 rounded"/>
              <input placeholder="Amount" type="number" value={formP.amount} onChange={e=>setFormP({...formP,amount:e.target.value})} className="border p-2 rounded"/>
              <input placeholder="Entered By" value={formP.enteredBy} onChange={e=>setFormP({...formP,enteredBy:e.target.value})} className="border p-2 rounded"/>
              <button onClick={addPurchase} className="bg-blue-900 text-white rounded">Add Purchase</button>
            </div>
            <table className="w-full mt-4 text-sm">
              <thead><tr className="bg-gray-100"><th>Date</th><th>Supplier</th><th>Bill No</th><th>Amount</th><th>Action</th></tr></thead>
              <tbody>{purchases.map(p=><tr key={p.id} className="border-b"><td>{p.date}</td><td>{p.supplier}</td><td>{p.billNo}</td><td>{p.amount}</td><td><button onClick={()=>setPurchases(purchases.filter(x=>x.id!==p.id))} className="text-red-600">Delete</button></td></tr>)}</tbody>
            </table>
          </div>
        )}

        {tab==='payment' && (
          <div className="bg-white p-4 rounded shadow">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <input type="date" value={formPay.date} onChange={e=>setFormPay({...formPay,date:e.target.value})} className="border p-2 rounded"/>
              <div className="relative">
                <input placeholder="Supplier" value={formPay.supplier} onChange={e=>setFormPay({...formPay,supplier:e.target.value})} className="border p-2 rounded w-full"/>
                {formPay.supplier && <div className="absolute bg-white border w-full z-10">
                  {filteredSuppliers(formPay.supplier).map(s=><div key={s} onClick={()=>setFormPay({...formPay,supplier:s})} className="p-1 hover:bg-blue-100 cursor-pointer text-sm">{s}</div>)}
                </div>}
              </div>
              <input placeholder="Amount" type="number" value={formPay.amount} onChange={e=>setFormPay({...formPay,amount:e.target.value})} className="border p-2 rounded"/>
              <select value={formPay.mode} onChange={e=>setFormPay({...formPay,mode:e.target.value})} className="border p-2 rounded"><option>Cash - Store</option><option>NEFT - Online</option><option>Online - Bank</option><option>Indian Bank</option></select>
              <input placeholder="UTR/Ref" value={formPay.ref} onChange={e=>setFormPay({...formPay,ref:e.target.value})} className="border p-2 rounded"/>
              <button onClick={addPayment} className="bg-blue-900 text-white rounded">Add Payment</button>
            </div>
            {parseFloat(formPay.amount)>5000 && formPay.mode==='Cash - Store' && <div className="text-red-600 font-bold mt-2">⚠️ MUST DO NEFT - Amount >5000</div>}
            <table className="w-full mt-4 text-sm">
              <thead><tr className="bg-gray-100"><th>Date</th><th>Supplier</th><th>Amount</th><th>Mode</th><th>Ref</th><th>Action</th></tr></thead>
              <tbody>{payments.map(p=><tr key={p.id} className="border-b"><td>{p.date}</td><td>{p.supplier}</td><td>{p.amount}</td><td>{p.mode}</td><td>{p.ref}</td><td><button onClick={()=>setPayments(payments.filter(x=>x.id!==p.id))} className="text-red-600">Delete</button></td></tr>)}</tbody>
            </table>
          </div>
        )}

        {tab==='summary' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Final Report - No Opening (Purchase - Payment = Due)</h2>
            <table className="w-full text-sm">
              <thead><tr className="bg-blue-900 text-white"><th className="p-2 text-left">Supplier</th><th>Purchase</th><th>Paid</th><th>Due</th></tr></thead>
              <tbody>{Object.keys(totals).filter(s=>totals[s].pur>0||totals[s].pay>0).map(s=>{
                const due = totals[s].pur - totals[s].pay;
                return <tr key={s} className="border-b"><td className="p-2">{s}</td><td>{totals[s].pur.toFixed(2)}</td><td>{totals[s].pay.toFixed(2)}</td><td className={due>=0?'text-green-700':'text-red-700'}>{due.toFixed(2)} {due>=0?'Cr':'Dr'}</td></tr>
              })}</tbody>
            </table>
            <div className="mt-4 p-2 bg-yellow-100 text-sm">For MKM: Purchase 13,76,655 - Paid 12,04,065.79 - Damage 5,000 = Due 1,67,589.21 (No Opening)</div>
          </div>
        )}
      </div>
    </div>
  );
}
