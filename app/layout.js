import "./globals.css";
import BottomNav from "../components/BottomNav";

export const metadata = {
  title: "CCG Warehouse",
  description: "Capital City Games & Music internal inventory app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CCG Warehouse",
  },
};

export const viewport = {
  themeColor: "#0d1220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/capital-icon.png" />
      </head>
      <body>
        {children}
        <BottomNav />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}