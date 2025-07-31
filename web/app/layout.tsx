import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import MainNavigation from "./components/MainNavigation";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Califica tu profesor",
  description:
    "Califica a tus profesores y comparte tu experiencia con otros estudiantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="es">
        <body>
          <ToastContainer position="top-right" autoClose={3000} />
          <MainNavigation>{children}</MainNavigation>
        </body>
      </html>
    </AuthProvider>
  );
}
