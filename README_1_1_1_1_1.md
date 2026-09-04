
# Bala Sai Ledger - Vercel Deployment

## Steps to Deploy to Vercel with Auto-Updating Excel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/YOUR_USERNAME/bala-sai-ledger.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo `bala-sai-ledger`
3. Vercel will auto-detect Next.js - click Deploy
4. Go to Project Settings > Storage > Create Blob Store
5. Copy BLOB_READ_WRITE_TOKEN and add to Environment Variables in Vercel:
   - Key: BLOB_READ_WRITE_TOKEN
   - Value: vercel_blob_rw_xxx (from Blob store settings)
6. Redeploy

### 3. How Excel Auto-Update Works
- When staff adds purchase/payment in web portal and clicks "Save to Cloud & Update Excel"
- Frontend calls POST /api/ledger
- API creates Excel with 3 sheets using SheetJS:
  - Daily_Purchase
  - Daily_Payment  
  - Outstanding_No_Opening (Final Due = Purchase - Paid, No Opening)
- Saves to Vercel Blob Storage as ledger-data/ledger.xlsx (public URL)
- The blob URL is permanent: https://YOUR_BLOB_STORE.public.blob.vercel-storage.com/ledger-data/ledger.xlsx
- You can download anytime, or link it to Google Sheets via =IMPORTDATA

### 4. Auto-sync with your Master Excel
Option A - Manual: Download blob Excel daily and copy to your Master file's 02_MASTER_LEDGER_ENTRY rows 2449+

Option B - Automated (Recommended):
- In your Master Excel, add Power Query: Data > Get Data > From Web > Paste blob URL
- It will auto-pull daily entries

### 5. Local Development
```bash
npm install
npm run dev
# open http://localhost:3000
```

Need .env.local file with BLOB_READ_WRITE_TOKEN for local blob access.
For local dev without blob, it falls back to localStorage.

### 6. Cost
- Vercel Hobby: Free (100GB blob bandwidth)
- Blob Storage: Free 1GB

Your Excel will be permanently stored in cloud, auto-updated on every entry.
