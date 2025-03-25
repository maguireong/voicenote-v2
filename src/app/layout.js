import "./globals.css";

export const metadata = {
  title: "Recorder",
  description: "Re",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}