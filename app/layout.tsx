import "../styles/globals.css";

export const metadata = {
  title: "Pomodoro MVP",
  description: "Simple Pomodoro App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
