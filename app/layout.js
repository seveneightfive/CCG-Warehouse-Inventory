import "./globals.css";

export const metadata = {
  title: "CCG Warehouse",
  description: "Capital City Games & Music internal inventory app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
