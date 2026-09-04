
# Bala Sai - Live Master Excel Auto-Update via Google Drive

## Problem: You want entries to auto-update into your Master Ledger Excel (02_MASTER_LEDGER_ENTRY) and view via Google Drive

## Solution: Google Sheets + Apps Script (No VS Code needed)

### STEP 1: Upload Master Excel to Google Drive
1. Go to drive.google.com
2. Upload your file: Bala-Sai-IN-OUT-Master-Ledger-100PERCENT-FIXED-V3.xlsx
3. Right-click -> Open with Google Sheets
4. It will create Google Sheets version with all sheets: 01_SUPPLIER_MASTER, 02_MASTER_LEDGER_ENTRY, 06_DAILY_PURCHASE_ENTRY, 07_DAILY_CASH_PAYMENT_ENTRY
5. Rename it to "Bala Sai Master Live"
6. Copy its URL (you'll need it)

### STEP 2: Add Apps Script
1. In that Google Sheet, click Extensions -> Apps Script
2. Delete any code there, paste code from file Google_Apps_Script_Code.gs (in this zip)
3. Click Save (disk icon)
4. Click Deploy -> New Deployment
5. Type: Web App
6. Description: Bala Sai Ledger API
7. Execute as: Me
8. Who has access: Anyone
9. Click Deploy -> Authorize -> Allow
10. COPY the Web App URL (looks like https://script.google.com/macros/s/AKfycbx.../exec)

### STEP 3: Connect Vercel Portal to Google Sheet
1. Open your Vercel portal: https://bala-sai-in-out-ledger-3bvh.vercel.app
2. Go to Settings tab (top right)
3. Paste the Web App URL you copied
4. Click Save Sheet URL

### DONE!
Now when staff enters:
- Daily Purchase -> It appends row to 06_DAILY_PURCHASE_ENTRY sheet in Google Sheets
- Daily Payment -> It appends row to 07_DAILY_CASH_PAYMENT_ENTRY
- Your 02_MASTER_LEDGER_ENTRY auto-updates (because your Excel formulas already link daily sheets to master)
- Open Google Drive -> Open Sheet -> See live entries!

You can also File -> Download -> Microsoft Excel to get updated Excel file anytime.

### Vercel Deployment (for this new version)
Upload this zip contents to your GitHub repo (same as before), Vercel auto-deploys.
