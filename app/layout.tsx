import "../styles/globals.css";
import { AuthProvider } from "../components/auth/AuthProvider";

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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
