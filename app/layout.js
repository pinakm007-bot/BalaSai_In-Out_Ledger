
export const metadata = { title: 'Bala Sai Ledger Portal', description: 'Daily Purchase & Payment Entry' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0, fontFamily:'Inter, system-ui'}}>{children}</body>
    </html>
  );
}
